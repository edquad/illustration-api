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

// Existing client routes
router.get("/", clientController.getAllClients);
router.get("/:id/", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id/", clientController.updateClient);
router.delete("/:id/", clientController.deleteClient);

// NEW: CLIENT_INFO routes
router.get("/client-info", clientController.getAllClientInfo);
router.get("/client-info/:id", clientController.getClientInfoById);
router.get("/client-info/illustration/:illustrationId", clientController.getClientInfoByIllustrationId);
router.post("/client-info", clientController.createClientInfo);
router.put("/client-info/:id", clientController.updateClientInfo);
router.delete("/client-info/:id", clientController.deleteClientInfo);

export default router;