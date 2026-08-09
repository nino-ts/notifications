/**
 * @ninots/notifications — sync notifications for Bun (mail + array).
 *
 * @packageDocumentation
 */

export {
    ArrayChannel,
    createNotificationSender,
    MailChannel,
    MailMessage,
    NotificationSender,
    resolveMailRoute,
} from "./src";
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
    NotificationSenderOptions,
} from "./src";
