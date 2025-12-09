import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import { JwtPayload } from '../types/jwt.type';

@Injectable()
export class TokenService {
    /**
     *
     */
    constructor(private readonly jwtService: JwtService) { }

    signAccessToken(payload: { userId: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
            expiresIn: "15m",
            algorithm: "HS256"
        })
    }

    signRefreshToken(payload: { userId: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
            expiresIn: "1d",
            algorithm: "HS256"
        })
    }

    verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
            algorithms: ["HS256"]
        })
    }

    verifyRefreshToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
            algorithms: ["HS256"]
        })
    }
}
