/**
 * Fluent mail message builder for notification `toMail()`.
 *
 * @packageDocumentation
 */

import type { Address, MailMessageLike } from "./types";

/**
 * Laravel-inspired mail message for notifications (local shape).
 */
export class MailMessage implements MailMessageLike {
    public subject = "";
    public text?: string;
    public html?: string;
    public from?: Address;
    public to?: string | string[];

    /**
     * Set the subject line.
     */
    public withSubject(value: string): this {
        this.subject = value;
        return this;
    }

    /**
     * Append a plain-text line (joined with newlines).
     */
    public line(value: string): this {
        this.text = this.text === undefined ? value : `${this.text}\n${value}`;
        return this;
    }

    /**
     * Set HTML body.
     */
    public withHtml(value: string): this {
        this.html = value;
        return this;
    }

    /**
     * Override From.
     */
    public withFrom(address: string, name?: string): this {
        this.from = name === undefined ? { address } : { address, name };
        return this;
    }

    /**
     * Override To (otherwise resolved from the notifiable).
     */
    public withTo(to: string | string[]): this {
        this.to = to;
        return this;
    }
}
