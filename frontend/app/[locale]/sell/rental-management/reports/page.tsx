'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ReportsPage() {
  const t = useTranslations('rentalManagement.reports')
  const [reportType, setReportType] = useState('utilization')
  const [dateRange, setDateRange] = useState('month')
  const [loading, setLoading] = useState(false)
  const [quickStats, setQuickStats] = useState({
    avgUtilization: 0,
    monthlyRevenue: 0,
    maintenanceCost: 0,
    activeCustomers: 0,
  })

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const dashboardRes = await fetch('/api/v1/sellers/me/rental-dashboard?period=month', { headers })
      
      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        if (data.success) {
          const { occupancy, revenue, contracts } = data.data
          
          setQuickStats({
            avgUtilization: occupancy.occupancyRate || 0,
            monthlyRevenue: revenue.currentPeriod || 0,
            maintenanceCost: 0, // TODO: Get from maintenance API
            activeCustomers: contracts.currentPeriod.active || 0,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching quick stats:', err)
    }
  }

  const reportTemplates = [
    {
      id: 'utilization',
      name: 'Báo cáo sử dụng',
      description: 'Theo dõi tỷ lệ sử dụng và hiệu suất container',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      id: 'revenue',
      name: 'Báo cáo doanh thu',
      description: 'Phân tích doanh thu và xu hướng tài chính',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      id: 'maintenance',
      name: 'Báo cáo bảo trì',
      description: 'Tổng quan chi phí và lịch trình bảo trì',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      id: 'customers',
      name: 'Báo cáo khách hàng',
      description: 'Thông tin chi tiết về khách hàng và hợp đồng',
      icon: Users,
      color: 'text-purple-600',
    },
  ]

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để tạo báo cáo')
        return
      }

      const response = await fetch(`/api/v1/rental/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: reportType,
          period: dateRange
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      alert('Báo cáo đã được tạo thành công!')
      // TODO: Display report data
      
    } catch (err) {
      console.error('Error generating report:', err)
      alert('Không thể tạo báo cáo. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Vui lòng đăng nhập để xuất báo cáo')
        return
      }

      const response = await fetch(`/api/v1/rental/reports/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: reportType,
          period: dateRange,
          format: format.toLowerCase()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rental-report-${reportType}-${dateRange}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Error exporting report:', err)
      alert('Không thể xuất báo cáo. Vui lòng thử lại.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                reportType === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setReportType(template.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <Icon className={`w-8 h-8 ${template.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  {reportType === template.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình báo cáo</CardTitle>
          <CardDescription>Tùy chỉnh tham số báo cáo của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="report_type">Loại báo cáo</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_range">Khoảng thời gian</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="quarter">Quý</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label htmlFor="start_date">Ngày bắt đầu</Label>
                  <Input type="date" id="start_date" />
                </div>
                <div>
                  <Label htmlFor="end_date">Ngày kết thúc</Label>
                  <Input type="date" id="end_date" />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleGenerateReport} className="flex-1" disabled={loading}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {loading ? 'Đang tạo báo cáo...' : 'Tạo báo cáo'}
            </Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Xuất PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('Excel')} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Xem trước báo cáo</CardTitle>
          <CardDescription>Báo cáo sẽ được hiển thị ở đây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Chọn tham số và tạo báo cáo</p>
            <p className="text-sm mt-2">
              Báo cáo sẽ xuất hiện ở đây sau khi được tạo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Tỷ lệ sử dụng TB</p>
              <p className="text-2xl font-bold mt-1">{Number(quickStats.avgUtilization || 0).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Doanh thu tháng</p>
              <p className="text-2xl font-bold mt-1">${Number(quickStats.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-600">Chi phí bảo trì</p>
              <p className="text-2xl font-bold mt-1">${Number(quickStats.maintenanceCost || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
              <p className="text-2xl font-bold mt-1">{Number(quickStats.activeCustomers || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
