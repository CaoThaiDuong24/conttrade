'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface FinanceData {
  monthlyRevenue: number
  quarterlyRevenue: number
  yearlyRevenue: number
  outstandingPayments: number
  averageRevenuePerContainer: number
  occupancyRate: number
  revenueByMonth: Array<{ month: string; revenue: number }>
  recentPayments: Array<{
    id: number
    contract_id: number
    buyer_name: string
    amount: string
    date: string
    status: string
  }>
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('monthly')

  useEffect(() => {
    fetchFinanceData()
  }, [periodFilter])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch finance data from rental dashboard API
      const dashboardRes = await fetch('/api/v1/sellers/me/rental-dashboard?period=month', { headers })
      
      if (!dashboardRes.ok) {
        throw new Error('Failed to fetch finance data')
      }

      const dashboardData = await dashboardRes.json()
      
      if (!dashboardData.success) {
        throw new Error(dashboardData.message || 'Failed to fetch finance data')
      }

      const { revenue, occupancy } = dashboardData.data

      // Fetch recent payments
      const paymentsRes = await fetch('/api/v1/rental/payments?limit=10', { headers })
      let recentPayments = []
      
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        recentPayments = paymentsData.payments || []
      }

      // Calculate metrics
      const monthlyRevenue = revenue.currentPeriod || 0
      const quarterlyRevenue = revenue.currentPeriod * 3 // Estimate
      const yearlyRevenue = revenue.allTime || 0
      const occupancyRate = occupancy.occupancyRate || 0

      const averageRevenuePerContainer = occupancy.rentedContainers > 0 
        ? monthlyRevenue / occupancy.rentedContainers 
        : 0

      // Fetch revenue trend data
      const trendRes = await fetch('/api/v1/rental/revenue-trend?period=6months', { headers })
      let revenueByMonth = []
      
      if (trendRes.ok) {
        const trendData = await trendRes.json()
        revenueByMonth = trendData.trend || []
      }

      const financeData: FinanceData = {
        monthlyRevenue,
        quarterlyRevenue,
        yearlyRevenue,
        outstandingPayments: 0, // TODO: Get from payments with status PENDING/OVERDUE
        averageRevenuePerContainer,
        occupancyRate,
        revenueByMonth,
        recentPayments,
      }

      setData(financeData)
    } catch (err) {
      console.error('Error fetching finance data:', err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentBadge = (status: string) => {
    return status === 'PAID' ? (
      <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
    ) : status === 'PENDING' ? (
      <Badge className="bg-yellow-100 text-yellow-800">Chờ thanh toán</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                <p className="text-3xl font-bold mt-2">
                  ${data?.monthlyRevenue.toLocaleString() || '0'}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8.2% so với tháng trước</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu quý</p>
                <p className="text-3xl font-bold mt-2">
                  ${data?.quarterlyRevenue.toLocaleString() || '0'}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5% so với quý trước</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu năm</p>
                <p className="text-3xl font-bold mt-2">
                  ${data?.yearlyRevenue.toLocaleString() || '0'}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Dự kiến</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Thanh toán chưa hoàn thành</p>
              <p className="text-2xl font-bold mt-2 text-red-600">
                ${data?.outstandingPayments.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">3 thanh toán chờ xử lý</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Doanh thu TB/Container</p>
              <p className="text-2xl font-bold mt-2">
                ${data?.averageRevenuePerContainer.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mỗi tháng</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ sử dụng</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {data?.occupancyRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">20 trong 23 container được thuê</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Xu hướng doanh thu</CardTitle>
              <CardDescription>Doanh thu theo tháng</CardDescription>
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Tuần</SelectItem>
                <SelectItem value="monthly">Tháng</SelectItem>
                <SelectItem value="quarterly">Quý</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {data?.revenueByMonth.map((item, index) => {
                const maxRevenue = Math.max(...(data?.revenueByMonth.map(r => r.revenue) || [1]))
                const height = (item.revenue / maxRevenue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        ${item.revenue.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{item.month}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thanh toán gần đây</CardTitle>
              <CardDescription>Giao dịch thanh toán mới nhất</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Xuất dữ liệu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Hợp đồng</TableHead>
                    <TableHead>Người thuê</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>#{payment.id}</TableCell>
                      <TableCell>Hợp đồng #{payment.contract_id}</TableCell>
                      <TableCell>{payment.buyer_name}</TableCell>
                      <TableCell className="font-bold">${payment.amount}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getPaymentBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
