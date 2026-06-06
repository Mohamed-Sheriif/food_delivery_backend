import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { CustomerAddressController } from "./controller/customer-address.controller";
import { TOKENS } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";

export const customerAddressRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(
  TOKENS.CustomerAddressController,
);

// create customer address
customerAddressRouter.post("/", authenticate, customerAddressController.create);

// list customer addresses
customerAddressRouter.get("/", authenticate, customerAddressController.list);

// get customer address by id
customerAddressRouter.get(
  "/:id",
  authenticate,
  customerAddressController.getById,
);

// update customer address
customerAddressRouter.patch(
  "/:id",
  authenticate,
  customerAddressController.update,
);

// make customer address default
customerAddressRouter.patch(
  "/:id/make-default",
  authenticate,
  customerAddressController.makeDefault,
);

// delete customer address
customerAddressRouter.delete(
  "/:id",
  authenticate,
  customerAddressController.delete,
);
