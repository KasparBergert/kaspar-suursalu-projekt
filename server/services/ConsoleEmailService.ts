import type { EmailService } from '../interfaces/UserInterfaces.ts';

export class ConsoleEmailService implements EmailService {
    async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
        console.log(`Password reset email for ${email}: ${resetUrl}`);
    }
}
