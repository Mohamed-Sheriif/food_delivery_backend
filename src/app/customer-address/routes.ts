import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { customerAddressController } from "./controller/customer-address.controller";

export const customerAddressRouter = Router();

customerAddressRouter.get("/", authenticate, customerAddressController.list);
customerAddressRouter.get(
  "/:id",
  authenticate,
  customerAddressController.getById,
);
customerAddressRouter.post("/", authenticate, customerAddressController.create);
customerAddressRouter.patch(
  "/:id",
  authenticate,
  customerAddressController.update,
);
customerAddressRouter.patch(
  "/:id/make-default",
  authenticate,
  customerAddressController.makeDefault,
);
customerAddressRouter.delete(
  "/:id",
  authenticate,
  customerAddressController.delete,
);
