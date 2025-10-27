import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const t = useTranslations("common");

  const plans = [
    { id: "basic", name: "Basic", price: "0 VND/tháng", features: ["5 tin đăng", "Hỗ trợ email"] },
    { id: "pro", name: "Pro", price: "499,000 VND/tháng", features: ["50 tin đăng", "RFQ nâng cao", "Hỗ trợ ưu tiên"] },
    { id: "enterprise", name: "Enterprise", price: "Liên hệ", features: ["Không giới hạn", "Tài khoản nhóm", "SLA"] },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t("subscriptions")}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold mb-4">{p.price}</div>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button className="w-full mt-6">{t("selectPlan")}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


