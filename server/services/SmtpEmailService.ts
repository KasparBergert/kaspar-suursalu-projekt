import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailService } from '../interfaces/UserInterfaces.ts';

export interface SmtpEmailConfig {
    host: string;
    port: number;
    secure: boolean;
    from: string;
    user?: string;
    pass?: string;
}

export class SmtpEmailService implements EmailService {
    private readonly transporter: Transporter;

    constructor(private readonly config: SmtpEmailConfig, transporter?: Transporter) {
        this.transporter = transporter ?? nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.user && config.pass
                ? {
                    user: config.user,
                    pass: config.pass,
                }
                : undefined,
        });
    }

    async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
        await this.transporter.sendMail({
            from: this.config.from,
            to: email,
            subject: 'Reset your password',
            text: [
                'We received a request to reset your password.',
                '',
                `Open this link to choose a new password: ${resetUrl}`,
                '',
                'This link expires in 30 minutes. If you did not request this, you can ignore this email.',
            ].join('\n'),
            html: [
                '<p>We received a request to reset your password.</p>',
                `<p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>`,
                '<p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>',
            ].join(''),
        });
    }
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}
