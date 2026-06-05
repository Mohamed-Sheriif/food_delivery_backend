import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";

import { MemberService } from "../service/member.service";
import {
  CreateMemberDto,
  CreateMemberParams,
  GetRolePermissionsParams,
  UpdateMemberBranchesDto,
  UpdateMemberDto,
  UpdateMemberParams,
} from "../dto/member.dto";
import { validateBody } from "../../../lib/validation/validate";
import { TOKENS } from "../../../lib/di/tokens";
import { sendPaginated, sendSuccess } from "../../../lib/http/response";
import {
  parseFilters,
  parsePaginationQuery,
} from "../../../lib/http/pagination/parse-pagination";

@injectable()
export class MemberController {
  constructor(
    @inject(TOKENS.MemberService) private readonly memberService: MemberService,
  ) {}

  createMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateMemberDto, req.body);

      // 2. validate req.params
      const { restaurantId } = await validateBody(
        CreateMemberParams,
        req.params,
      );

      // 2. call service
      await this.memberService.createMember(Number(restaurantId), data);

      // 3. respond
      sendSuccess(
        res,
        {
          message:
            "Member created successfully. Please check your email for the OTP.",
        },
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { restaurantId } = await validateBody(
        CreateMemberParams,
        req.params,
      );

      // 2. parse pagination and filters query
      const pagination = parsePaginationQuery(req.query, ["created_at", "id"]);
      const filters = parseFilters(req.query, [
        "id",
        "status",
        "email",
        "name",
        "phone",
        "role",
      ]);

      // 2. call service
      const members = await this.memberService.listMembers(
        Number(restaurantId),
        filters,
        pagination,
      );

      // 3. respond
      sendPaginated(
        res,
        {
          message: "Members retrieved successfully",
          data: members.data,
        },
        members.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { restaurantId, memberId } = await validateBody(
        UpdateMemberParams,
        req.params,
      );

      // 2. validate req.body
      const data = await validateBody(UpdateMemberDto, req.body);

      // 3. call service
      const updatedMember = await this.memberService.updateMember(
        Number(restaurantId),
        Number(memberId),
        data,
      );

      // 4. respond
      sendSuccess(res, {
        message: "Member updated successfully",
        member: updatedMember,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { restaurantId, memberId } = await validateBody(
        UpdateMemberParams,
        req.params,
      );

      // 2. call service
      await this.memberService.deleteMember(
        Number(restaurantId),
        Number(memberId),
      );

      // 3. respond
      sendSuccess(res, {
        message: "Member deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateMemberBranches = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.params
      const { restaurantId, memberId } = await validateBody(
        UpdateMemberParams,
        req.params,
      );

      // 2. validate req.body
      const data = await validateBody(UpdateMemberBranchesDto, req.body);

      // 3. call service
      await this.memberService.updateMemberBranches(
        Number(restaurantId),
        Number(memberId),
        data,
      );

      // 4. respond
      sendSuccess(res, {
        message: "Member branches updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRolePermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.params
      const { roleName } = await validateBody(
        GetRolePermissionsParams,
        req.params,
      );

      // 2. call service
      const rolePermissions =
        await this.memberService.getRolePermissions(roleName);

      // 3. respond
      sendSuccess(res, {
        message: "Role permissions retrieved successfully",
        rolePermissions,
      });
    } catch (error) {
      next(error);
    }
  };
}
