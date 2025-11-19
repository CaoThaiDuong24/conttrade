'use client'

import { useEffect, useState } from 'react'
import { 
  Container, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface RentalContract {
  id: number
  container_id: number
  listing_id: number
  quantity?: number // Number of containers in this contract
  container_number?: string
  container_type?: string
  container_size?: string
  start_date: string
  end_date: string
  monthly_rate: string
  payment_status: 'PAID' | 'PENDING' | 'OVERDUE'
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  deposit_amount?: string
  deposit_paid: boolean
  auto_renewal_enabled: boolean
  seller_name?: string
  depot_location?: string
  daysRemaining?: number
}

interface RentalSummary {
  totalActive: number
  totalMonthlyPayment: number
  expiringSoon: number
  overduePayments: number
}

export default function ActiveRentalsPage() {
  const { toast } = useToast()
  const [rentals, setRentals] = useState<RentalContract[]>([])
  const [summary, setSummary] = useState<RentalSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActiveRentals()
  }, [])

  const fetchActiveRentals = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Vui lòng đăng nhập để xem thông tin')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/buyers/my-rentals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu')
      }

      const result = await response.json()
      
      // Backend returns data in { success: true, data: { active, summary } } format
      if (result.success && result.data) {
        setRentals(result.data.active || [])
        setSummary(result.data.summary || {
          totalActive: 0,
          totalMonthlyPayment: 0,
          expiringSoon: 0,
          overduePayments: 0,
        })
      } else {
        throw new Error('Định dạng dữ liệu không hợp lệ')
      }
    } catch (err) {
      console.error('Error fetching rentals:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  const handleExtendRental = async (contractId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để thực hiện thao tác này",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/v1/buyers/my-rentals/${contractId}/request-extension`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ months: 3 }),
      })

      if (!response.ok) {
        throw new Error('Không thể gửi yêu cầu gia hạn')
      }

      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu gia hạn hợp đồng",
      })
      fetchActiveRentals()
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : 'Không thể gửi yêu cầu gia hạn',
        variant: "destructive",
      })
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã thanh toán</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ thanh toán</Badge>
      case 'OVERDUE':
        return <Badge variant="destructive">Quá hạn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return 'text-red-600 font-semibold'
    if (days <= 30) return 'text-yellow-600 font-semibold'
    return 'text-green-600'
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Container đang thuê</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi các container đang thuê
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đang thuê
              </CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalActive}</div>
              <p className="text-xs text-muted-foreground">
                Tổng container đang thuê
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chi phí hàng tháng
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.totalMonthlyPayment.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng chi phí thuê mỗi tháng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sắp hết hạn
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.expiringSoon}</div>
              <p className="text-xs text-muted-foreground">
                Container sắp hết hạn thuê
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quá hạn thanh toán
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.overduePayments}</div>
              <p className="text-xs text-muted-foreground">
                Cần thanh toán ngay
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rentals List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))
        ) : rentals.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Container className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Chưa có container đang thuê</p>
              <p className="text-gray-500 text-sm mt-2">
                Khám phá các container có sẵn để bắt đầu thuê
              </p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Tìm container
              </Button>
            </CardContent>
          </Card>
        ) : (
          rentals.map((rental) => (
            <Card key={rental.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Container className="w-5 h-5" />
                      {rental.container_type} - {rental.container_size}
                      {rental.container_number && ` #${rental.container_number}`}
                      {rental.quantity && rental.quantity > 1 && (
                        <Badge variant="secondary" className="ml-2">
                          {rental.quantity} containers
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {rental.seller_name && `Người bán: ${rental.seller_name}`}
                    </CardDescription>
                  </div>
                  {getPaymentStatusBadge(rental.payment_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Thời gian thuê</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rental.start_date).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                      </p>
                      {rental.daysRemaining !== undefined && (
                        <p className={`text-sm mt-1 ${getDaysRemainingColor(rental.daysRemaining)}`}>
                          Còn {rental.daysRemaining} ngày
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Giá thuê hàng tháng</p>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(rental.monthly_rate).toLocaleString()}/tháng
                      </p>
                      {rental.deposit_amount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Đặt cọc: ${parseFloat(rental.deposit_amount).toLocaleString()}
                          {rental.deposit_paid ? (
                            <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 inline ml-1 text-yellow-600" />
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {rental.depot_location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Vị trí</p>
                        <p className="text-sm text-muted-foreground">{rental.depot_location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Xem hợp đồng
                  </Button>
                  {rental.daysRemaining !== undefined && rental.daysRemaining <= 30 && (
                    <Button 
                      size="sm"
                      onClick={() => handleExtendRental(rental.id)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Yêu cầu gia hạn
                    </Button>
                  )}
                  {rental.auto_renewal_enabled && (
                    <Badge variant="outline" className="ml-auto">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Tự động gia hạn
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
