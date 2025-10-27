import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

export default function FinanceReconcilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đối soát tài chính</h1>
          <p className="text-muted-foreground">
            Quản lý và đối soát các giao dịch tài chính
          </p>
        </div>
        <Badge variant="outline">Finance Only</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5B VND</div>
            <p className="text-xs text-muted-foreground">
              +15% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giao dịch chờ đối soát
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              cần xử lý trong tuần
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hoa hồng tháng
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125M VND</div>
            <p className="text-xs text-muted-foreground">
              từ 250 giao dịch
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chức năng tài chính</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Trang này chỉ hiển thị cho user có role RL-FIN hoặc RL-ADMIN.
            Các chức năng bao gồm:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Đối soát giao dịch</li>
            <li>Xuất hóa đơn</li>
            <li>Theo dõi doanh thu</li>
            <li>Quản lý hoa hồng</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}