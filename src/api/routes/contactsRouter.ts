import { Router } from "express";
import contactsController from "../controllers/contactsController";

const router = Router();

router.get(
  "/business-types",
  contactsController.getAllBusinessTypes.bind(contactsController)
);

router.get(
  "/product-types",
  contactsController.getAllProductTypes.bind(contactsController)
);

router.get("/", contactsController.getAllContacts.bind(contactsController));

router.get("/:id", contactsController.getContactById.bind(contactsController));

router.post("/", contactsController.createContact.bind(contactsController));

// PUT /api/contacts/:id - Update contact
router.put("/:id", contactsController.updateContact.bind(contactsController));

// DELETE /api/contacts/:id - Delete contact
router.delete(
  "/:id",
  contactsController.deleteContact.bind(contactsController)
);

export default router;