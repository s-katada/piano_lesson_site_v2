import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { contactSchema, type ContactFormData } from "@piano_lesson_site/shared";
import { DiscordWebhookService } from "../services/discord";
import type { Bindings } from "../types/bindings";
import { Resend } from "resend";
import { contactEmailTemplate } from "../emails/template";
import { verifyTurnstileToken } from "../services/turnstile";

export const contactRoutes = new Hono<{ Bindings: Bindings }>().post(
  "/",
  zValidator("json", contactSchema),
  async (c) => {
    const webhookUrl = c.env.DISCORD_WEBHOOK_URL;
    const body: ContactFormData = c.req.valid("json");
    const { turnstileToken, ...data } = body;

    const remoteip =
      c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();

    const turnstile = await verifyTurnstileToken(
      c.env.TURNSTILE_SECRET_KEY,
      turnstileToken,
      remoteip
    );

    if (!turnstile.success) {
      console.error("Turnstile verification failed:", turnstile.errorCodes);
      return c.json(
        {
          success: false,
          message: "認証に失敗しました。ページを再読み込みして再度お試しください。",
        },
        403
      );
    }

    try {
      const discordService = new DiscordWebhookService(webhookUrl);
      await discordService.sendContactNotification(data);
      const resend = new Resend(c.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `どんぐりピアノ教室 <${c.env.FROM_EMAIL}>`,
        to: data.email,
        subject: "お問い合わせを受け付けました！",
        html: contactEmailTemplate().toString(),
      });

      return c.json(
        {
          success: true,
          message: "お問い合わせを受け付けました。ご連絡ありがとうございます。",
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            contact_type: data.contact_type,
            content: data.content,
          },
        },
        200
      );
    } catch (error) {
      console.error("Failed to send Discord notification:", error);

      return c.json(
        {
          success: false,
          message: "お問い合わせの送信に失敗しました。時間をおいて再度お試しください。",
        },
        500
      );
    }
  }
);
