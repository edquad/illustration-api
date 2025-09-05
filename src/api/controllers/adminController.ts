import { Request, Response } from "express";
import adminService, { ProductInput } from "../services/adminService";

export class AdminController {
  // Get all products
  async getAllProducts(req: Request, res: Response) {
    try {
      const result = await adminService.getAllProducts();
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const result = await adminService.getProductById(productId);
      
      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      return res.json(result);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Create new product
  async createProduct(req: Request, res: Response) {
    try {
      const productData: ProductInput = req.body;
      
      if (!productData.PRODUCT || productData.PRODUCT.trim() === "") {
        return res.status(400).json({ error: "Product name is required" });
      }

      const result = await adminService.createProduct(productData);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating product:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      const productData: ProductInput = req.body;
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      if (!productData.PRODUCT || productData.PRODUCT.trim() === "") {
        return res.status(400).json({ error: "Product name is required" });
      }

      const result = await adminService.updateProduct(productId, productData);
      
      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      return res.json(result);
    } catch (error: any) {
      console.error("Error updating product:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const success = await adminService.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      return res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  // Toggle product status
  async toggleProductStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }

      const result = await adminService.toggleProductStatus(productId, isActive);
      
      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      return res.json(result);
    } catch (error: any) {
      console.error("Error toggling product status:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  async getAllTerms(req: Request, res: Response): Promise<void> {
    try {
      const terms = await adminService.getAllTerms();
      res.json(terms);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  }

  async getTermById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid term ID" });
        return;
      }

      const term = await adminService.getTermById(id);
      if (!term) {
        res.status(404).json({ error: "Term not found" });
        return;
      }

      res.json(term);
    } catch (error) {
      console.error("Error fetching term:", error);
      res.status(500).json({ error: "Failed to fetch term" });
    }
  }

  async createTerm(req: Request, res: Response): Promise<void> {
    try {
      const { TERM_DETAILS_VALUE } = req.body;

      if (!TERM_DETAILS_VALUE || typeof TERM_DETAILS_VALUE !== "string") {
        res.status(400).json({ error: "Term details value is required" });
        return;
      }

      const termData = { TERM_DETAILS_VALUE };
      const newTerm = await adminService.createTerm(termData);
      res.status(201).json(newTerm);
    } catch (error) {
      console.error("Error creating term:", error);
      res.status(500).json({ error: "Failed to create term" });
    }
  }

  async updateTerm(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { TERM_DETAILS_VALUE, IS_ACTIVE } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid term ID" });
        return;
      }

      if (!TERM_DETAILS_VALUE || typeof TERM_DETAILS_VALUE !== "string") {
        res.status(400).json({ error: "Term details value is required" });
        return;
      }

      if (typeof IS_ACTIVE !== "boolean") {
        res.status(400).json({ error: "IS_ACTIVE must be a boolean" });
        return;
      }

      const termData = { TERM_DETAILS_VALUE, IS_ACTIVE };
      const updatedTerm = await adminService.updateTerm(id, termData);

      if (!updatedTerm) {
        res.status(404).json({ error: "Term not found" });
        return;
      }

      res.json(updatedTerm);
    } catch (error) {
      console.error("Error updating term:", error);
      res.status(500).json({ error: "Failed to update term" });
    }
  }

  async deleteTerm(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid term ID" });
        return;
      }

      const success = await adminService.deleteTerm(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Term not found" });
      }
    } catch (error) {
      console.error("Error deleting term:", error);
      res.status(500).json({ error: "Failed to delete term" });
    }
  }

  async toggleTermStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid term ID" });
        return;
      }

      if (typeof isActive !== "boolean") {
        res.status(400).json({ error: "isActive must be a boolean" });
        return;
      }

      const updatedTerm = await adminService.toggleTermStatus(id, isActive);
      if (!updatedTerm) {
        res.status(404).json({ error: "Term not found" });
        return;
      }

      res.json(updatedTerm);
    } catch (error) {
      console.error("Error toggling term status:", error);
      res.status(500).json({ error: "Failed to update term status" });
    }
  }

  // Withdrawal Type methods
  async getAllWithdrawalTypes(req: Request, res: Response): Promise<void> {
    try {
      const withdrawalTypes = await adminService.getAllWithdrawalTypes();
      res.json(withdrawalTypes);
    } catch (error) {
      console.error("Error fetching withdrawal types:", error);
      res.status(500).json({ error: "Failed to fetch withdrawal types" });
    }
  }

  async getWithdrawalTypeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid withdrawal type ID" });
        return;
      }

      const withdrawalType = await adminService.getWithdrawalTypeById(id);
      if (!withdrawalType) {
        res.status(404).json({ error: "Withdrawal type not found" });
        return;
      }

      res.json(withdrawalType);
    } catch (error) {
      console.error("Error fetching withdrawal type:", error);
      res.status(500).json({ error: "Failed to fetch withdrawal type" });
    }
  }

  async createWithdrawalType(req: Request, res: Response): Promise<void> {
    try {
      const { WITHDRAWAL_TYPE_VALUE } = req.body;

      if (!WITHDRAWAL_TYPE_VALUE || typeof WITHDRAWAL_TYPE_VALUE !== "string") {
        res.status(400).json({ error: "Withdrawal type value is required" });
        return;
      }

      const withdrawalTypeData = { WITHDRAWAL_TYPE_VALUE };
      const newWithdrawalType = await adminService.createWithdrawalType(withdrawalTypeData);
      res.status(201).json(newWithdrawalType);
    } catch (error) {
      console.error("Error creating withdrawal type:", error);
      res.status(500).json({ error: "Failed to create withdrawal type" });
    }
  }

  async updateWithdrawalType(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { WITHDRAWAL_TYPE_VALUE, IS_ACTIVE } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid withdrawal type ID" });
        return;
      }

      if (!WITHDRAWAL_TYPE_VALUE || typeof WITHDRAWAL_TYPE_VALUE !== "string") {
        res.status(400).json({ error: "Withdrawal type value is required" });
        return;
      }

      if (typeof IS_ACTIVE !== "boolean") {
        res.status(400).json({ error: "IS_ACTIVE must be a boolean" });
        return;
      }

      const withdrawalTypeData = { WITHDRAWAL_TYPE_VALUE, IS_ACTIVE };
      const updatedWithdrawalType = await adminService.updateWithdrawalType(id, withdrawalTypeData);

      if (!updatedWithdrawalType) {
        res.status(404).json({ error: "Withdrawal type not found" });
        return;
      }

      res.json(updatedWithdrawalType);
    } catch (error) {
      console.error("Error updating withdrawal type:", error);
      res.status(500).json({ error: "Failed to update withdrawal type" });
    }
  }

  async deleteWithdrawalType(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid withdrawal type ID" });
        return;
      }

      const success = await adminService.deleteWithdrawalType(id);
      if (success) {
        res.json({ message: "Withdrawal type deleted successfully" });
      } else {
        res.status(404).json({ error: "Withdrawal type not found" });
      }
    } catch (error) {
      console.error("Error deleting withdrawal type:", error);
      res.status(500).json({ error: "Failed to delete withdrawal type" });
    }
  }

  async toggleWithdrawalTypeStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid withdrawal type ID" });
        return;
      }

      if (typeof isActive !== "boolean") {
        res.status(400).json({ error: "isActive must be a boolean" });
        return;
      }

      const updatedWithdrawalType = await adminService.toggleWithdrawalTypeStatus(id, isActive);
      if (!updatedWithdrawalType) {
        res.status(404).json({ error: "Withdrawal type not found" });
        return;
      }

      res.json(updatedWithdrawalType);
    } catch (error) {
      console.error("Error toggling withdrawal type status:", error);
      res.status(500).json({ error: "Failed to update withdrawal type status" });
    }
  }
}

export default new AdminController();