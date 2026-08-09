# @ninots/notifications

Sync notifications for Ninots — Laravel-inspired DX on Bun: channels **mail** (injectable local sender) and **array** (tests). Zero runtime deps; zero `@ninots/*` cross-deps.

## Install

```bash
bun add @ninots/notifications@^0.1.0
```

## API

| Export | Role |
|--------|------|
| `NotificationSender` / `createNotificationSender` | Sync `send` / `sendNow` respecting `via()` |
| `MailMessage` | Fluent `toMail()` builder |
| `MailChannel` | Delivers via injectable `MailChannelSender` |
| `ArrayChannel` | Accumulates payloads for tests |
| `Notifiable` / `Notification` | Local contracts |

## Example

```ts
import {
  createNotificationSender,
  MailMessage,
  type Notification,
  type Notifiable,
} from "@ninots/notifications";

class WelcomeNotification implements Notification {
  via(): ("mail" | "array")[] {
    return ["mail", "array"];
  }

  toMail(_notifiable: Notifiable) {
    return new MailMessage().withSubject("Welcome").line("Hello from Ninots");
  }

  toArray(_notifiable: Notifiable) {
    return { kind: "welcome" };
  }
}

const sender = createNotificationSender({
  mailSender: {
    async send(message) {
      // app: bind to @ninots/mail MailManager
      console.log(message.subject, message.to);
    },
  },
});

await sender.send({ email: "you@example.com" }, new WelcomeNotification());
```

## Version

`0.1.0` — first publish (sync only; no queue coupling in-package).

## License

MIT
