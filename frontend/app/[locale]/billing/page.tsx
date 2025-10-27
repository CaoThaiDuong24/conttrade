import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BillingPage() {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t("billingHistory")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("billingHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Diễn giải</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>Phí thuê bao Pro</TableCell>
                  <TableCell>0 VND</TableCell>
                  <TableCell>paid</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


