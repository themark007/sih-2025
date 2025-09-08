// routes/authRoutes.js (or signupRoutes.js)
import express from 'express';
import { sendOtp, verifyOtp, loginSendOtp, loginVerifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup/send-otp', sendOtp);
router.post('/signup/verify-otp', verifyOtp);

router.post('/login/send-otp', loginSendOtp);
router.post('/login/verify-otp', loginVerifyOtp);

export default router;
