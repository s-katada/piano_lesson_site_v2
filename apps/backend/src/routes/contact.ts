import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { contactSchema, type ContactFormData } from "@piano_lesson_site/shared";
import { DiscordWebhookService } from "../services/discord";
import type { Bindings } from "../types/bindings";
import { Resend } from "resend";
import { contactEmailTemplate } from "../emails/template";
export const contactRoutes = new Hono<{ Bindings: Bindings }>().post(
  "/",
  zValidator("json", contactSchema),
  async (c) => {
    const webhookUrl = c.env.DISCORD_WEBHOOK_URL;
    const data: ContactFormData = c.req.valid("json");

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
