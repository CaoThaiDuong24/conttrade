import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EscrowPage() {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Escrow</h1>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản ký quỹ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã escrow</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ESC-0001</TableCell>
                  <TableCell>ORD-0001</TableCell>
                  <TableCell>0 VND</TableCell>
                  <TableCell>pending</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Nạp tiền</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


