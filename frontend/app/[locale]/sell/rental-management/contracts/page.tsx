'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  FileText,
  Search,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RentalContract {
  id: number
  contract_number: string
  buyer_id: number
  buyer_name: string
  buyer_email: string
  container_id: number
  container_number: string
  container_type: string
  listing_id: number
  start_date: string
  end_date: string
  monthly_rate: string
  deposit_amount: string
  deposit_paid: boolean
  payment_status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIALLY_PAID'
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
  auto_renewal_enabled: boolean
  total_paid: string
  created_at: string
}

export default function ContractsPage() {
  const t = useTranslations('rentalManagement.contracts')
  const [contracts, setContracts] = useState<RentalContract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<RentalContract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [extendMonths, setExtendMonths] = useState('3')

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    filterContracts()
  }, [contracts, searchQuery, statusFilter, paymentFilter])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/rental-contracts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contracts')
      }

      const data = await response.json()
      console.log('Contracts API response:', data)
      
      // Handle different response structures
      const contractsArray = Array.isArray(data) ? data : (data.data || data.contracts || [])
      setContracts(Array.isArray(contractsArray) ? contractsArray : [])
    } catch (err) {
      console.error('Error fetching contracts:', err)
      setContracts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterContracts = () => {
    // Ensure contracts is an array before filtering
    if (!Array.isArray(contracts)) {
      setFilteredContracts([])
      return
    }

    let filtered = [...contracts]

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.contract_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.container_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((c) => c.payment_status === paymentFilter)
    }

    setFilteredContracts(filtered)
  }

  const handleExtendContract = async () => {
    if (!selectedContract) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/rental-contracts/${selectedContract.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'extend',
          extension_months: parseInt(extendMonths),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to extend contract')
      }

      alert('Contract extended successfully')
      setShowExtendDialog(false)
      fetchContracts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to extend contract')
    }
  }

  const handleTerminateContract = async (contractId: number) => {
    if (!confirm('Are you sure you want to terminate this contract?')) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/rental-contracts/${contractId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'terminate',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to terminate contract')
      }

      alert('Contract terminated successfully')
      fetchContracts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to terminate contract')
    }
  }

  const handleCompleteContract = async (contractId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này')
        return
      }

      const response = await fetch(`/api/v1/rental-contracts/${contractId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          action: 'complete',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete contract')
      }

      alert('Contract marked as completed')
      fetchContracts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete contract')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { label: 'Đang hoạt động', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800' },
      OVERDUE: { label: 'Quá hạn', className: 'bg-red-100 text-red-800' },
    }
    const cfg = config[status as keyof typeof config] || config.ACTIVE
    return <Badge className={cfg.className}>{cfg.label}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const config = {
      PAID: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      OVERDUE: { label: 'Quá hạn', className: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: { label: 'Thanh toán 1 phần', className: 'bg-orange-100 text-orange-800' },
    }
    const cfg = config[status as keyof typeof config] || config.PENDING
    return <Badge className={cfg.className}>{cfg.label}</Badge>
  }

  const stats = {
    total: Array.isArray(contracts) ? contracts.length : 0,
    active: Array.isArray(contracts) ? contracts.filter((c) => c.status === 'ACTIVE').length : 0,
    pending: Array.isArray(contracts) ? contracts.filter((c) => c.status === 'PENDING').length : 0,
    completed: Array.isArray(contracts) ? contracts.filter((c) => c.status === 'COMPLETED').length : 0,
    totalRevenue: Array.isArray(contracts) ? contracts.reduce((sum, c) => sum + parseFloat(c.total_paid || '0'), 0) : 0,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Tổng số hợp đồng</p>
              <p className="text-2xl font-bold mt-2">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold mt-2 text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold mt-2 text-emerald-600">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng cho thuê</CardTitle>
          <CardDescription>Quản lý tất cả hợp đồng cho thuê</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo hợp đồng, người thuê hoặc container..."
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
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="OVERDUE">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thanh toán</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                <SelectItem value="OVERDUE">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất dữ liệu
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy hợp đồng</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hợp đồng</TableHead>
                    <TableHead>Người thuê</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead>Giá thuê/tháng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {contract.contract_number || `#${contract.id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(contract.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.buyer_name}</p>
                          <p className="text-xs text-gray-500">{contract.buyer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.container_number}</p>
                          <p className="text-xs text-gray-500">{contract.container_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(contract.start_date).toLocaleDateString()}</p>
                          <p className="text-gray-500">
                            to {new Date(contract.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">${contract.monthly_rate}</p>
                        {contract.deposit_amount && (
                          <p className="text-xs text-gray-500 mt-1">
                            Đặt cọc: ${contract.deposit_amount}
                            {contract.deposit_paid && (
                              <CheckCircle className="inline w-3 h-3 ml-1 text-green-600" />
                            )}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>{getPaymentBadge(contract.payment_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {contract.status === 'ACTIVE' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract)
                                  setShowExtendDialog(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTerminateContract(contract.id)}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {contract.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteContract(contract.id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hợp đồng</DialogTitle>
            <DialogDescription>
              {selectedContract?.contract_number || `Hợp đồng #${selectedContract?.id}`}
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Người thuê</Label>
                  <p className="font-medium">{selectedContract.buyer_name}</p>
                  <p className="text-sm text-gray-500">{selectedContract.buyer_email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Container</Label>
                  <p className="font-medium">{selectedContract.container_number}</p>
                  <p className="text-sm text-gray-500">{selectedContract.container_type}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ngày bắt đầu</Label>
                  <p className="font-medium">
                    {new Date(selectedContract.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Ngày kết thúc</Label>
                  <p className="font-medium">
                    {new Date(selectedContract.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Giá thuê/tháng</Label>
                  <p className="font-medium text-lg">${selectedContract.monthly_rate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Đặt cọc</Label>
                  <p className="font-medium">${selectedContract.deposit_amount}</p>
                  <p className="text-sm">
                    {selectedContract.deposit_paid ? (
                      <span className="text-green-600">✓ Đã thanh toán</span>
                    ) : (
                      <span className="text-yellow-600">Chờ thanh toán</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Trạng thái thanh toán</Label>
                  <div className="mt-1">{getPaymentBadge(selectedContract.payment_status)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Tự động gia hạn</Label>
                  <p className="font-medium">
                    {selectedContract.auto_renewal_enabled ? 'Đã bật' : 'Đã tắt'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Tổng đã thanh toán</Label>
                  <p className="font-medium text-lg text-green-600">
                    ${selectedContract.total_paid || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Đóng
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Tải xuống hợp đồng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Contract Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn hợp đồng</DialogTitle>
            <DialogDescription>
              Gia hạn hợp đồng cho {selectedContract?.container_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ngày kết thúc hiện tại</Label>
              <p className="font-medium">
                {selectedContract && new Date(selectedContract.end_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label htmlFor="extend_months">Gia hạn (tháng)</Label>
              <Select value={extendMonths} onValueChange={setExtendMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 tháng</SelectItem>
                  <SelectItem value="3">3 tháng</SelectItem>
                  <SelectItem value="6">6 tháng</SelectItem>
                  <SelectItem value="12">12 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ngày kết thúc mới</Label>
              <p className="font-medium">
                {selectedContract &&
                  new Date(
                    new Date(selectedContract.end_date).setMonth(
                      new Date(selectedContract.end_date).getMonth() + parseInt(extendMonths)
                    )
                  ).toLocaleDateString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleExtendContract}>Gia hạn hợp đồng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
