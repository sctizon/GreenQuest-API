import express from 'express';
import { loginUser, registerUser, getUserProfile } from '../controllers/userController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);

export default router;
