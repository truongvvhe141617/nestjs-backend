import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { TokenService } from 'src/shared/services/token.service';
import { HasingService } from './../../shared/services/hasing.service';
import { PrismaService } from './../../shared/services/prisma.service';
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(private readonly hasingService: HasingService,
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService
    ) { }
    async register(body: RegisterBodyDTO) {
        try {
            const hashedPassword = await this.hasingService.hash(body.password);
            const user = await this.prismaService.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    name: body.name
                }
            })
            return user
        } catch (error) {
        }
    }

    async login(body: LoginBodyDTO) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: body.email
            }
        })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        const isPasswordMatch = await this.hasingService.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new UnprocessableEntityException({
                field: 'password',
                message: 'Password is not correct'
            })
        }
        const tokens = await this.generateTokens({ userId: user.id })
        return tokens
    }
    async generateTokens(payload: { userId: number }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken(payload),
            this.tokenService.signRefreshToken(payload)
        ])
        const decodedRefeshToken = await this.tokenService.verifyRefreshToken(refreshToken)
        if (!decodedRefeshToken) {
            throw new UnauthorizedException('Refresh token is not valid')
        }
        await this.prismaService.refreshToken.create({
            data: {
                userId: payload.userId,
                token: refreshToken,
                expiresAt: new Date(decodedRefeshToken.exp * 1000)
            }
        })
        return { accessToken, refreshToken }
    }
}
