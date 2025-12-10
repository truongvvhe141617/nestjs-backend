import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { HasingService } from './services/hasing.service';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';

const sharedServices = [PrismaService, HasingService, TokenService]
@Global()
@Module({
    providers: [...sharedServices,
        AccessTokenGuard,
        ApiKeyGuard,
    {
        provide: APP_GUARD,
        useClass: AuthenticationGuard,
    },
    ],
    exports: sharedServices,
    imports: [JwtModule]
})
export class SharedModule { }
