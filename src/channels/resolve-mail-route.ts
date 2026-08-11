/**
 * Resolve mail route for a notifiable.
 *
 * @packageDocumentation
 */

import type { Notifiable, Notification } from "../types";

/**
 * Prefer `routeNotificationForMail`, then `email`.
 */
export function resolveMailRoute(notifiable: Notifiable, notification: Notification): string | string[] | undefined {
    if (typeof notifiable.routeNotificationForMail === "function") {
        return notifiable.routeNotificationForMail(notification);
    }
    if (typeof notifiable.email === "string" && notifiable.email.length > 0) {
        return notifiable.email;
    }
    return undefined;
}
