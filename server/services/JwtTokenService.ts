import { jwtVerify, SignJWT } from 'jose';
import { assertAuthUser } from '../assertions/UserAssertions.ts';
import type { AuthUser, TokenService } from '../interfaces/UserInterfaces.ts';

export class JwtTokenService implements TokenService {
    private readonly resetTokens = new Set<string>();

    constructor(
        private readonly secret: string,
        private readonly expiresIn = '1h',
    ) {}

    async create(user: AuthUser): Promise<string> {
        const secret = this.encodeSecret();

        return new SignJWT({
            name: user.name,
            email: user.email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(user.id)
            .setIssuedAt()
            .setExpirationTime(this.expiresIn)
            .sign(secret);
    }
    
    async validate(token: string): Promise<AuthUser> {
        if (this.resetTokens.has(token)) {
            throw new Error('Token has been reset.');
        }

        const { payload } = await jwtVerify(token, this.encodeSecret());

        const user = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
        };

        assertAuthUser(user);

        return user;
    }

    async reset(token: string): Promise<void> {
        await this.validate(token);
        this.resetTokens.add(token);
    }

    private encodeSecret(): Uint8Array {
        return Buffer.from(this.secret);
    }
}
