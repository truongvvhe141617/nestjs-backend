import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../services/token.service";
import { REQUEST_USER_KEY } from "../constants/auth.constant";


@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessToken = request.headers.authorization?.split(' ')[1];
        console.log(accessToken);
        if (!accessToken) {
            throw new UnauthorizedException();
        }
        const decodedToken = await this.tokenService.verifyAccessToken(accessToken);
        if (!decodedToken) {
            throw new UnauthorizedException();
        }
        console.log(decodedToken);
        request[REQUEST_USER_KEY] = decodedToken;
        return true;
    }
}