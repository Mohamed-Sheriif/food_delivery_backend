import { NextFunction, Request, Response } from "express";
import { MemberService, memberService } from "../service/member.service";
import { CreateMemberDto, CreateMemberParams } from "../dto/member.dto";
import { validateBody } from "../../../common/validation/validate";

export class MemberController {
  constructor(private readonly memberService: MemberService) {}

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
      res.status(201).json({
        message:
          "Member created successfully. Please check your email for the OTP.",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const memberController = new MemberController(memberService);
