import express from 'express';
import { createEvent, getAllEvents, getEventById } from '../controllers/eventController';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/', upload.single('image'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);

export default router;
