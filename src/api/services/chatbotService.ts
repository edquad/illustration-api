import axios from 'axios';

export interface ChatbotRequest {
  conversation: string;
}

export interface ChatbotResponse {
  // Define the expected response structure from Python API
  [key: string]: any;
}

export class ChatbotService {
  private readonly pythonApiUrl = 'http://localhost:5000';

  async getFormAutofill(conversation: string): Promise<ChatbotResponse> {
    try
      const response = await axios.post(`${this.pythonApiUrl}/api/form-autofill`, {
        conversation
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      return response.data;
    } catch (error: any) {
      console.error('Error calling Python API:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Python API is not available. Please ensure the illustration-prompt service is running on port 5000.');
      }
      
      if (error.response) {
        throw new Error(`Python API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      }
      
      throw new Error(`Failed to communicate with Python API: ${error.message}`);
    }
  }
}

const chatbotService = new ChatbotService();
export default chatbotService;