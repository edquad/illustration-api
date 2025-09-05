import { Router } from 'express';
import chatbotController from '../controllers/chatbotController';

const router = Router();

// POST /api/chatbot/form-autofill - Get form autofill suggestions from chatbot
router.post(
  '/form-autofill',
  chatbotController.formAutofill.bind(chatbotController)
);

export default router;