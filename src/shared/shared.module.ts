import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HasingService } from './services/hasing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';

const sharedServices = [PrismaService, HasingService, TokenService, AccessTokenGuard, ApiKeyGuard]
@Global()
@Module({
    providers: sharedServices,
    exports: sharedServices,
    imports: [JwtModule]
})
export class SharedModule { }
