import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  contactSchema,
  type ContactFormData,
  type ContactType,
  contactTypeLabels,
  isValidContactType,
} from "@piano_lesson_site/shared";
import { Button } from "../../components/shadcn-ui/button";
import { Input } from "../../components/shadcn-ui/input";
import { Textarea } from "../../components/shadcn-ui/textarea";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { type AppType } from "@piano_lesson_site/backend/src/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/shadcn-ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/shadcn-ui/form";
import { hc } from "hono/client";

interface ContactFormProps {
  contactType?: string;
}

export function ContactForm({ contactType }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const validContactType: ContactType = isValidContactType(contactType) ? contactType : "lesson";
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      contact_type: validContactType,
      content: "",
      turnstileToken: "",
    },
  });
  const turnstileToken = form.watch("turnstileToken");
  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    try {
      const client = hc<AppType>(import.meta.env.PUBLIC_API_URL);
      const response = await client.api.contact.$post({
        json: data,
      });
      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-semibold">送信完了</p>
              <p className="text-sm text-gray-600">お問い合わせを受け付けました</p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: "linear-gradient(to right, #f0fdf4, #dcfce7)",
              border: "1px solid #86efac",
            },
          }
        );
        form.reset({
          name: "",
          email: "",
          phone: "",
          contact_type: validContactType,
          content: "",
          turnstileToken: "",
        });
        turnstileRef.current?.reset();
      } else {
        const errJson = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        const detail =
          errJson?.message ??
          (response.status === 403
            ? "認証に失敗しました。ページを再読み込みして再度お試しください。"
            : "時間をおいて再度お試しください");
        toast.error(
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold">送信失敗</p>
              <p className="text-sm text-gray-600">{detail}</p>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: "linear-gradient(to right, #fef2f2, #fee2e2)",
              border: "1px solid #fca5a5",
            },
          }
        );
        turnstileRef.current?.reset();
        form.setValue("turnstileToken", "");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <div>
            <p className="font-semibold">エラーが発生しました</p>
            <p className="text-sm text-gray-600">ネットワーク接続を確認してください</p>
          </div>
        </div>,
        {
          duration: 5000,
          style: {
            background: "linear-gradient(to right, #fff7ed, #fed7aa)",
            border: "1px solid #fb923c",
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4" />
                お名前 *
              </FormLabel>
              <FormControl>
                <Input placeholder="山田 太郎" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                メールアドレス *
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                電話番号
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="090-1234-5678" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>お問い合わせ種別 *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(contactTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                お問い合わせ内容 *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="お問い合わせ内容をご記入ください"
                  className="min-h-[120px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {siteKey ? (
          <div className="flex flex-col items-center gap-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => {
                form.setValue("turnstileToken", token, { shouldValidate: true });
              }}
              onExpire={() => {
                form.setValue("turnstileToken", "", { shouldValidate: true });
              }}
              onError={() => {
                form.setValue("turnstileToken", "", { shouldValidate: true });
              }}
            />
            {form.formState.errors.turnstileToken ? (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.turnstileToken.message}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-sm text-amber-800">
            認証の設定が完了していません（PUBLIC_TURNSTILE_SITE_KEY）。
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !siteKey || !turnstileToken}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            "送信する"
          )}
        </Button>
      </form>
    </Form>
  );
}
