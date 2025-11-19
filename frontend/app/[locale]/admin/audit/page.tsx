"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  timestamp: string;
  changes?: Record<string, any>;
}

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/v1/admin/audit-logs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data.data.logs || []);
        } else {
          console.error('Failed to fetch audit logs');
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    const icons = {
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      failure: <XCircle className="h-4 w-4 text-red-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failure: 'destructive',
      warning: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const variants = {
      LOGIN: 'default',
      CREATE: 'secondary',
      UPDATE: 'outline',
      DELETE: 'destructive',
      APPROVE: 'default',
      REJECT: 'destructive'
    } as const;
    
    return <Badge variant={variants[action as keyof typeof variants] || 'outline'}>{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhật ký kiểm toán</h1>
          <p className="text-muted-foreground">Theo dõi và giám sát hoạt động hệ thống</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.filter(l => l.status === 'success').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.filter(l => l.status === 'failure').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.filter(l => l.status === 'warning').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Hành động, người dùng, chi tiết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Hành động</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="LOGIN">Đăng nhập</SelectItem>
                  <SelectItem value="CREATE">Tạo mới</SelectItem>
                  <SelectItem value="UPDATE">Cập nhật</SelectItem>
                  <SelectItem value="DELETE">Xóa</SelectItem>
                  <SelectItem value="APPROVE">Duyệt</SelectItem>
                  <SelectItem value="REJECT">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failure">Thất bại</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hoạt động</CardTitle>
          <CardDescription>
            {filteredLogs.length} bản ghi được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hành động</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Tài nguyên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-muted-foreground">{log.userRole}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.resource}</div>
                      <div className="text-sm text-muted-foreground">ID: {log.resourceId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{log.details}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {log.timestamp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedLog(log);
                          setIsDetailDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết nhật ký</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hoạt động được ghi lại
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hành động</Label>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    {getActionBadge(selectedLog.action)}
                  </div>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <div className="text-sm">{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Người thực hiện</Label>
                  <div className="text-sm">
                    <div className="font-medium">{selectedLog.userName}</div>
                    <div className="text-muted-foreground">Role: {selectedLog.userRole}</div>
                    <div className="text-muted-foreground">ID: {selectedLog.userId}</div>
                  </div>
                </div>
                <div>
                  <Label>Tài nguyên</Label>
                  <div className="text-sm">
                    <div className="font-medium">{selectedLog.resource}</div>
                    <div className="text-muted-foreground">ID: {selectedLog.resourceId}</div>
                  </div>
                </div>
              </div>
              <div>
                <Label>Chi tiết</Label>
                <div className="text-sm bg-muted p-3 rounded">{selectedLog.details}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Địa chỉ IP</Label>
                  <div className="text-sm font-mono">{selectedLog.ipAddress}</div>
                </div>
                <div>
                  <Label>Thời gian</Label>
                  <div className="text-sm">{selectedLog.timestamp}</div>
                </div>
              </div>
              <div>
                <Label>User Agent</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded text-xs">
                  {selectedLog.userAgent}
                </div>
              </div>
              {selectedLog.changes && (
                <div>
                  <Label>Thay đổi</Label>
                  <div className="text-sm bg-muted p-3 rounded">
                    <pre>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}