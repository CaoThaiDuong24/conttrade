'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Key,
  Users,
  Grid3x3,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface Stats {
  overview: {
    totalRoles: number
    totalPermissions: number
    totalUsers: number
    rolePermissionCount: number
    userRoleCount: number
  }
  roleDistribution: Array<{
    roleId: string
    roleName: string
    userCount: number
  }>
}

export default function RBACDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/admin/rbac/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải thống kê',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Quản lý Roles',
      description: 'Tạo, sửa, xóa roles trong hệ thống',
      icon: Shield,
      color: 'text-purple-500',
      href: '/admin/rbac/roles'
    },
    {
      title: 'Ma Trận Phân Quyền',
      description: 'Xem và chỉnh sửa permissions cho roles',
      icon: Grid3x3,
      color: 'text-blue-500',
      href: '/admin/rbac/matrix'
    },
    {
      title: 'Gán Roles cho Users',
      description: 'Quản lý vai trò của người dùng',
      icon: Users,
      color: 'text-green-500',
      href: '/admin/rbac/users'
    },
    {
      title: 'Quản lý Permissions',
      description: 'Tạo và quản lý permissions',
      icon: Key,
      color: 'text-orange-500',
      href: '/admin/rbac/permissions'
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Quản Lý Phân Quyền RBAC
        </h1>
        <p className="text-muted-foreground mt-2">
          Role-Based Access Control - Quản lý vai trò và quyền hạn trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalRoles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vai trò trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Permissions
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalPermissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Quyền hạn có thể gán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Người dùng đã đăng ký
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Role Assignments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.userRoleCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vai trò đã được gán
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card
            key={action.href}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(action.href)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <action.icon className={`h-8 w-8 ${action.color}`} />
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân Bố Roles</CardTitle>
          <CardDescription>
            Số lượng người dùng theo từng role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.roleDistribution.map((role) => (
              <div key={role.roleId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{role.roleName}</span>
                </div>
                <Badge variant="secondary">
                  {role.userCount} users
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Lưu ý quan trọng
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Khi thay đổi permissions của một role, tất cả users có role đó sẽ được cập nhật
                quyền hạn ngay lập tức. Hãy cẩn thận khi chỉnh sửa system roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
