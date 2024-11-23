import express from 'express';
import { registerParticipant, getParticipantsByEvent } from '../controllers/participantController';

const router = express.Router();

router.post('/:id/signup', registerParticipant); // Sign up a participant for an event
router.get('/:id/participants', getParticipantsByEvent); // Get all participants for a specific event

export default router;
