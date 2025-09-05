import { Router } from "express";
import adminController from "../controllers/adminController";

const router = Router();

// Product routes
router.get("/products", adminController.getAllProducts.bind(adminController));
router.get("/products/:id", adminController.getProductById.bind(adminController));
router.post("/products", adminController.createProduct.bind(adminController));
router.put("/products/:id", adminController.updateProduct.bind(adminController));
router.delete("/products/:id", adminController.deleteProduct.bind(adminController));
router.put("/products/:id/toggle-status", adminController.toggleProductStatus.bind(adminController));

// Term routes
router.get("/terms", adminController.getAllTerms);
router.get("/terms/:id", adminController.getTermById);
router.post("/terms", adminController.createTerm);
router.put("/terms/:id", adminController.updateTerm);
router.delete("/terms/:id", adminController.deleteTerm);
router.put("/terms/:id/toggle-status", adminController.toggleTermStatus);

// Withdrawal Type routes
router.get("/withdrawal-types", adminController.getAllWithdrawalTypes);
router.get("/withdrawal-types/:id", adminController.getWithdrawalTypeById);
router.post("/withdrawal-types", adminController.createWithdrawalType);
router.put("/withdrawal-types/:id", adminController.updateWithdrawalType);
router.delete("/withdrawal-types/:id", adminController.deleteWithdrawalType);
router.put("/withdrawal-types/:id/toggle-status", adminController.toggleWithdrawalTypeStatus);

export default router;