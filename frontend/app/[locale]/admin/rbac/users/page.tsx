'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { UserCog, Search, Shield } from 'lucide-react'

interface User {
  id: string
  email: string
  display_name: string
  status: string
  roles?: Role[]
}

interface Role {
  id: string
  code: string
  name: string
  level: number
  permissionCount?: number
}

export default function UserRoleAssignmentPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch users
      const usersResponse = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const usersData = await usersResponse.json()

      // Fetch roles
      const rolesResponse = await fetch('/api/v1/admin/rbac/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const rolesData = await rolesResponse.json()

      if (usersData.success && rolesData.success) {
        setUsers(usersData.data)
        setRoles(rolesData.data)
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải dữ liệu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRoles = async (user: User) => {
    setSelectedUser(user)

    // Fetch user's current roles
    try {
      const response = await fetch(`/api/v1/admin/rbac/users/${user.id}/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setSelectedRoles(data.data.map((r: any) => r.id))
      }
    } catch (error) {
      setSelectedRoles([])
    }

    setDialogOpen(true)
  }

  const handleSaveRoles = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/v1/admin/rbac/user-roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          roleIds: selectedRoles
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Thành công',
          description: data.message
        })
        setDialogOpen(false)
        fetchData()
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

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'bg-purple-500'
    if (level >= 60) return 'bg-blue-500'
    if (level >= 40) return 'bg-green-500'
    if (level >= 20) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Gán Roles cho Users
              </CardTitle>
              <CardDescription>
                Quản lý vai trò của người dùng trong hệ thống
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm user theo email hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Roles hiện tại</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.display_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role.id} variant="outline">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa có role</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignRoles(user)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Gán Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy user nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Roles Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gán Roles cho User</DialogTitle>
            <DialogDescription>
              User: <strong>{selectedUser?.email}</strong>
              <br />
              Chọn các roles muốn gán cho user này
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleRole(role.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.code}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(role.level)}>
                      Level {role.level}
                    </Badge>
                    <Badge variant="secondary">
                      {role.permissionCount || 0} perms
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveRoles}>
              Lưu Thay Đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
