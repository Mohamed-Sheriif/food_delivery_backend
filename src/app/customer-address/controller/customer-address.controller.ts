import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";

import { validateBody } from "../../../lib/validation/validate";
import {
  CustomerAddressParamsDTO,
  CreateCustomerAddressDTO,
  UpdateCustomerAddressDTO,
} from "../dto/customer-address.dto";
import { CustomerAddressService } from "../service/customer-address.service";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class CustomerAddressController {
  constructor(
    @inject(TOKENS.CustomerAddressService)
    private readonly customerAddressService: CustomerAddressService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate the request body
      const data = await validateBody(CreateCustomerAddressDTO, req.body);

      // 2. create the customer address
      const address = await this.customerAddressService.create(
        req.user?.userId!,
        data,
      );

      // 3. respond with the created customer address
      res.status(201).json({
        message: "Address Added Successfully",
        address,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get the customer addresses by user id
      const addresses = await this.customerAddressService.listByUserId(
        req.user?.userId!,
      );

      // 2. respond with the customer addresses
      res.status(200).json({
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get the customer address by id
      const { id } = await validateBody(CustomerAddressParamsDTO, req.params);

      // 2. get the customer address by user id and id
      const address = await this.customerAddressService.getById(
        req.user?.userId!,
        Number(id),
      );

      // 3. respond with the customer address
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate the request params
      const { id } = await validateBody(CustomerAddressParamsDTO, req.params);

      // 2. validate the request body
      const data = await validateBody(UpdateCustomerAddressDTO, req.body);

      // 3. update the customer address
      const address = await this.customerAddressService.update(
        req.user?.userId!,
        Number(id),
        data,
      );

      // 4. respond with the updated customer address
      res.status(200).json({
        message: "Address Updated Successfully",
        address,
      });
    } catch (error) {
      next(error);
    }
  };

  makeDefault = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate the request params
      const { id } = await validateBody(CustomerAddressParamsDTO, req.params);

      // 2. make the customer address as default
      const address = await this.customerAddressService.makeDefault(
        req.user?.userId!,
        Number(id),
      );

      // 3. respond with the updated customer address
      res.status(200).json({
        message: "Address Made Default Successfully",
        address,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate the request params
      const { id } = await validateBody(CustomerAddressParamsDTO, req.params);

      // 2. delete the customer address
      await this.customerAddressService.delete(req.user?.userId!, Number(id));

      // 3. respond with no content
      res.status(200).json({
        message: "Address Deleted Successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
