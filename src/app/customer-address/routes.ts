import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { CustomerAddressController } from "./controller/customer-address.controller";
import { TOKENS } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";

export const customerAddressRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(
  TOKENS.CustomerAddressController,
);

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
