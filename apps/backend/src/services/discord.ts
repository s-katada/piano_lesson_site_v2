import type { ContactFormData } from "@piano_lesson_site/shared";
import { contactTypeLabels } from "@piano_lesson_site/shared";

export interface DiscordEmbed {
  title: string;
  description?: string;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  color?: number;
  timestamp?: string;
}

export class DiscordWebhookService {
  constructor(private webhookUrl: string) {}

  async sendContactNotification(data: ContactFormData): Promise<void> {
    const embed: DiscordEmbed = {
      title: "新規お問い合わせ",
      description: `${data.name}さんから新規お問い合わせがありました。`,
      color: this.getColorByType(data.contact_type),
      timestamp: new Date().toISOString(),
      fields: [
        { name: "名前", value: data.name, inline: true },
        { name: "メールアドレス", value: data.email, inline: true },
        { name: "電話番号", value: data.phone, inline: true },
        {
          name: "お問い合わせ種類",
          value: contactTypeLabels[data.contact_type],
          inline: true,
        },
        { name: "お問い合わせ内容", value: data.content, inline: false },
      ],
    };

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send Discord webhook: ${response.status} - ${errorText}`);
    }
  }

  private getColorByType(type: ContactFormData["contact_type"]): number {
    switch (type) {
      case "inquiry":
        return 0x3498db; // Blue
      case "contact":
        return 0x2ecc71; // Green
      default:
        return 0x95a5a6; // Gray
    }
  }
}
