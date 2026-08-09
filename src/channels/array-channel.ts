/**
 * Array notification channel — accumulates payloads for tests.
 *
 * @packageDocumentation
 */

import type {
    ArrayNotificationRecord,
    Notifiable,
    Notification,
    NotificationChannel,
} from "../types";

/**
 * In-memory channel (Laravel array / testing accumulator).
 */
export class ArrayChannel implements NotificationChannel {
    public readonly notifications: ArrayNotificationRecord[] = [];

    public async send(notifiable: Notifiable, notification: Notification): Promise<void> {
        const data =
            typeof notification.toArray === "function"
                ? notification.toArray(notifiable)
                : {};
        this.notifications.push({ notifiable, notification, data });
    }

    /**
     * Clear accumulated notifications.
     */
    public reset(): void {
        this.notifications.length = 0;
    }
}
