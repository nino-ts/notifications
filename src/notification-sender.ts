/**
 * Sync notification sender (send / sendNow).
 *
 * @packageDocumentation
 */

import { ArrayChannel } from "./channels/array-channel";
import { MailChannel } from "./channels/mail-channel";
import type {
    MailChannelSender,
    Notifiable,
    Notification,
    NotificationChannel,
    NotificationChannelName,
} from "./types";

/**
 * Options for {@link createNotificationSender}.
 */
export interface NotificationSenderOptions {
    /**
     * Injectable mail seam (compose to `@ninots/mail` in the app).
     */
    mailSender?: MailChannelSender;
    /**
     * Override channel map (tests). When omitted, wires `array` + optional `mail`.
     */
    channels?: Partial<Record<NotificationChannelName, NotificationChannel>>;
}

/**
 * Dispatches notifications to channels returned by `via()`.
 */
export class NotificationSender {
    public constructor(
        private readonly channels: Partial<Record<NotificationChannelName, NotificationChannel>>,
    ) {}

    /**
     * Send sync (0.1.0 — no queue coupling).
     */
    public async send(
        notifiables: Notifiable | Notifiable[],
        notification: Notification,
    ): Promise<void> {
        await this.sendNow(notifiables, notification);
    }

    /**
     * Send immediately on the given channels (or `via()`).
     */
    public async sendNow(
        notifiables: Notifiable | Notifiable[],
        notification: Notification,
        channels?: NotificationChannelName[],
    ): Promise<void> {
        const list = Array.isArray(notifiables) ? notifiables : [notifiables];

        for (const notifiable of list) {
            const viaChannels = channels ?? notification.via(notifiable);
            if (viaChannels.length === 0) {
                continue;
            }

            for (const channelName of viaChannels) {
                if (
                    typeof notification.shouldSend === "function" &&
                    notification.shouldSend(notifiable, channelName) === false
                ) {
                    continue;
                }

                const channel = this.channels[channelName];
                if (channel === undefined) {
                    throw new Error(`Notification channel [${channelName}] is not configured`);
                }

                await channel.send(notifiable, notification);
            }
        }
    }

    /**
     * Access the array channel accumulator when present.
     */
    public arrayChannel(): ArrayChannel | undefined {
        const channel = this.channels.array;
        return channel instanceof ArrayChannel ? channel : undefined;
    }
}

/**
 * Build a sender with `array` always and `mail` when a sender is provided.
 */
export function createNotificationSender(
    options: NotificationSenderOptions = {},
): NotificationSender {
    if (options.channels !== undefined) {
        return new NotificationSender(options.channels);
    }

    const channels: Partial<Record<NotificationChannelName, NotificationChannel>> = {
        array: new ArrayChannel(),
    };

    if (options.mailSender !== undefined) {
        channels.mail = new MailChannel(options.mailSender);
    }

    return new NotificationSender(channels);
}
