import type { EmailService } from '../interfaces/UserInterfaces.ts';
import { ConsoleEmailService } from './ConsoleEmailService.ts';
import { SmtpEmailService } from './SmtpEmailService.ts';

export function createEmailService(env: NodeJS.ProcessEnv = process.env): EmailService {
    const host = env.SMTP_HOST ?? (env.NODE_ENV === 'production' ? undefined : 'localhost');

    if (!host) {
        return new ConsoleEmailService();
    }

    return new SmtpEmailService({
        host,
        port: Number(env.SMTP_PORT ?? (env.SMTP_HOST ? 587 : 1025)),
        secure: env.SMTP_SECURE === 'true',
        from: env.MAIL_FROM ?? 'Quora Copy <no-reply@localhost>',
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    });
}
