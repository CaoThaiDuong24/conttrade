import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default async function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations("common");

  const tiles = [
    { href: `/admin/users`, title: t("usersAndRoles"), desc: "Quản lý người dùng, vai trò, quyền hạn" },
    { href: `/admin/listings`, title: t("listingModeration"), desc: "Kiểm duyệt tin đăng, vi phạm" },
    { href: `/admin/disputes`, title: t("disputeManagement"), desc: "Xử lý khiếu nại" },
    { href: `/admin/config`, title: t("configurationSettings"), desc: "Cấu hình hệ thống, biểu phí, thuế, flag" },
    { href: `/admin/templates`, title: t("templates"), desc: "Mẫu email/SMS/thông báo" },
    { href: `/admin/audit`, title: t("auditLogs"), desc: "Nhật ký kiểm toán" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t("adminDashboard")}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {tiles.map((tile) => (
          <Card key={tile.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{tile.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tile.desc}</p>
              <Button asChild>
                <Link href={tile.href}>Mở</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


