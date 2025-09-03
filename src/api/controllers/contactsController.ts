import { Request, Response } from "express";
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getAllBusinessTypes,
  getAllProductTypes,
  Contact,
  ContactInput,
} from "../services/contactsService";

export class ContactsController {
  // Get all contacts
  async getAllContacts(req: Request, res: Response) {
    try {
      const result = await getAllContacts();
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Get contact by ID
  async getContactById(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const result = await getContactById(contactId);
      if (!result) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching contact:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Create new contact 
  async createContact(req: Request, res: Response) {
    try {
      const contactData: ContactInput = req.body;
      const result = await createContact(contactData);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating contact:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Update contact
  async updateContact(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      const contactData: Partial<ContactInput> = req.body;
      const result = await updateContact(contactId, contactData);
      return res.json(result);
    } catch (error: any) {
      console.error("Error updating contact:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Delete contact
  async deleteContact(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      await deleteContact(contactId);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Get all business types
  async getAllBusinessTypes(req: Request, res: Response) {
    try {
      const result = await getAllBusinessTypes();
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching business types:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Get all product types
  async getAllProductTypes(req: Request, res: Response) {
    try {
      const result = await getAllProductTypes();
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching product types:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }
}

const contactsController = new ContactsController();
export default contactsController;