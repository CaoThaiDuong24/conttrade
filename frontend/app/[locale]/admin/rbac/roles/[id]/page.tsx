'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Shield, ArrowLeft, Save, Users, Key, Search, Filter } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Permission {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  categoryLabel?: string
  categoryIcon?: string
}

interface Role {
  id: string
  code: string
  name: string
  description: string | null
  level: number
  isSystemRole: boolean
  permissionCount: number
  userCount: number
  permissions: Array<{
    id: string
    code: string
    name: string
    category: string | null
    scope: string
  }>
}

export default function RolePermissionsPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  const { toast } = useToast()

  const [role, setRole] = useState<Role | null>(null)
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [roleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      if (!token) {
        router.push('/auth/login?redirect=/admin/rbac/roles/' + roleId)
        return
      }

      // Fetch role details
      const roleResponse = await fetch(`http://localhost:3006/api/v1/admin/rbac/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!roleResponse.ok) {
        throw new Error('Failed to fetch role')
      }

      const roleData = await roleResponse.json()
      
      if (roleData.success) {
        setRole(roleData.data)
        const currentPermissions = new Set<string>(roleData.data.permissions.map((p: any) => p.id))
        setSelectedPermissions(currentPermissions)
      }

      // Fetch all permissions
      const permissionsResponse = await fetch('http://localhost:3006/api/v1/admin/rbac/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!permissionsResponse.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const permissionsData = await permissionsResponse.json()
      
      if (permissionsData.success) {
        setAllPermissions(permissionsData.data.all || [])
      }

    } catch (error: any) {
      console.error('Fetch error:', error)
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải dữ liệu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      console.log('🔐 Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN')
      console.log('📦 Payload:', {
        roleId: roleId,
        permissionIds: Array.from(selectedPermissions),
        scope: 'GLOBAL'
      })

      const response = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleId: roleId,
          permissionIds: Array.from(selectedPermissions),
          scope: 'GLOBAL'
        })
      })

      console.log('📡 Response status:', response.status, response.statusText)
      
      const responseText = await response.text()
      console.log('📄 Response body:', responseText)
      
      const data = JSON.parse(responseText)

      if (data.success) {
        toast({
          title: 'Thành công',
          description: data.message
        })
        fetchData() // Reload to get updated counts
      } else {
        throw new Error(data.message || data.error || JSON.stringify(data))
      }
    } catch (error: any) {
      console.error('❌ Save error:', error)
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu permissions',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId)
    } else {
      newSelected.add(permissionId)
    }
    setSelectedPermissions(newSelected)
  }

  const toggleCategory = (category: string) => {
    const categoryPermissions = allPermissions.filter(p => (p.category || 'other') === category)
    const allSelected = categoryPermissions.every(p => selectedPermissions.has(p.id))
    
    const newSelected = new Set(selectedPermissions)
    categoryPermissions.forEach(p => {
      if (allSelected) {
        newSelected.delete(p.id)
      } else {
        newSelected.add(p.id)
      }
    })
    setSelectedPermissions(newSelected)
  }

  const selectAll = () => {
    setSelectedPermissions(new Set(allPermissions.map(p => p.id)))
  }

  const clearAll = () => {
    setSelectedPermissions(new Set())
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    const category = perm.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  // Filter permissions based on search
  const filteredPermissions = Object.entries(permissionsByCategory).reduce((acc, [category, perms]) => {
    const filtered = perms.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0 && (selectedCategory === 'all' || selectedCategory === category)) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, Permission[]>)

  const categories = Object.keys(permissionsByCategory)
  const hasChanges = JSON.stringify(Array.from(selectedPermissions).sort()) !== 
                     JSON.stringify((role?.permissions || []).map(p => p.id).sort())

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy role</p>
            <Button onClick={() => router.push('/admin/rbac/roles')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/rbac/roles')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {role.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role.description || 'Chỉnh sửa quyền hạn cho role này'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">
              Có thay đổi chưa lưu
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Role Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mã Role</CardDescription>
            <CardTitle className="text-lg font-mono">{role.code}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Level</CardDescription>
            <CardTitle className="text-lg">
              <Badge variant="secondary">Level {role.level}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Permissions hiện tại</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-4 w-4" />
              {selectedPermissions.size} / {allPermissions.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Số người dùng</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              {role.userCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Permissions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý Permissions</CardTitle>
              <CardDescription>
                Chọn các quyền hạn cho role này
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Chọn tất cả
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Bỏ chọn tất cả
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Permissions by Category */}
          <Accordion type="multiple" defaultValue={categories} className="w-full">
            {Object.entries(filteredPermissions).map(([category, permissions]) => {
              const allCategorySelected = permissions.every(p => selectedPermissions.has(p.id))
              const someCategorySelected = permissions.some(p => selectedPermissions.has(p.id))
              
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allCategorySelected}
                          onCheckedChange={() => toggleCategory(category)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <span className="font-semibold capitalize">{category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {permissions.filter(p => selectedPermissions.has(p.id)).length}/{permissions.length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 pl-6">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedPermissions.has(permission.id)
                              ? 'bg-primary/5 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={selectedPermissions.has(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{permission.name}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {permission.code}
                              </p>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {Object.keys(filteredPermissions).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy permissions nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button at bottom */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Đang lưu...' : `Lưu thay đổi (${selectedPermissions.size} permissions)`}
          </Button>
        </div>
      )}
    </div>
  )
}
