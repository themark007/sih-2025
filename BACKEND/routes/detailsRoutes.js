// routes/detailsRoutes.js
import express from "express";
import { saveProfile } from "../controllers/profilecontroller.js";

const router = express.Router();

// POST /api/details
router.post("/save", saveProfile);

export default router;
