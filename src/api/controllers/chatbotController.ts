import { Request, Response } from 'express';
import chatbotService, { ChatbotRequest } from '../services/chatbotService';

export class ChatbotController {
  async formAutofill(req: Request, res: Response) {
    try {
      const { conversation }: ChatbotRequest = req.body;
      
      if (!conversation) {
        return res.status(400).json({ 
          error: 'Conversation is required' 
        });
      }

      if (typeof conversation !== 'string') {
        return res.status(400).json({ 
          error: 'Conversation must be a string' 
        });
      }

      const result = await chatbotService.getFormAutofill(conversation);
      
      return res.json(result);
    } catch (error: any) {
      console.error('Error in chatbot form autofill:', error);
      
      return res.status(500).json({ 
        error: error.message || 'Internal Server Error',
        details: 'Failed to process chatbot request'
      });
    }
  }
}

const chatbotController = new ChatbotController();
export default chatbotController;