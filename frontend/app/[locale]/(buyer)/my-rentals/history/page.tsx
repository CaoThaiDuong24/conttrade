'use client'

import { useEffect, useState } from 'react'
import {
  History,
  Calendar,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Clock,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useToast } from '@/hooks/use-toast'

interface CompletedRental {
  id: number
  contract_id: number
  container_number: string
  container_type: string
  container_size: string
  seller_name: string
  start_date: string
  end_date: string
  duration_days: number
  monthly_rate: string
  total_cost: string
  rating?: number
  review?: string
}

interface RentalAnalytics {
  totalRentals: number
  totalSpent: number
  averageDuration: number
  averageMonthlyCost: number
  mostRentedType: string
  totalDays: number
}

export default function RentalHistoryPage() {
  const { toast } = useToast()
  const [rentals, setRentals] = useState<CompletedRental[]>([])
  const [analytics, setAnalytics] = useState<RentalAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRental, setSelectedRental] = useState<CompletedRental | null>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  useEffect(() => {
    fetchRentalHistory()
  }, [])

  const fetchRentalHistory = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem thông tin",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/buyers/rental-history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu lịch sử')
      }

      const data = await response.json()
      setRentals(data.rentals || [])
      setAnalytics(data.analytics || null)
    } catch (err) {
      console.error('Error fetching rental history:', err)
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : 'Không thể tải dữ liệu',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!selectedRental) return

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

      const response = await fetch(`/api/v1/buyers/my-rentals/${selectedRental.contract_id}/rate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          rating,
          review,
        }),
      })

      if (!response.ok) {
        throw new Error('Không thể gửi đánh giá')
      }

      toast({
        title: "Thành công",
        description: "Đã gửi đánh giá của bạn",
      })
      setShowRatingDialog(false)
      setRating(5)
      setReview('')
      fetchRentalHistory()
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : 'Không thể gửi đánh giá',
        variant: "destructive",
      })
    }
  }

  const renderStars = (currentRating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lịch sử thuê</h1>
        <p className="text-muted-foreground mt-2">
          Xem lại các hợp đồng thuê đã hoàn thành
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Tổng số lần thuê</p>
                <p className="text-2xl font-bold mt-1">{analytics.totalRentals}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold mt-1">${analytics.totalSpent.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Thời gian TB</p>
                <p className="text-2xl font-bold mt-1">{analytics.averageDuration} ngày</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-gray-600">TB hàng tháng</p>
                <p className="text-2xl font-bold mt-1">
                  ${analytics.averageMonthlyCost.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <p className="text-sm text-gray-600">Loại thuê nhiều</p>
                <p className="text-lg font-bold mt-1">{analytics.mostRentedType}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="text-sm text-gray-600">Tổng số ngày</p>
                <p className="text-2xl font-bold mt-1">{analytics.totalDays}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rental History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hợp đồng đã hoàn thành</CardTitle>
              <CardDescription>Lịch sử thuê và hợp đồng đã kết thúc</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Xuất dữ liệu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : rentals.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Chưa có lịch sử thuê</p>
              <p className="text-gray-500 text-sm mt-2">
                Các hợp đồng thuê đã hoàn thành sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => (
                <Card key={rental.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            {rental.container_type} - {rental.container_size}
                          </h3>
                          <Badge className="bg-gray-100 text-gray-800">Đã hoàn thành</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Container #{rental.container_number}
                        </p>
                        <p className="text-sm text-gray-600">Người bán: {rental.seller_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${rental.total_cost}
                        </p>
                        <p className="text-xs text-gray-500">Tổng chi phí</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Thời gian thuê</p>
                          <p className="text-sm text-gray-600">
                            {new Date(rental.start_date).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rental.duration_days} ngày
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Giá thuê hàng tháng</p>
                          <p className="text-sm text-gray-600">
                            ${parseFloat(rental.monthly_rate).toLocaleString()}/tháng
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Đánh giá của bạn</p>
                          {rental.rating ? (
                            <div className="mt-1">
                              {renderStars(rental.rating)}
                              {rental.review && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  "{rental.review}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Chưa đánh giá</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Xem hợp đồng
                      </Button>
                      <Button variant="outline" size="sm">
                        Thuê lại
                      </Button>
                      {!rental.rating && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRental(rental)
                            setShowRatingDialog(true)
                          }}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá trải nghiệm thuê</DialogTitle>
            <DialogDescription>
              Chia sẻ nhận xét của bạn về lần thuê container này
            </DialogDescription>
          </DialogHeader>
          {selectedRental && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Container</p>
                <p className="text-sm text-gray-600">
                  {selectedRental.container_type} - {selectedRental.container_size} #
                  {selectedRental.container_number}
                </p>
              </div>

              <div>
                <Label>Đánh giá</Label>
                <div className="mt-2">{renderStars(rating, true, setRating)}</div>
              </div>

              <div>
                <Label htmlFor="review">Nhận xét (Tùy chọn)</Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitRating}>
              <Star className="w-4 h-4 mr-2" />
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
