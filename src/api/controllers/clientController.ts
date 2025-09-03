import { Request, Response } from "express";
import clientService, { ClientInfo } from "../services/clientService";

// Interface matching your Python ClientProfile model
interface Client {
  id?: number;
  first_name: string;
  last_name: string;
  gender: string;
  birthday: string;
  state: string;
  premium: string;
  phone_number: string;
  email: string;
  first_term: number;
  second_term: number;
  tax_qualification: string;
  withdrawal_type: string;
  withdrawal_amount: string;
  withdrawal_from_year: number;
  withdrawal_to_year: number;
  frequency?: number;
  glwb?: boolean;
  glwb_activation_age?: number;
  joint_indicator?: string;
}

class ClientController {
  async getAllClients(req: Request, res: Response): Promise<void> {
    try {
      // In Python: user=request.user filter
      // For now, return all clients (you can add user filtering later)
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  async getClientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await clientService.getClientById(parseInt(id));

      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  }

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const clientData: Client = req.body;
      const newClient = await clientService.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  }

  async updateClient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clientData: Client = req.body;
      const updatedClient = await clientService.updateClient(
        parseInt(id),
        clientData
      );

      if (!updatedClient) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      res.json(updatedClient);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  }

  async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientService.deleteClient(parseInt(id));

      if (!deleted) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  }

  // CLIENT_INFO methods
  async getAllClientInfo(req: Request, res: Response): Promise<void> {
    try {
      const clientInfos = await clientService.getAllClientInfo();
      res.json({
        status: "success",
        data: clientInfos,
        count: clientInfos.length
      });
    } catch (error: any) {
      console.error("Error fetching client info:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to fetch client info",
        details: error.message 
      });
    }
  }

  async getClientInfoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clientInfo = await clientService.getClientInfoById(parseInt(id));

      if (!clientInfo) {
        res.status(404).json({ 
          status: "error",
          error: "Client info not found" 
        });
        return;
      }

      res.json({
        status: "success",
        data: clientInfo
      });
    } catch (error: any) {
      console.error("Error fetching client info by ID:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to fetch client info",
        details: error.message 
      });
    }
  }

  async getClientInfoByIllustrationId(req: Request, res: Response): Promise<void> {
    try {
      const { illustrationId } = req.params;
      const clientInfos = await clientService.getClientInfoByIllustrationId(illustrationId);

      res.json({
        status: "success",
        data: clientInfos,
        count: clientInfos.length
      });
    } catch (error: any) {
      console.error("Error fetching client info by illustration ID:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to fetch client info",
        details: error.message 
      });
    }
  }

  async createClientInfo(req: Request, res: Response): Promise<void> {
    try {
      const clientData: ClientInfo = req.body;

      // Validate required fields
      if (!clientData.FIRST_NAME || !clientData.LAST_NAME) {
        res.status(400).json({ 
          status: "error",
          error: "FIRST_NAME and LAST_NAME are required" 
        });
        return;
      }

      const newClientInfo = await clientService.createClientInfo(clientData);
      
      res.status(201).json({
        status: "success",
        message: "Client info created successfully",
        data: newClientInfo
      });
    } catch (error: any) {
      console.error("Error creating client info:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to create client info",
        details: error.message 
      });
    }
  }

  async updateClientInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clientData: ClientInfo = req.body;

      // Validate required fields
      if (!clientData.FIRST_NAME || !clientData.LAST_NAME) {
        res.status(400).json({ 
          status: "error",
          error: "FIRST_NAME and LAST_NAME are required" 
        });
        return;
      }

      const updatedClientInfo = await clientService.updateClientInfo(parseInt(id), clientData);
      
      if (!updatedClientInfo) {
        res.status(404).json({ 
          status: "error",
          error: "Client info not found" 
        });
        return;
      }

      res.json({
        status: "success",
        message: "Client info updated successfully",
        data: updatedClientInfo
      });
    } catch (error: any) {
      console.error("Error updating client info:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to update client info",
        details: error.message 
      });
    }
  }

  async deleteClientInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientService.deleteClientInfo(parseInt(id));
      
      if (!deleted) {
        res.status(404).json({ 
          status: "error",
          error: "Client info not found" 
        });
        return;
      }

      res.json({
        status: "success",
        message: "Client info deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting client info:", error);
      res.status(500).json({ 
        status: "error",
        error: "Failed to delete client info",
        details: error.message 
      });
    }
  }

  async getTermDetails(req: Request, res: Response): Promise<void> {
    try {
      const termDetails = await clientService.getTermDetails();
      res.json(termDetails);
    } catch (error) {
      console.error("Error fetching term details:", error);
      res.status(500).json({ error: "Failed to fetch term details" });
    }
  }

  async getTaxQualificationDetails(req: Request, res: Response): Promise<void> {
    try {
      const taxQualificationDetails =
        await clientService.getTaxQualificationDetails();
      res.json(taxQualificationDetails);
    } catch (error) {
      console.error("Error fetching tax qualification details:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch tax qualification details" });
    }
  }

  async getWithdrawalTypeDetails(req: Request, res: Response): Promise<void> {
    try {
      const withdrawalTypeDetails =
        await clientService.getWithdrawalTypeDetails();
      res.json(withdrawalTypeDetails);
    } catch (error) {
      console.error("Error fetching withdrawal type details:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch withdrawal type details" });
    }
  }

  async getStateProductAvailability(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { stateCode } = req.body;
      if (!stateCode) {
        res.status(400).json({ error: "State code is required" });
        return;
      }

      const stateProductAvailability =
        await clientService.getStateProductAvailability(stateCode);
      res.json(stateProductAvailability);
    } catch (error) {
      console.error("Error fetching state product availability:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch state product availability" });
    }
  }

  async getFiaAllocation(req: Request, res: Response): Promise<void> {
    try {
      const fiaAllocation = await clientService.getFiaAllocation();
      res.json(fiaAllocation);
    } catch (error) {
      console.error("Error fetching FIA allocation:", error);
      res.status(500).json({ error: "Failed to fetch FIA allocation" });
    }
  }
}

export default new ClientController();