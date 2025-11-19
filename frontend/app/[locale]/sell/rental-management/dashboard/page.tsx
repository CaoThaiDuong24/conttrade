'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { 
  Container, 
  DollarSign, 
  TrendingUp, 
  Wrench, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  totalContainers: number
  rentedContainers: number
  availableContainers: number
  maintenanceContainers: number
  activeContracts: number
  monthlyRevenue: number
  totalRevenue: number
  upcomingExpirations: number
  overduePayments: number
  maintenancePending: number
}

interface RecentActivity {
  id: number
  type: 'rental' | 'payment' | 'maintenance' | 'expiration'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export default function RentalDashboardPage() {
  const t = useTranslations('rentalManagement.dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get authentication token
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Vui lòng đăng nhập để xem thông tin')
        setLoading(false)
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Use the comprehensive seller rental dashboard API
      const dashboardRes = await fetch('/api/v1/sellers/me/rental-dashboard?period=month', { headers })

      if (!dashboardRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await dashboardRes.json()

      if (!dashboardData.success) {
        throw new Error(dashboardData.message || 'Failed to fetch dashboard data')
      }

      const { occupancy, revenue, contracts } = dashboardData.data

      // Calculate stats from comprehensive dashboard data
      const totalContainers = occupancy.totalContainers || 0
      const rentedContainers = occupancy.rentedContainers || 0
      const availableContainers = occupancy.availableContainers || 0
      const maintenanceContainers = 0 // Not provided by current API

      const activeContracts = contracts.currentPeriod.active || 0
      const monthlyRevenue = revenue.currentPeriod || 0

      setStats({
        totalContainers,
        rentedContainers,
        availableContainers,
        maintenanceContainers,
        activeContracts,
        monthlyRevenue,
        totalRevenue: revenue.allTime || 0,
        upcomingExpirations: 0,
        overduePayments: contracts.currentPeriod.overdue || 0,
        maintenancePending: 0,
      })

      // Fetch recent activities from API
      try {
        const activitiesRes = await fetch('/api/v1/rental/activities?limit=10', { headers })
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json()
          setActivities(activitiesData.activities || [])
        } else {
          setActivities([])
        }
      } catch (err) {
        console.error('Error fetching activities:', err)
        setActivities([])
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats
    ? [
        {
          title: 'Tổng số Container',
          value: stats.totalContainers.toString(),
          icon: Container,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          title: 'Đang cho thuê',
          value: stats.rentedContainers.toString(),
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          subtitle: `${stats.totalContainers > 0 ? ((stats.rentedContainers / stats.totalContainers) * 100).toFixed(1) : 0}% công suất`,
        },
        {
          title: 'Có sẵn',
          value: stats.availableContainers.toString(),
          icon: Container,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        },
        {
          title: 'Đang bảo trì',
          value: stats.maintenanceContainers.toString(),
          icon: Wrench,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
        {
          title: 'Hợp đồng hoạt động',
          value: stats.activeContracts.toString(),
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          title: 'Doanh thu tháng',
          value: `$${stats.monthlyRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          subtitle: `$${stats.totalRevenue.toLocaleString()} dự kiến năm`,
        },
      ]
    : []

  const alertItems = stats
    ? [
        {
          icon: Clock,
          title: 'Hợp đồng sắp hết hạn',
          count: stats.upcomingExpirations,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        },
        {
          icon: AlertCircle,
          title: 'Thanh toán quá hạn',
          count: stats.overduePayments,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
        {
          icon: Wrench,
          title: 'Bảo trì chờ xử lý',
          count: stats.maintenancePending,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
      ]
    : []

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                        {stat.subtitle && (
                          <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Alerts Section */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo & Thông báo</CardTitle>
            <CardDescription>
              Những vấn đề cần chú ý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alertItems.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg ${alert.bgColor}`}
                  >
                    <Icon className={`w-5 h-5 ${alert.color}`} />
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-2xl font-bold mt-1">{alert.count}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Cập nhật và sự kiện mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  Chưa có hoạt động gần đây
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Badge
                      variant={
                        activity.status === 'success'
                          ? 'default'
                          : activity.status === 'warning'
                          ? 'secondary'
                          : activity.status === 'error'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="mt-0.5"
                    >
                      {activity.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
