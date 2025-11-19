'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Container,
  Filter,
  Grid3x3,
  List,
  Search,
  Plus,
  Wrench,
  DollarSign,
  MapPin,
  Calendar,
  Edit,
  Eye,
  Package
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ContainerItem {
  id: number
  container_number: string
  container_type: string
  size: string
  status: 'AVAILABLE' | 'RENTED' | 'IN_MAINTENANCE' | 'RESERVED' | 'SOLD'
  condition: string
  manufactured_year?: number
  location?: string
  rental_rate?: string
  current_rental?: {
    buyer_name: string
    end_date: string
  }
  maintenance_scheduled?: {
    date: string
    type: string
  }
  listing_id: number
}

export default function ContainersPage() {
  const t = useTranslations('rentalManagement.containers')
  const [containers, setContainers] = useState<ContainerItem[]>([])
  const [filteredContainers, setFilteredContainers] = useState<ContainerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: '',
    scheduled_date: '',
    estimated_cost: '',
    description: '',
  })

  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    rental_rate: '',
  })

  useEffect(() => {
    fetchContainers()
  }, [])

  useEffect(() => {
    filterContainers()
  }, [containers, searchQuery, statusFilter, typeFilter])

  const fetchContainers = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/rental/containers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch containers')
      }

      const data = await response.json()
      setContainers(data.containers || [])
    } catch (err) {
      console.error('Error fetching containers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterContainers = () => {
    let filtered = [...containers]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.container_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.container_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.container_type === typeFilter)
    }

    setFilteredContainers(filtered)
  }

  const handleScheduleMaintenance = async () => {
    if (!selectedContainer) return

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
          listing_id: selectedContainer.listing_id,
          container_id: selectedContainer.id,
          maintenance_type: maintenanceForm.type,
          scheduled_date: maintenanceForm.scheduled_date,
          estimated_cost: parseFloat(maintenanceForm.estimated_cost),
          description: maintenanceForm.description,
          status: 'SCHEDULED',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule maintenance')
      }

      alert('Maintenance scheduled successfully')
      setShowMaintenanceDialog(false)
      setMaintenanceForm({ type: '', scheduled_date: '', estimated_cost: '', description: '' })
      fetchContainers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to schedule maintenance')
    }
  }

  const handleUpdatePricing = async () => {
    if (!selectedContainer) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/listings/${selectedContainer.listing_id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          rental_price_per_month: parseFloat(pricingForm.rental_rate),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update pricing')
      }

      alert('Pricing updated successfully')
      setShowPricingDialog(false)
      setPricingForm({ rental_rate: '' })
      fetchContainers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update pricing')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { label: 'Có sẵn', className: 'bg-green-100 text-green-800' },
      RENTED: { label: 'Đang cho thuê', className: 'bg-blue-100 text-blue-800' },
      IN_MAINTENANCE: { label: 'Bảo trì', className: 'bg-orange-100 text-orange-800' },
      RESERVED: { label: 'Đã đặt trước', className: 'bg-purple-100 text-purple-800' },
      SOLD: { label: 'Đã bán', className: 'bg-gray-100 text-gray-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const containerTypes = Array.from(new Set(containers.map((c) => c.container_type)))

  const stats = {
    total: containers.length,
    available: containers.filter((c) => c.status === 'AVAILABLE').length,
    rented: containers.filter((c) => c.status === 'RENTED').length,
    maintenance: containers.filter((c) => c.status === 'IN_MAINTENANCE').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số Container</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Có sẵn</p>
                <p className="text-2xl font-bold mt-2 text-green-600">{stats.available}</p>
              </div>
              <Container className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang cho thuê</p>
                <p className="text-2xl font-bold mt-2 text-blue-600">{stats.rented}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang bảo trì</p>
                <p className="text-2xl font-bold mt-2 text-orange-600">{stats.maintenance}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kho Container</CardTitle>
              <CardDescription>Quản lý container cho thuê</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo số container hoặc loại..."
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
                <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
                <SelectItem value="RENTED">Đang cho thuê</SelectItem>
                <SelectItem value="IN_MAINTENANCE">Bảo trì</SelectItem>
                <SelectItem value="RESERVED">Đã đặt trước</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {containerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Container Grid/List */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="text-center py-12">
              <Container className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy container</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContainers.map((container) => (
                <Card key={container.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{container.container_number}</h3>
                        <p className="text-sm text-gray-600">
                          {container.container_type} - {container.size}
                        </p>
                      </div>
                      {getStatusBadge(container.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Tình trạng: {container.condition}</span>
                      </div>
                      {container.manufactured_year && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Năm SX: {container.manufactured_year}</span>
                        </div>
                      )}
                      {container.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{container.location}</span>
                        </div>
                      )}
                      {container.rental_rate && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">
                            ${container.rental_rate}/tháng
                          </span>
                        </div>
                      )}
                    </div>

                    {container.current_rental && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-xs font-medium text-blue-900">Đang được thuê</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Người thuê: {container.current_rental.buyer_name}
                        </p>
                        <p className="text-xs text-blue-600">
                          Đến: {new Date(container.current_rental.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {container.maintenance_scheduled && (
                      <div className="bg-orange-50 p-3 rounded-lg mb-4">
                        <p className="text-xs font-medium text-orange-900">Đã lên lịch bảo trì</p>
                        <p className="text-sm text-orange-700 mt-1">
                          {container.maintenance_scheduled.type}
                        </p>
                        <p className="text-xs text-orange-600">
                          Ngày: {new Date(container.maintenance_scheduled.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                      {container.status === 'AVAILABLE' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedContainer(container)
                              setShowMaintenanceDialog(true)
                            }}
                          >
                            <Wrench className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedContainer(container)
                              setPricingForm({ rental_rate: container.rental_rate || '' })
                              setShowPricingDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContainers.map((container) => (
                <Card key={container.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Container className="w-10 h-10 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold">{container.container_number}</h3>
                            {getStatusBadge(container.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {container.container_type} - {container.size} - {container.condition}
                            {container.manufactured_year && ` - ${container.manufactured_year}`}
                          </p>
                          {container.location && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {container.location}
                            </p>
                          )}
                        </div>
                        {container.rental_rate && (
                          <div className="text-right">
                            <p className="font-bold text-lg">${container.rental_rate}</p>
                            <p className="text-sm text-gray-500 mt-1">Per month</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {container.status === 'AVAILABLE' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedContainer(container)
                                setShowMaintenanceDialog(true)
                              }}
                            >
                              <Wrench className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedContainer(container)
                                setPricingForm({ rental_rate: container.rental_rate || '' })
                                setShowPricingDialog(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lên lịch bảo trì</DialogTitle>
            <DialogDescription>
              Lên lịch bảo trì cho {selectedContainer?.container_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Loại bảo trì</Label>
              <Input
                id="type"
                value={maintenanceForm.type}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
                placeholder="vd: Kiểm tra, Sửa chữa, Vệ sinh"
              />
            </div>
            <div>
              <Label htmlFor="scheduled_date">Ngày lên lịch</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={maintenanceForm.scheduled_date}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, scheduled_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="estimated_cost">Chi phí ước tính ($)</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={maintenanceForm.estimated_cost}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, estimated_cost: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={maintenanceForm.description}
                onChange={(e) =>
                  setMaintenanceForm({ ...maintenanceForm, description: e.target.value })
                }
                placeholder="Chi tiết thêm..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleScheduleMaintenance}>Lên lịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Pricing Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật giá cho thuê</DialogTitle>
            <DialogDescription>
              Cập nhật giá thuê theo tháng cho {selectedContainer?.container_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rental_rate">Giá thuê theo tháng ($)</Label>
              <Input
                id="rental_rate"
                type="number"
                value={pricingForm.rental_rate}
                onChange={(e) => setPricingForm({ rental_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPricingDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdatePricing}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
