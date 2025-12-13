import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_USER_KEY } from "../constants/auth.constant";
import { JwtPayload } from "../types/jwt.type";

export const ActiveUser = createParamDecorator((field: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const user = request[REQUEST_USER_KEY]
    return field ? user[field] : user
})