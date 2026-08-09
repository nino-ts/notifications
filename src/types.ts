/**
 * Local notification contracts for @ninots/notifications (zero cross-package deps).
 *
 * @packageDocumentation
 */

/**
 * Channels supported in the 0.1.0 slice.
 */
export type NotificationChannelName = "mail" | "array";

/**
 * Email address with optional display name (local — not `@ninots/mail`).
 */
export interface Address {
    address: string;
    name?: string;
}

/**
 * Payload handed to an injectable {@link MailChannelSender}.
 */
export interface NotificationMailPayload {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: Address;
}

/**
 * App-injected mail seam — compose to `@ninots/mail` outside this package.
 */
export interface MailChannelSender {
    send(message: NotificationMailPayload): Promise<void>;
}

/**
 * Entity that can receive notifications.
 */
export interface Notifiable {
    email?: string;
    routeNotificationForMail?(notification: Notification): string | string[] | undefined;
}

/**
 * Domain notification — implement `via` and channel formatters.
 */
export interface Notification {
    id?: string;
    via(notifiable: Notifiable): NotificationChannelName[];
    toMail?(notifiable: Notifiable): MailMessageLike;
    toArray?(notifiable: Notifiable): Record<string, unknown>;
    shouldSend?(notifiable: Notifiable, channel: NotificationChannelName): boolean;
}

/**
 * Minimal mail message surface (class or plain object).
 */
export interface MailMessageLike {
    subject: string;
    text?: string;
    html?: string;
    from?: Address;
    to?: string | string[];
}

/**
 * Channel driver contract.
 */
export interface NotificationChannel {
    send(notifiable: Notifiable, notification: Notification): Promise<void>;
}

/**
 * Record stored by the array channel (tests).
 */
export interface ArrayNotificationRecord {
    notifiable: Notifiable;
    notification: Notification;
    data: Record<string, unknown>;
}
