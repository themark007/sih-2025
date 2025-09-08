// controllers/authController.js (or your existing controller file)
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { Strategy } from 'passport-google-oauth2';
import dotenv from 'dotenv';
import Twilio from 'twilio';

dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  OTP_TTL_SECONDS = 300,
  OTP_LENGTH = 6
} = process.env;

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

if (!twilioClient) {
  console.warn('Twilio client not initialized. Make sure TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN are set for sending OTPs.');
}

// In-memory OTP store (phone -> entry)
const otpStore = new Map();
// Entry: { code, expiresAt(ms), attempts, requestCount, createdAt(ms), blockUntil(ms?) }

// periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt <= now) otpStore.delete(phone);
  }
}, 60 * 1000);

// helpers
function generateOtp(len = Number(OTP_LENGTH)) {
  const digits = '0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += digits[Math.floor(Math.random() * digits.length)];
  return s;
}

async function sendWhatsAppViaTwilio(toPhone, text) {
  if (!twilioClient) throw new Error('Twilio not configured');
  const from = TWILIO_WHATSAPP_FROM; // should include 'whatsapp:' prefix, e.g. 'whatsapp:+14155238886'
  const to = `whatsapp:${toPhone}`;
  const msg = await twilioClient.messages.create({ from, to, body: text });
  return msg.sid;
}

/**
 * POST /signup/send-otp
 * Body: { phone }
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone: phoneRaw } = req.body || {};
    if (!phoneRaw) return res.status(400).json({ success: false, message: 'phone is required' });

    const phone = String(phoneRaw).trim();

    // 1) check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (userCheck.rows.length > 0) {
      return res.status(200).json({ success: false, message: 'Login already exists' });
    }

    // 2) rate limiting / basic abuse protection (in-memory)
    const existing = otpStore.get(phone);
    const now = Date.now();

    if (existing) {
      // if temporarily blocked
      if (existing.blockUntil && now < existing.blockUntil) {
        return res.status(429).json({ success: false, message: 'Too many OTP requests. Try later.' });
      }
      // allow up to 5 requests within TTL window
      if ((existing.requestCount || 0) >= 5) {
        existing.blockUntil = now + 15 * 60 * 1000; // block 15 minutes
        return res.status(429).json({ success: false, message: 'Too many OTP requests. Try later.' });
      }
    }

    // generate OTP and store in memory
    const code = generateOtp();
    const ttlMs = Number(OTP_TTL_SECONDS) * 1000;
    const expiresAt = Date.now() + ttlMs;

    const entry = {
      code,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      requestCount: (existing?.requestCount || 0) + 1
    };
    otpStore.set(phone, entry);

    const minutes = Math.ceil(Number(OTP_TTL_SECONDS) / 60);
    const text = `Your verification code is ${code}. It expires in ${minutes} minute(s).`;

    try {
      const sid = await sendWhatsAppViaTwilio(phone, text);
      return res.status(200).json({ success: false, message: 'otp_sent', twilio_sid: sid || null });
    } catch (err) {
      // cleanup on failure
      otpStore.delete(phone);
      console.error('Twilio send error:', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, message: 'Failed to send OTP', error: String(err.message || err) });
    }

  } catch (err) {
    console.error('sendOtp error', err);
    return res.status(500).json({ success: false, message: 'server error', error: String(err.message || err) });
  }
};

/**
 * POST /signup/verify-otp
 * Body: { phone, otp }
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone: phoneRaw, otp: providedOtp } = req.body || {};
    if (!phoneRaw || !providedOtp) return res.status(400).json({ success: false, message: 'phone and otp are required' });

    const phone = String(phoneRaw).trim();
    const provided = String(providedOtp).trim();

    // check existing user again (race)
    const userCheck = await pool.query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (userCheck.rows.length > 0) {
      // user already exists
      otpStore.delete(phone); // cleanup any OTP for safety
      return res.status(200).json({ success: false, message: 'Login already exists' });
    }

    const entry = otpStore.get(phone);
    if (!entry) return res.status(400).json({ success: false, message: 'No active OTP or OTP expired' });

    const now = Date.now();
    if (entry.expiresAt <= now) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // attempts limit
    entry.attempts = (entry.attempts || 0) + 1;
    if (entry.attempts > 5) {
      otpStore.delete(phone);
      return res.status(429).json({ success: false, message: 'Too many attempts. Request new OTP.' });
    }

    if (entry.code === provided) {
      // create user (role defaults to 'farmer' per schema)
      try {
        await pool.query('INSERT INTO users (phone) VALUES ($1)', [phone]);
      } catch (dbErr) {
        console.error('DB insert user error:', dbErr);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }
      otpStore.delete(phone);
      return res.status(200).json({ success: true  });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

  } catch (err) {
    console.error('verifyOtp error', err);
    return res.status(500).json({ success: false, message: 'server error', error: String(err.message || err) });
  }
};



/**
 * POST /login/send-otp
 * Body: { phone }
 *
 * - If user not exists -> { success: false, message: 'User not found, please signup' }
 * - If exists -> generate OTP, send via Twilio, return { success: false, message: 'otp_sent' }
 */
export const loginSendOtp = async (req, res) => {
  try {
    const { phone: phoneRaw } = req.body || {};
    if (!phoneRaw) return res.status(400).json({ success: false, message: 'phone is required' });

    const phone = String(phoneRaw).trim();

    // Check user exists
    const userQ = await pool.query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (userQ.rows.length === 0) {
      return res.status(200).json({ success: false, message: 'User not found, please signup' });
    }

    // Rate limiting (reuse same in-memory scheme)
    const existing = otpStore.get(phone);
    const now = Date.now();
    if (existing) {
      if (existing.blockUntil && now < existing.blockUntil) {
        return res.status(429).json({ success: false, message: 'Too many OTP requests. Try later.' });
      }
      if ((existing.requestCount || 0) >= 5) {
        existing.blockUntil = now + 15 * 60 * 1000;
        return res.status(429).json({ success: false, message: 'Too many OTP requests. Try later.' });
      }
    }

    const code = generateOtp();
    const ttlMs = Number(OTP_TTL_SECONDS) * 1000;
    const expiresAt = Date.now() + ttlMs;
    const entry = {
      code,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      requestCount: (existing?.requestCount || 0) + 1
    };
    otpStore.set(phone, entry);

    const minutes = Math.ceil(Number(OTP_TTL_SECONDS) / 60);
    const text = `Your login verification code is ${code}. It expires in ${minutes} minute(s).`;

    try {
      const sid = await sendWhatsAppViaTwilio(phone, text);
      return res.status(200).json({ success: false, message: 'otp_sent', twilio_sid: sid || null });
    } catch (err) {
      otpStore.delete(phone);
      console.error('Twilio send error (loginSendOtp):', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, message: 'Failed to send OTP', error: String(err.message || err) });
    }

  } catch (err) {
    console.error('loginSendOtp error', err);
    return res.status(500).json({ success: false, message: 'server error', error: String(err.message || err) });
  }
};

/**
 * POST /login/verify-otp
 * Body: { phone, otp }
 *
 * - If user missing -> { success: false, message: 'User not found, please signup' }
 * - If OTP correct -> { success: true, user: { id, phone, role } }
 */
export const loginVerifyOtp = async (req, res) => {
  try {
    const { phone: phoneRaw, otp: providedOtp } = req.body || {};
    if (!phoneRaw || !providedOtp) return res.status(400).json({ success: false, message: 'phone and otp are required' });

    const phone = String(phoneRaw).trim();
    const provided = String(providedOtp).trim();

    // Ensure user still exists
    const userQ = await pool.query('SELECT id, phone, role FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (userQ.rows.length === 0) {
      // cleanup any otp entry for security
      otpStore.delete(phone);
      return res.status(200).json({ success: false, message: 'User not found, please signup' });
    }
    const user = userQ.rows[0];

    const entry = otpStore.get(phone);
    if (!entry) return res.status(400).json({ success: false, message: 'No active OTP or OTP expired' });

    const now = Date.now();
    if (entry.expiresAt <= now) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // attempts limit
    entry.attempts = (entry.attempts || 0) + 1;
    if (entry.attempts > 5) {
      otpStore.delete(phone);
      return res.status(429).json({ success: false, message: 'Too many attempts. Request new OTP.' });
    }

    if (entry.code === provided) {
      // success: clean up OTP and return user info
      otpStore.delete(phone);
      // You can also issue a session / JWT here
      return res.status(200).json({ success: true, user: { id: user.id, phone: user.phone, role: user.role } });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

  } catch (err) {
    console.error('loginVerifyOtp error', err);
    return res.status(500).json({ success: false, message: 'server error', error: String(err.message || err) });
  }
};
