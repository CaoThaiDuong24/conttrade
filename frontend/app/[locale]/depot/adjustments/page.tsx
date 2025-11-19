import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function StockAdjustmentsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("stockAdjustments")}</h1>
          <p className="text-muted-foreground">Điều chỉnh tồn kho theo Depot</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder={t("search")} className="w-64" />
          <Button>{t("search")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("stockAdjustments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Depot</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Kiểm kê</TableCell>
                  <TableCell>CONT-XXXX</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


