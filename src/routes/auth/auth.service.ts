import { name } from './../../../node_modules/ci-info/index.d';
import { PrismaService } from './../../shared/services/prisma.service';
import { HasingService } from './../../shared/services/hasing.service';
import { Injectable, Body } from '@nestjs/common';
import { RegisterBodyDTO } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(private readonly hasingService: HasingService,
        private readonly prismaService : PrismaService
    ){}    
    async register(body: RegisterBodyDTO){
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
}
