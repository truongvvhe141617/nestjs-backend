import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { TokenService } from 'src/shared/services/token.service';
import { HasingService } from './../../shared/services/hasing.service';
import { PrismaService } from './../../shared/services/prisma.service';
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';

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
            if (isUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email already exists')
            }
            throw error
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

    async refreshToken(refreshToken: string) {
        try {
            //1.kiểm tra token có hợp lệ không
            const decodedRefeshToken = await this.tokenService.verifyRefreshToken(refreshToken)
            if (!decodedRefeshToken) {
                throw new UnauthorizedException('Refresh token is not valid')
            }
            //2.kiểm tra token có còn hiệu lực không
            const refreshTokenInDB = await this.prismaService.refreshToken.findUniqueOrThrow({
                where: {
                    token: refreshToken
                }
            })
            //3.xóa token cũ
            await this.prismaService.refreshToken.delete({
                where: {
                    token: refreshTokenInDB.token
                }
            })
            //4.kiem tra user co ton tai khong
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: decodedRefeshToken.userId
                }
            })
            if (!user) {
                throw new UnauthorizedException('User not found')
            }
            //5.tạo token mới
            const tokens = await this.generateTokens({ userId: user.id })
            return tokens

        } catch (error) {
            //Token đã được refresh hoặc bị đánh cắp thì thông báo cho user biết.
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked')
            }
            // nếu token hết hạn hoặc không hợp lệ
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedException('Refresh token is expired')
            }
            throw new UnauthorizedException()
        }
    }
}
