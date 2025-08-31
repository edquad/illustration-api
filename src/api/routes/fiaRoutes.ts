import express from 'express';
import { calculateFiaIllustration } from '../services/fiaCalculationService';

const router = express.Router();

// FIA calculation endpoint
router.post('/calculate', calculateFiaIllustration);

export default router;