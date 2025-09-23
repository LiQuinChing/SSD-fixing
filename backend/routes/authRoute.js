import express from "express";
import { signup, login, googleAuth } from '../controllers/authController.js';
const router = express.Router();

router.post('/signup', signup)
router.post('/login', login)

// NEW: Google endpoint
router.post('/google', googleAuth);

export default router;