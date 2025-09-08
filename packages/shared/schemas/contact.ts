import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.email("有効なメールアドレスを入力してください"),
  phone: z
    .string()
    .min(9, "電話番号は9文字以上で入力してください")
    .max(11, "電話番号は11文字以下で入力してください")
    .regex(/^\d+$/, "電話番号は数字のみで入力してください"),
  contact_type: z.enum(["inquiry", "contact"]),
  content: z.string().min(1, "お問い合わせ内容は必須です"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const contactTypeLabels = {
  inquiry: "お問い合わせ",
  contact: "体験レッスン申し込み",
} as const;
