import { Router } from "express";
import clientController from "../controllers/clientController";

const router = Router();

router.get("/term-details", clientController.getTermDetails);
router.get(
  "/tax-qualification-details",
  clientController.getTaxQualificationDetails
);
router.get(
  "/withdrawal-type-details",
  clientController.getWithdrawalTypeDetails
);
router.post(
  "/state-product-availability",
  clientController.getStateProductAvailability
);
router.get("/fia-allocation", clientController.getFiaAllocation);
router.get("/", clientController.getAllClients);
router.get("/:id/", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id/", clientController.updateClient);
router.delete("/:id/", clientController.deleteClient);

export default router;