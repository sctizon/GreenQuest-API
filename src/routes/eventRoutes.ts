import express from 'express';
import { createEvent, getAllEvents, getCoordinates, getEventById } from '../controllers/eventController';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/', upload.single('image'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.get('/coordinates', getCoordinates);

export default router;
