import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReviewsPage() {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t("reviews")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("reviews")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Người đánh giá</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ORD-0001</TableCell>
                  <TableCell>Nguyễn Văn A</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


