import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DepotTransfersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("depotTransfers")}</h1>
          <p className="text-muted-foreground">Chuyển container giữa các Depot</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder={t("search")} className="w-64" />
          <Button>{t("search")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("depotTransfers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Depot đi</TableHead>
                  <TableHead>Depot đến</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>CONT-XXXX</TableCell>
                  <TableCell>pending</TableCell>
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


