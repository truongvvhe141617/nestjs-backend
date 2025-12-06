import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HasingService } from './services/hasing.service';

const sharedServices = [PrismaService, HasingService]
@Global()
@Module({
    providers: sharedServices,
    exports: sharedServices,
})
export class SharedModule {}
