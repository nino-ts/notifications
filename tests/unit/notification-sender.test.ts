/**
 * Unit tests — NotificationSender + array/mail channels.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "bun:test";
import {
    ArrayChannel,
    createNotificationSender,
    MailChannel,
    MailMessage,
    NotificationSender,
    resolveMailRoute,
    type MailChannelSender,
    type Notifiable,
    type Notification,
    type NotificationMailPayload,
} from "../../index";

class WelcomeNotification implements Notification {
    public via(_notifiable: Notifiable): ("mail" | "array")[] {
        return ["mail", "array"];
    }

    public toMail(_notifiable: Notifiable): MailMessage {
        return new MailMessage().withSubject("Welcome").line("Hello");
    }

    public toArray(_notifiable: Notifiable): Record<string, unknown> {
        return { kind: "welcome" };
    }
}

class ArrayOnlyNotification implements Notification {
    public via(_notifiable: Notifiable): "array"[] {
        return ["array"];
    }

    public toArray(_notifiable: Notifiable): Record<string, unknown> {
        return { kind: "array-only" };
    }
}

class SkipMailNotification implements Notification {
    public via(_notifiable: Notifiable): ("mail" | "array")[] {
        return ["mail", "array"];
    }

    public shouldSend(_notifiable: Notifiable, channel: "mail" | "array"): boolean {
        return channel !== "mail";
    }

    public toMail(_notifiable: Notifiable): MailMessage {
        return new MailMessage().withSubject("Skip");
    }

    public toArray(_notifiable: Notifiable): Record<string, unknown> {
        return { skippedMail: true };
    }
}

describe("resolveMailRoute", () => {
    test("prefers routeNotificationForMail over email", () => {
        const notifiable: Notifiable = {
            email: "fallback@ninots.test",
            routeNotificationForMail: () => "route@ninots.test",
        };
        expect(resolveMailRoute(notifiable, new WelcomeNotification())).toBe("route@ninots.test");
    });

    test("falls back to email", () => {
        const notifiable: Notifiable = { email: "user@ninots.test" };
        expect(resolveMailRoute(notifiable, new WelcomeNotification())).toBe("user@ninots.test");
    });
});

describe("ArrayChannel", () => {
    test("accumulates toArray payloads", async () => {
        const channel = new ArrayChannel();
        const notifiable: Notifiable = { email: "a@test" };
        await channel.send(notifiable, new ArrayOnlyNotification());
        expect(channel.notifications).toHaveLength(1);
        expect(channel.notifications[0]?.data).toEqual({ kind: "array-only" });
        channel.reset();
        expect(channel.notifications).toHaveLength(0);
    });
});

describe("MailChannel", () => {
    test("invokes injectable sender with resolved route", async () => {
        const sent: NotificationMailPayload[] = [];
        const mailSender: MailChannelSender = {
            async send(message) {
                sent.push(message);
            },
        };
        const channel = new MailChannel(mailSender);
        await channel.send({ email: "qa@ninots.test" }, new WelcomeNotification());
        expect(sent).toHaveLength(1);
        expect(sent[0]?.to).toBe("qa@ninots.test");
        expect(sent[0]?.subject).toBe("Welcome");
        expect(sent[0]?.text).toBe("Hello");
    });

    test("skips when no mail route", async () => {
        const sent: NotificationMailPayload[] = [];
        const channel = new MailChannel({
            async send(message) {
                sent.push(message);
            },
        });
        await channel.send({}, new WelcomeNotification());
        expect(sent).toHaveLength(0);
    });

    test("throws when toMail missing", async () => {
        const channel = new MailChannel({
            async send() {},
        });
        await expect(channel.send({ email: "x@y.z" }, new ArrayOnlyNotification())).rejects.toThrow(/toMail/);
    });
});

describe("NotificationSender", () => {
    test("send respects via() and accumulates array + mail", async () => {
        const sent: NotificationMailPayload[] = [];
        const sender = createNotificationSender({
            mailSender: {
                async send(message) {
                    sent.push(message);
                },
            },
        });

        await sender.send({ email: "dev@ninots.test" }, new WelcomeNotification());

        expect(sent).toHaveLength(1);
        const array = sender.arrayChannel();
        expect(array).toBeInstanceOf(ArrayChannel);
        expect(array?.notifications).toHaveLength(1);
        expect(array?.notifications[0]?.data).toEqual({ kind: "welcome" });
    });

    test("sendNow with explicit channels overrides via()", async () => {
        const sent: NotificationMailPayload[] = [];
        const sender = createNotificationSender({
            mailSender: {
                async send(message) {
                    sent.push(message);
                },
            },
        });

        await sender.sendNow({ email: "dev@ninots.test" }, new WelcomeNotification(), ["array"]);

        expect(sent).toHaveLength(0);
        expect(sender.arrayChannel()?.notifications).toHaveLength(1);
    });

    test("shouldSend false skips channel", async () => {
        const sent: NotificationMailPayload[] = [];
        const sender = createNotificationSender({
            mailSender: {
                async send(message) {
                    sent.push(message);
                },
            },
        });

        await sender.send({ email: "dev@ninots.test" }, new SkipMailNotification());

        expect(sent).toHaveLength(0);
        expect(sender.arrayChannel()?.notifications).toHaveLength(1);
    });

    test("throws when channel not configured", async () => {
        const sender = new NotificationSender({
            array: new ArrayChannel(),
        });
        await expect(sender.send({ email: "x@y.z" }, new WelcomeNotification())).rejects.toThrow(/mail/);
    });

    test("send accepts multiple notifiables", async () => {
        const sender = createNotificationSender({});
        await sender.send([{ email: "a@test" }, { email: "b@test" }], new ArrayOnlyNotification());
        expect(sender.arrayChannel()?.notifications).toHaveLength(2);
    });
});
