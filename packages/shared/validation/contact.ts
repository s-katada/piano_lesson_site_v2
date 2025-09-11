import { z } from "zod";

export const CONTACT_TYPES = ["lesson", "trial", "other"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];
export const contactTypeLabels: Record<ContactType, string> = {
  lesson: "レッスンのご相談",
  trial: "体験レッスン申込",
  other: "その他",
} as const;
export const contactSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.email("有効なメールアドレスを入力してください"),
  phone: z
    .string()
    .regex(
      /^(0[0-9]{1,4}-[0-9]{1,4}-[0-9]{4}|0[0-9]{9,10})$/,
      "電話番号は正しい形式で入力してください（例：090-1234-5678 または 09012345678）"
    )
    .optional()
    .or(z.literal("")),
  contact_type: z.enum(CONTACT_TYPES),
  content: z.string().min(1, "お問い合わせ内容は必須です"),
});
export type ContactFormData = z.infer<typeof contactSchema>;
export const isValidContactType = (type: unknown): type is ContactType => {
  return CONTACT_TYPES.includes(type as ContactType);
};
