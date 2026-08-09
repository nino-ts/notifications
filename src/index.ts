/**
 * @ninots/notifications — internal barrel.
 *
 * @packageDocumentation
 */

export { ArrayChannel } from "./channels/array-channel";
export { MailChannel } from "./channels/mail-channel";
export { resolveMailRoute } from "./channels/resolve-mail-route";
export { MailMessage } from "./mail-message";
export {
    createNotificationSender,
    NotificationSender,
} from "./notification-sender";
export type { NotificationSenderOptions } from "./notification-sender";
export type {
    Address,
    ArrayNotificationRecord,
    MailChannelSender,
    MailMessageLike,
    Notifiable,
    Notification,
    NotificationChannel,
    NotificationChannelName,
    NotificationMailPayload,
} from "./types";
