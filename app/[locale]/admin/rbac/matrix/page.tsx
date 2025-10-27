'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { Grid3x3, Save, Search, Filter, Info, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Role {
  id: string
  code: string
  name: string
  level: number
}

interface Permission {
  id: string
  code: string
  name: string
  description?: string | null
  category: string | null
}

interface MatrixRow {
  permissionId: string
  code: string
  name: string
  description?: string | null
  category: string | null
  categoryLabel?: string
  categoryIcon?: string
  categorySortOrder?: number
  [key: string]: any // For dynamic role columns
}

export default function PermissionMatrixPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [matrix, setMatrix] = useState<MatrixRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchMatrix()
  }, [])

  const fetchMatrix = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      const response = await fetch('http://localhost:3006/api/v1/admin/rbac/permission-matrix', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Permission Matrix Data:', data)
      
      if (data.success) {
        setRoles(data.data.roles)
        setPermissions(data.data.permissions)
        setMatrix(data.data.matrix)
        
        // Extract unique categories
        const cats = [...new Set(data.data.permissions.map((p: Permission) => p.category).filter(Boolean))]
        setCategories(cats as string[])
        
        // Expand all categories by default
        setExpandedCategories(new Set(cats as string[]))
        
        toast({
          title: 'Thành công',
          description: `Đã tải ${data.data.permissions.length} permissions và ${data.data.roles.length} roles`
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Fetch matrix error:', error)
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải ma trận phân quyền',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (permissionId: string, roleCode: string, currentValue: boolean) => {
    // Update matrix
    setMatrix(prev => prev.map(row => {
      if (row.permissionId === permissionId) {
        return { ...row, [roleCode]: !currentValue }
      }
      return row
    }))

    // Track changes
    const key = `${permissionId}-${roleCode}`
    setChanges(prev => new Map(prev).set(key, !currentValue))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

      // Convert matrix to role-permission assignments
      const assignments = roles.map(role => {
        const permissionIds = matrix
          .filter(row => row[role.code] === true)
          .map(row => row.permissionId)

        return {
          roleId: role.id,
          permissionIds
        }
      })

      // Save each role's permissions
      for (const assignment of assignments) {
        console.log('📦 Saving assignment for role:', assignment.roleId, 'permissions:', assignment.permissionIds.length)
        
        const response = await fetch('http://localhost:3006/api/v1/admin/rbac/role-permissions/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(assignment)
        })

        console.log('📡 Response:', response.status, response.statusText)
        
        const responseText = await response.text()
        console.log('📄 Response body:', responseText)
        
        const data = JSON.parse(responseText)
        
        if (!data.success) {
          throw new Error(data.message || data.error || JSON.stringify(data))
        }
      }

      toast({
        title: 'Thành công',
        description: 'Đã lưu ma trận phân quyền'
      })

      setChanges(new Map()) // Clear changes
      fetchMatrix() // Refresh
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredMatrix = matrix.filter(row => {
    const matchesSearch = searchTerm === '' ||
  row.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  permissionLabel(row).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' ||
      row.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Group permissions by category
  const groupedPermissions = filteredMatrix.reduce((acc, row) => {
    const category = row.category || 'Khác'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(row)
    return acc
  }, {} as Record<string, MatrixRow[]>)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const toggleAllCategories = () => {
    if (expandedCategories.size === Object.keys(groupedPermissions).length) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(Object.keys(groupedPermissions)))
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'bg-purple-500'
    if (level >= 60) return 'bg-blue-500'
    if (level >= 40) return 'bg-green-500'
    if (level >= 20) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  // If permission.name is an UPPER_CASE code (e.g. VIEW_LISTINGS), prefer to show
  // the Vietnamese description as the visible label. Otherwise show name.
  const permissionLabel = (p: Permission | MatrixRow) => {
    if (!p) return ''
    const name = (p as any).name
    const description = (p as any).description
    const isCodeStyle = typeof name === 'string' && /^[A-Z0-9_\-]+$/.test(name)
    if (isCodeStyle) return description || name
    return name
  }

  // Get category label from matrix row (comes from API)
  const getCategoryLabel = (row: MatrixRow | string | null) => {
    if (!row) return '❓ Khác'
    
    // If row is a string (category code), find it in matrix
    if (typeof row === 'string') {
      const matchingRow = matrix.find(r => r.category === row)
      if (matchingRow?.categoryLabel) {
        const icon = matchingRow.categoryIcon || '❓'
        return `${icon} ${matchingRow.categoryLabel}`
      }
      return row
    }
    
    // If row is a MatrixRow object
    if (row.categoryLabel) {
      const icon = row.categoryIcon || '❓'
      return `${icon} ${row.categoryLabel}`
    }
    return row.category || '❓ Khác'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Đang tải ma trận phân quyền...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Ma Trận Phân Quyền
              </CardTitle>
              <CardDescription>
                Quản lý permissions cho tất cả roles trong một ma trận trực quan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {changes.size > 0 && (
                <Badge variant="secondary">
                  {changes.size} thay đổi chưa lưu
                </Badge>
              )}
              <Button onClick={handleSave} disabled={saving || changes.size === 0}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm permission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả modules</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleAllCategories}
            >
              {expandedCategories.size === Object.keys(groupedPermissions).length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
            </Button>
          </div>

          {/* Matrix Table with Grouped Categories */}
          <TooltipProvider>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0 z-20">
                    <tr>
                      <th className="sticky left-0 z-30 bg-muted/50 px-4 py-3 text-left text-sm font-medium border-r min-w-[300px]">
                        <div>
                          <div className="font-semibold">Permission</div>
                          <div className="text-xs font-normal text-muted-foreground mt-0.5">
                            Code • Name • Description
                          </div>
                        </div>
                      </th>
                      {roles.map(role => (
                        <th
                          key={role.id}
                          className="px-4 py-3 text-center text-sm font-medium border-r min-w-[120px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">{role.name}</span>
                            <Badge className={cn('text-xs text-white', getLevelColor(role.level))}>
                              Level {role.level}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedPermissions).map(([category, rows]) => {
                      const isExpanded = expandedCategories.has(category)
                      return (
                        <React.Fragment key={category}>
                          {/* Category Header Row */}
                          <tr className="bg-muted/80 border-t-2 border-muted-foreground/20">
                            <td 
                              colSpan={roles.length + 1} 
                              className="sticky left-0 z-10 bg-muted/80"
                            >
                              <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-4 py-3 flex items-center gap-2 hover:bg-muted transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <Badge variant="secondary" className="font-semibold text-sm">
                                  {getCategoryLabel(rows[0])}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  ({rows.length} quyền)
                                </span>
                              </button>
                            </td>
                          </tr>
                          
                          {/* Permission Rows */}
                          {isExpanded && rows.map((row, index) => (
                            <tr
                              key={row.permissionId}
                              className={cn(
                                'border-t hover:bg-muted/30 transition-colors',
                                index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                              )}
                            >
                              <td className="sticky left-0 z-10 bg-inherit px-4 py-3 border-r min-w-[300px]">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                      {row.code}
                                    </span>
                                    {row.description && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-md">
                                          <p className="text-sm">{row.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <div className="font-semibold text-sm">{permissionLabel(row)}</div>
                                  {row.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                      {row.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              {roles.map(role => (
                                <td
                                  key={`${row.permissionId}-${role.id}`}
                                  className="px-4 py-3 text-center border-r"
                                >
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      checked={row[role.code] === true}
                                      onCheckedChange={() =>
                                        handleCheckboxChange(row.permissionId, role.code, row[role.code])
                                      }
                                      disabled={role.code === 'admin'} // Admin always has all perms
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TooltipProvider>

          {filteredMatrix.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy permission nào
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Tổng Roles</div>
                <div className="text-2xl font-bold">{roles.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tổng Permissions</div>
                <div className="text-2xl font-bold">{permissions.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Đang hiển thị</div>
                <div className="text-2xl font-bold">{filteredMatrix.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Chưa lưu</div>
                <div className="text-2xl font-bold text-orange-500">{changes.size}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
