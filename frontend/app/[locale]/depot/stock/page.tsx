import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DepotStockPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("depotStock")}</h1>
          <p className="text-muted-foreground">Danh sách tồn kho container theo Depot</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder={t("search")} className="w-64" />
          <Button>{t("search")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("depotStock")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("depot")}</TableHead>
                  <TableHead>{t("location")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("size")}</TableHead>
                  <TableHead>{t("condition")}</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Depot Hải Phòng</TableCell>
                  <TableCell>Hải Phòng</TableCell>
                  <TableCell>DRY</TableCell>
                  <TableCell>20ft</TableCell>
                  <TableCell>CW</TableCell>
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


