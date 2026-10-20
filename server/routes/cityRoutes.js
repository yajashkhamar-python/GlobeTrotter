import express from 'express';
import { getCities, getCityById } from '../controllers/cityController.js';
import { getCityActivities } from '../controllers/activityController.js';

const router = express.Router();

router.get('/', getCities);
router.get('/:id', getCityById);
router.get('/:cityId/activities', getCityActivities);

export default router;
