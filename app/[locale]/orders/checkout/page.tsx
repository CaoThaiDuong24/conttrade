import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t("checkout")}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Họ và tên</Label>
                <Input placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <Label>Email</Label>
                <Input placeholder="name@example.com" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input placeholder="0909xxxxxx" />
              </div>
              <div>
                <Label>Mã đơn hàng</Label>
                <Input placeholder="ORD-0001" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Tạm tính</span><span>0 VND</span></div>
              <div className="flex justify-between"><span>Phí dịch vụ</span><span>0 VND</span></div>
              <div className="flex justify-between font-semibold"><span>Tổng</span><span>0 VND</span></div>
            </div>
            <Button className="w-full mt-4">Tiếp tục đến Escrow</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


