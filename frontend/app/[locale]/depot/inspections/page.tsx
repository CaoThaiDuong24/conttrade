import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function InspectionsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("inspection")}</h1>
          <p className="text-muted-foreground">Quản lý yêu cầu giám định theo tiêu chuẩn IICL</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder={t("search")} className="w-64" />
          <Button>{t("search")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inspection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã yêu cầu</TableHead>
                  <TableHead>Depot</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Tiêu chuẩn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>INSP-0001</TableCell>
                  <TableCell>Depot Hải Phòng</TableCell>
                  <TableCell>CONT-XXXX</TableCell>
                  <TableCell>IICL</TableCell>
                  <TableCell>pending</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


