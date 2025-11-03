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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Shield, Plus, Edit, Trash2, Users, Key, Copy, CheckCircle } from 'lucide-react'

interface Role {
  id: string
  code: string
  name: string
  description: string | null
  level: number
  isSystemRole: boolean
  permissionCount: number
  userCount: number
  createdAt: string
  updatedAt: string
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    level: 0
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (!token) {
      console.warn('⚠️ No token found, redirecting to login...')
      router.push('/auth/login?redirect=/admin/rbac/roles')
      return
    }
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
      
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.')
      }
      
      console.log('📡 Sending request to:', '/api/v1/admin/rbac/roles')
      
      const response = await fetch('/api/v1/admin/rbac/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('📋 Roles Data:', data)
      console.log('📋 Success:', data.success)
      console.log('📋 Data array:', data.data)
      console.log('📋 Data length:', data.data?.length)
      
      if (data.success) {
        console.log(`✅ Setting ${data.data.length} roles to state`)
        setRoles(data.data)
        toast({
          title: 'Thành công',
          description: `Đã tải ${data.data.length} roles`
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Fetch roles error:', error)
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách roles',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRole(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      level: 0
    })
    setDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description || '',
      level: role.level
    })
    setDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      const url = editingRole
        ? `/api/v1/admin/rbac/roles/${editingRole.id}`
        : '/api/v1/admin/rbac/roles'

      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Thành công',
          description: data.message
        })
        setDialogOpen(false)
        fetchRoles()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      const response = await fetch(`/api/v1/admin/rbac/roles/${roleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Thành công',
          description: data.message
        })
        setDeleteDialogOpen(false)
        fetchRoles()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 100) return 'bg-red-500' // Admin
    if (level >= 80) return 'bg-purple-500' // Config Manager
    if (level >= 70) return 'bg-blue-500' // Finance
    if (level >= 60) return 'bg-indigo-500' // Price Manager
    if (level >= 50) return 'bg-pink-500' // Customer Support
    if (level >= 30) return 'bg-yellow-500' // Depot Manager
    if (level >= 25) return 'bg-teal-500' // Inspector
    if (level >= 20) return 'bg-green-500' // Depot Staff
    return 'bg-orange-500' // Seller/Buyer
  }

  const getRoleBadgeInfo = (code: string) => {
    const roleInfo: Record<string, { color: string; label: string; icon: string }> = {
      'admin': { color: 'bg-red-500', label: 'Quản trị viên', icon: '👑' },
      'config_manager': { color: 'bg-purple-500', label: 'Quản lý cấu hình', icon: '⚙️' },
      'finance': { color: 'bg-blue-500', label: 'Kế toán', icon: '💰' },
      'price_manager': { color: 'bg-indigo-500', label: 'Quản lý giá', icon: '💲' },
      'customer_support': { color: 'bg-pink-500', label: 'Hỗ trợ KH', icon: '🎧' },
      'depot_manager': { color: 'bg-yellow-500', label: 'Quản lý kho', icon: '🏭' },
      'inspector': { color: 'bg-teal-500', label: 'Giám định viên', icon: '🔍' },
      'depot_staff': { color: 'bg-green-500', label: 'Nhân viên kho', icon: '👷' },
      'seller': { color: 'bg-orange-500', label: 'Người bán', icon: '🏪' },
      'buyer': { color: 'bg-cyan-500', label: 'Người mua', icon: '🛒' },
    }
    return roleInfo[code] || { color: 'bg-gray-500', label: code, icon: '👤' }
  }

  const demoAccounts: Record<string, { email: string; password: string }> = {
    'admin': { email: 'admin@i-contexchange.vn', password: 'admin123' },
    'config_manager': { email: 'config@example.com', password: 'config123' },
    'finance': { email: 'finance@example.com', password: 'finance123' },
    'price_manager': { email: 'price@example.com', password: 'price123' },
    'customer_support': { email: 'support@example.com', password: 'support123' },
    'depot_manager': { email: 'manager@example.com', password: 'manager123' },
    'inspector': { email: 'inspector@example.com', password: 'inspector123' },
    'depot_staff': { email: 'depot@example.com', password: 'depot123' },
    'seller': { email: 'seller@example.com', password: 'seller123' },
    'buyer': { email: 'buyer@example.com', password: 'buyer123' },
  }

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEmail(text)
      setTimeout(() => setCopiedEmail(null), 2000)
      toast({
        title: 'Đã copy',
        description: `Đã copy ${type === 'email' ? 'email' : 'password'}`,
      })
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể copy',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Real-time Permission Warning Alert */}
      <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-yellow-900 dark:text-yellow-100 text-base">
                ⚠️ Cơ chế Phân quyền Real-time
              </CardTitle>
              <CardDescription className="text-yellow-800 dark:text-yellow-200 mt-2 space-y-2">
                <p className="font-medium">
                  Hệ thống đã được tích hợp <strong>3 tầng bảo mật tự động</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                  <li><strong>Backend Validation:</strong> Mọi API request kiểm tra quyền từ database real-time</li>
                  <li><strong>Token Versioning:</strong> Mỗi role có version, tự động tăng khi admin sửa permissions</li>
                  <li><strong>Auto Logout:</strong> Users đang online sẽ tự động logout trong 60s khi quyền thay đổi</li>
                </ul>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mt-3 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                  💡 Khi bạn chỉnh sửa permissions của bất kỳ role nào, tất cả users có role đó sẽ <strong>TỰ ĐỘNG</strong> bị yêu cầu đăng nhập lại để cập nhật quyền mới.
                </p>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Roles Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quản lý Roles
              </CardTitle>
              <CardDescription>
                Quản lý vai trò và phân cấp quyền hạn trong hệ thống
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Role Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không có dữ liệu roles.</p>
              <p className="text-sm text-red-500 mt-2">Vui lòng kiểm tra console để xem lỗi chi tiết.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Mã Role</TableHead>
                  <TableHead>Tên Role</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Permissions</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead>Tài khoản Demo</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const badgeInfo = getRoleBadgeInfo(role.code)
                  const demoAccount = demoAccounts[role.code]
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="text-2xl">{badgeInfo.icon}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{role.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={`${badgeInfo.color} text-white border-0`}>
                            {role.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {role.description || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getLevelColor(role.level)} text-white border-0`}>
                          Level {role.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                          <Key className="h-3 w-3" />
                          {role.permissionCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                          <Users className="h-3 w-3" />
                          {role.userCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {demoAccount ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => copyToClipboard(demoAccount.email, 'email')}
                              className="text-xs font-mono hover:underline flex items-center gap-1 group"
                              title="Click để copy email"
                            >
                              📧 {demoAccount.email}
                              {copiedEmail === demoAccount.email ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(demoAccount.password, 'password')}
                              className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 group"
                              title="Click để copy password"
                            >
                              🔑 {demoAccount.password}
                              {copiedEmail === demoAccount.password ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {role.isSystemRole && (
                          <Badge variant="destructive">System</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/rbac/roles/${role.id}`)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Permissions
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(role)}
                            disabled={role.isSystemRole}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(role)}
                            disabled={role.isSystemRole || role.userCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Chỉnh sửa Role' : 'Tạo Role Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Cập nhật thông tin role'
                : 'Tạo role mới với mã, tên và level phù hợp'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Mã Role *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="vd: custom_role"
                disabled={!!editingRole}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Tên Role *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="vd: Vai trò tùy chỉnh"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả vai trò và quyền hạn"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="level">Level (0-100) *</Label>
              <Input
                id="level"
                type="number"
                min="0"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Level càng cao càng có nhiều quyền hạn (Admin: 100, User: 10)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingRole ? 'Cập nhật' : 'Tạo Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa role <strong>{roleToDelete?.name}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
