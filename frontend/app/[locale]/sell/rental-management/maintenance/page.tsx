'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Search,
  Filter,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

interface MaintenanceLog {
  id: number
  listing_id: number
  container_id: number
  container_number: string
  container_type: string
  maintenance_type: string
  description: string
  scheduled_date: string
  completion_date?: string
  estimated_cost: string
  actual_cost?: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  performed_by?: string
  notes?: string
  photos?: string[]
  created_at: string
}

export default function MaintenancePage() {
  const t = useTranslations('rentalManagement.maintenance')
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  const [createForm, setCreateForm] = useState({
    container_id: '',
    maintenance_type: '',
    scheduled_date: '',
    estimated_cost: '',
    description: '',
  })

  const [updateForm, setUpdateForm] = useState({
    status: '',
    actual_cost: '',
    completion_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchMaintenanceLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, statusFilter])

  const fetchMaintenanceLogs = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/maintenance-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch maintenance logs')
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Error fetching maintenance logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.container_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.maintenance_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    setFilteredLogs(filtered)
  }

  const handleCreateMaintenance = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch('/api/v1/maintenance-logs', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...createForm,
          container_id: parseInt(createForm.container_id),
          estimated_cost: parseFloat(createForm.estimated_cost),
          status: 'SCHEDULED',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create maintenance log')
      }

      alert('Maintenance scheduled successfully')
      setShowCreateDialog(false)
      setCreateForm({
        container_id: '',
        maintenance_type: '',
        scheduled_date: '',
        estimated_cost: '',
        description: '',
      })
      fetchMaintenanceLogs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create maintenance log')
    }
  }

  const handleUpdateMaintenance = async () => {
    if (!selectedLog) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/maintenance-logs/${selectedLog.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          status: updateForm.status,
          actual_cost: updateForm.actual_cost ? parseFloat(updateForm.actual_cost) : undefined,
          completion_date: updateForm.completion_date || undefined,
          notes: updateForm.notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update maintenance log')
      }

      alert('Maintenance log updated successfully')
      setShowUpdateDialog(false)
      fetchMaintenanceLogs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update maintenance log')
    }
  }

  const handleCancelMaintenance = async (logId: number) => {
    if (!confirm('Are you sure you want to cancel this maintenance?')) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/maintenance-logs/${logId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel maintenance')
      }

      alert('Maintenance cancelled successfully')
      fetchMaintenanceLogs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel maintenance')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      SCHEDULED: { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800', icon: Calendar },
      IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800', icon: XCircle },
    }
    const cfg = config[status as keyof typeof config] || config.SCHEDULED
    const Icon = cfg.icon
    return (
      <Badge className={cfg.className}>
        <Icon className="w-3 h-3 mr-1 inline" />
        {cfg.label}
      </Badge>
    )
  }

  const getStatusProgress = (status: string) => {
    const progress = {
      SCHEDULED: 25,
      IN_PROGRESS: 50,
      COMPLETED: 100,
      CANCELLED: 0,
    }
    return progress[status as keyof typeof progress] || 0
  }

  const stats = {
    total: logs.length,
    scheduled: logs.filter((l) => l.status === 'SCHEDULED').length,
    inProgress: logs.filter((l) => l.status === 'IN_PROGRESS').length,
    completed: logs.filter((l) => l.status === 'COMPLETED').length,
    totalEstimated: logs.reduce((sum, l) => sum + parseFloat(l.estimated_cost), 0),
    totalActual: logs.reduce((sum, l) => sum + parseFloat(l.actual_cost || '0'), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold mt-2">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Đã lên lịch</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">{stats.scheduled}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold mt-2 text-green-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Chi phí ước tính</p>
              <p className="text-xl font-bold mt-2">${stats.totalEstimated.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Chi phí thực tế</p>
              <p className="text-xl font-bold mt-2 text-red-600">
                ${stats.totalActual.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lịch bảo trì</CardTitle>
              <CardDescription>Theo dõi và quản lý bảo trì container</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Lên lịch bảo trì
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo container hoặc loại bảo trì..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy bản ghi bảo trì</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{log.maintenance_type}</h3>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Container: {log.container_number} ({log.container_type})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Estimated</p>
                        <p className="font-bold text-lg">${log.estimated_cost}</p>
                        {log.actual_cost && (
                          <p className="text-sm text-red-600 mt-1">
                            Actual: ${log.actual_cost}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress value={getStatusProgress(log.status)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Ngày lên lịch</p>
                        <p className="text-sm font-medium">
                          {new Date(log.scheduled_date).toLocaleDateString()}
                        </p>
                      </div>
                      {log.completion_date && (
                        <div>
                          <p className="text-xs text-gray-600">Ngày hoàn thành</p>
                          <p className="text-sm font-medium">
                            {new Date(log.completion_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {log.performed_by && (
                        <div>
                          <p className="text-xs text-gray-600">Người thực hiện</p>
                          <p className="text-sm font-medium">{log.performed_by}</p>
                        </div>
                      )}
                      {log.photos && log.photos.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600">Hình ảnh</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {log.photos.length} ảnh
                          </p>
                        </div>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-sm text-gray-600 mb-4">{log.description}</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log)
                          setShowDetailsDialog(true)
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {(log.status === 'SCHEDULED' || log.status === 'IN_PROGRESS') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log)
                              setUpdateForm({
                                status: log.status,
                                actual_cost: log.actual_cost || '',
                                completion_date: log.completion_date || '',
                                notes: log.notes || '',
                              })
                              setShowUpdateDialog(true)
                            }}
                          >
                            Cập nhật trạng thái
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelMaintenance(log.id)}
                          >
                            Hủy
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lên lịch bảo trì</DialogTitle>
            <DialogDescription>Tạo lịch bảo trì mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="container_id">ID Container</Label>
              <Input
                id="container_id"
                type="number"
                value={createForm.container_id}
                onChange={(e) => setCreateForm({ ...createForm, container_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maintenance_type">Loại bảo trì</Label>
              <Input
                id="maintenance_type"
                value={createForm.maintenance_type}
                onChange={(e) =>
                  setCreateForm({ ...createForm, maintenance_type: e.target.value })
                }
                placeholder="vd: Kiểm tra, Sửa chữa, Vệ sinh"
              />
            </div>
            <div>
              <Label htmlFor="scheduled_date">Ngày lên lịch</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={createForm.scheduled_date}
                onChange={(e) =>
                  setCreateForm({ ...createForm, scheduled_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="estimated_cost">Chi phí ước tính ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={createForm.estimated_cost}
                onChange={(e) =>
                  setCreateForm({ ...createForm, estimated_cost: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateMaintenance}>Lên lịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật bảo trì</DialogTitle>
            <DialogDescription>Cập nhật trạng thái và chi tiết bảo trì</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={updateForm.status} onValueChange={(val) => setUpdateForm({ ...updateForm, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actual_cost">Chi phí thực tế ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                value={updateForm.actual_cost}
                onChange={(e) => setUpdateForm({ ...updateForm, actual_cost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="completion_date">Ngày hoàn thành</Label>
              <Input
                id="completion_date"
                type="date"
                value={updateForm.completion_date}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, completion_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateMaintenance}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết bảo trì</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Container</Label>
                  <p className="font-medium">{selectedLog.container_number}</p>
                  <p className="text-sm text-gray-500">{selectedLog.container_type}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Loại bảo trì</Label>
                  <p className="font-medium">{selectedLog.maintenance_type}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ngày lên lịch</Label>
                  <p className="font-medium">
                    {new Date(selectedLog.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Chi phí ước tính</Label>
                  <p className="font-medium text-lg">${selectedLog.estimated_cost}</p>
                </div>
                {selectedLog.actual_cost && (
                  <div>
                    <Label className="text-gray-600">Chi phí thực tế</Label>
                    <p className="font-medium text-lg text-red-600">${selectedLog.actual_cost}</p>
                  </div>
                )}
              </div>
              {selectedLog.description && (
                <div>
                  <Label className="text-gray-600">Mô tả</Label>
                  <p className="text-sm mt-1">{selectedLog.description}</p>
                </div>
              )}
              {selectedLog.notes && (
                <div>
                  <Label className="text-gray-600">Ghi chú</Label>
                  <p className="text-sm mt-1">{selectedLog.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
