/**
 * Mail notification channel — uses local {@link MailChannelSender} only.
 *
 * @packageDocumentation
 */

import type { MailChannelSender, Notifiable, Notification, NotificationChannel } from "../types";
import { resolveMailRoute } from "./resolve-mail-route";

/**
 * Delivers `toMail()` via an injectable sender (app binds `@ninots/mail`).
 */
export class MailChannel implements NotificationChannel {
    public constructor(private readonly sender: MailChannelSender) {}

    public async send(notifiable: Notifiable, notification: Notification): Promise<void> {
        if (typeof notification.toMail !== "function") {
            throw new Error("Notification must implement toMail() for the mail channel");
        }

        const message = notification.toMail(notifiable);
        const to = message.to ?? resolveMailRoute(notifiable, notification);
        if (to === undefined) {
            return;
        }

        await this.sender.send({
            to,
            subject: message.subject,
            text: message.text,
            html: message.html,
            from: message.from,
        });
    }
}
