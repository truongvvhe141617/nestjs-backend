import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
    AuthType,
    ConditionGuard,
} from 'src/shared/constants/auth.constant';
import {
    AUTH_TYPE_KEY,
    AuthTypeDecoratorPayload,
} from 'src/shared/decorators/auth.decorator';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    private authTypeGuardMap: Record<string, CanActivate>;

    constructor(
        private readonly reflector: Reflector,
        private readonly accessTokenGuard: AccessTokenGuard,
        private readonly apiKeyGuard: ApiKeyGuard,
    ) {
        // Guard map phải khởi tạo sau khi DI inject xong
        this.authTypeGuardMap = {
            [AuthType.Bearer]: this.accessTokenGuard,
            [AuthType.APIKey]: this.apiKeyGuard,
            [AuthType.None]: { canActivate: () => true },
        };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Lấy metadata từ decorator
        const metadata =
            this.reflector.getAllAndOverride<AuthTypeDecoratorPayload>(
                AUTH_TYPE_KEY,
                [context.getHandler(), context.getClass()],
            ) ??
            ({
                authTypes: [AuthType.None],
                options: { condition: ConditionGuard.And },
            } as AuthTypeDecoratorPayload);

        const guards = metadata.authTypes.map(
            (authType) => this.authTypeGuardMap[authType],
        );

        const isOr = metadata.options.condition === ConditionGuard.Or;

        let lastError: any = new UnauthorizedException();

        for (const guard of guards) {
            const result = await Promise.resolve(guard.canActivate(context)).catch(
                (err) => {
                    lastError = err;
                    return false;
                },
            );

            if (isOr && result) return true; // OR: chỉ cần 1 cái pass
            if (!isOr && !result) throw new UnauthorizedException(lastError?.message ?? 'Unauthorized'); // AND: chỉ cần 1 cái fail → fail
        }

        return !isOr; // OR: nếu không cái nào pass → fail
    }
}
