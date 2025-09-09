// controllers/profileController.js
import pool from "../config/db.js";


export const saveProfile = async (req, res) => {
  console.log("saveProfile called with body:", req.body);
  try {
    const {
      name,
      district,
      village,
      preferred_language = "ml",
      crops,
      user_id,
      phone,
    } = req.body || {};

    console.log("Parsed fields:", { name, district, village, preferred_language, crops, user_id, phone });

    // Basic validation
    if (!name || !district || !village) {
      return res.status(400).json({
        success: false,
        message: "name, district and village are required",
      });
    }

    // Determine user_id
    let resolvedUserId = user_id || null;

    if (!resolvedUserId) {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "user_id or phone is required to link profile to a user",
        });
      }

      // lookup user by phone
      const userQ = await pool.query(
        "SELECT id FROM users WHERE phone = $1 LIMIT 1",
        [String(phone).trim()]
      );

      if (userQ.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User not found. Please signup or login first.",
        });
      }

      resolvedUserId = userQ.rows[0].id;
      console.log("Resolved user_id from phone:", resolvedUserId);
    } else {
      // verify provided user_id exists (optional safety)
      const userQ = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [
        resolvedUserId,
      ]);
      if (userQ.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Provided user_id does not exist.",
        });
      }
    }

    // Insert into profiles
    const insertQ = `
      INSERT INTO profiles (user_id, name, village, district, preferred_language, crops)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, name, village, district, preferred_language, crops, created_at
    `;
    const values = [
      resolvedUserId,
      String(name).trim(),
      String(village).trim(),
      String(district).trim(),
      String(preferred_language).trim(),
      String(crops || "").trim(),
    ];

    const result = await pool.query(insertQ, values);
    const profile = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Profile saved",
      profile,
    });
  } catch (err) {
    console.error("saveProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: String(err.message || err) });
  }
};
