import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { contactSchema, type ContactFormData } from "@piano_lesson_site/shared";
import { DiscordWebhookService } from "@/services/discord";
import type { Bindings } from "@/types/bindings";

export const contactRoutes = new Hono<{ Bindings: Bindings }>();

contactRoutes.post("/", zValidator("json", contactSchema), async (c) => {
  const webhookUrl = c.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Discord webhook URL is not configured");
    return c.json(
      {
        success: false,
        message: "サーバーの設定エラーが発生しました。管理者にお問い合わせください。",
      },
      500
    );
  }

  const data: ContactFormData = c.req.valid("json");

  try {
    const discordService = new DiscordWebhookService(webhookUrl);
    await discordService.sendContactNotification(data);

    return c.json(
      {
        success: true,
        message: "お問い合わせを受け付けました。ご連絡ありがとうございます。",
        data: {
          name: data.name,
          email: data.email,
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
});
