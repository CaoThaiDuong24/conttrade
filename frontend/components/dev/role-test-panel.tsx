'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role } from '@/lib/auth/client-rbac-service';
import { useAuth } from '@/components/providers/auth-context';

// Development only - Role testing panel
export function RoleTestPanel() {
  const { user, setTestUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('buyer');

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const roles: { value: Role; label: string }[] = [
    { value: 'buyer', label: 'Người mua' },
    { value: 'seller', label: 'Người bán' },
    { value: 'depot_staff', label: 'Nhân viên Depot' },
    { value: 'inspector', label: 'Giám định viên' },
    { value: 'depot_manager', label: 'Quản lý Depot' },
    { value: 'customer_support', label: 'Hỗ trợ khách hàng' },
    { value: 'price_manager', label: 'Quản lý giá' },
    { value: 'finance', label: 'Kế toán/Đối soát' },
    { value: 'config_manager', label: 'Quản lý cấu hình' },
    { value: 'admin', label: 'Quản trị hệ thống' },
  ];

  const handleRoleChange = (role: Role) => {
    if (setTestUser) {
      setTestUser({
        id: 'test-user',
        email: 'test@example.com',
        fullName: `Test ${role}`,
        avatar: '/placeholder-user.jpg',
        roles: [role],
        permissions: [], // Will be set by auth context
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-700 dark:text-yellow-300">
          🧪 Role Tester (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select value={selectedRole} onValueChange={(value: Role) => {
          setSelectedRole(value);
          handleRoleChange(value);
        }}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value} className="text-xs">
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {user?.roles?.[0] || 'guest'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {user?.permissions?.length || 0} quyền
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}