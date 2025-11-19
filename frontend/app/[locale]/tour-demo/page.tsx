/**
 * Demo Page - Interactive Tour
 * Test page để demo interactive tour system
 */

'use client';

import React, { useState } from 'react';
import { AutoTour } from '@/components/tour/auto-tour';
import { TourButton, TourHelpButton, TourResetButton } from '@/components/tour/tour-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  Eye, 
  Star,
  ShoppingCart,
  Settings,
  Bell,
  User,
  Globe
} from 'lucide-react';

export default function InteractiveTourDemo() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      {/* Auto-start tour (disabled by default - enable bằng cách set enabled={true}) */}
      <AutoTour tourName="listings" delay={1500} enabled={false} />
      
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎯 Interactive Tour Demo
              </h1>
              <p className="text-gray-600">
                Demo page để test hệ thống tour hướng dẫn tương tác
              </p>
            </div>
            
            {/* Tour Controls */}
            <div className="flex gap-2">
              <TourButton 
                tourName="listings" 
                label="Bắt đầu Tour"
                variant="default"
              />
              <TourHelpButton tourName="listings" />
              <TourResetButton tourName="listings" />
            </div>
          </div>
          
          {/* Top Navigation Demo */}
          <div className="flex items-center justify-between bg-white border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Button id="sidebar-navigation" variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <span className="font-semibold">i-ContExchange</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button id="language-toggle" variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                VI
              </Button>
              <Button id="notifications-button" variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
              <Button id="user-profile-button" variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search & Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                id="search-input"
                type="text"
                placeholder="Tìm kiếm container..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button id="create-listing-button" className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Tạo Listing
            </Button>
          </div>
          
          <div id="filter-buttons" className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Tất cả
            </Button>
            <Button variant="outline" size="sm">20ft</Button>
            <Button variant="outline" size="sm">40ft</Button>
            <Button variant="outline" size="sm">Mới</Button>
            <Button variant="outline" size="sm">Đã qua sử dụng</Button>
            <Button variant="outline" size="sm">Giá: Thấp → Cao</Button>
          </div>
        </div>
        
        {/* Dashboard Stats (for dashboard tour) */}
        <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổng Đơn Hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-gray-500">+12% so với tháng trước</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Doanh Thu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-gray-500">+8% so với tháng trước</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Container Đang Quản Lý</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-gray-500">+15 container mới</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Khách Hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-gray-500">+3 khách hàng mới</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listing Card 1 */}
          <Card className="listing-card">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge>Bán</Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="listing-favorite-button"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">
                Container 40ft High Cube - New
              </CardTitle>
              <CardDescription>
                Container mới 100%, chưa qua sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-400">📦 Image</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-lg">$3,500</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kích thước:</span>
                  <span>40ft</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vị trí:</span>
                  <span>Cảng Sài Gòn</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 listing-view-button">
                  <Eye className="mr-2 h-4 w-4" />
                  Xem
                </Button>
                <Button variant="outline" className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Mua
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Listing Card 2 */}
          <Card className="listing-card">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary">Cho thuê</Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="listing-favorite-button"
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
              <CardTitle className="text-lg">
                Container 20ft Standard - Used
              </CardTitle>
              <CardDescription>
                Container đã qua sử dụng, tình trạng tốt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-400">📦 Image</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-lg">$50/ngày</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kích thước:</span>
                  <span>20ft</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vị trí:</span>
                  <span>Hà Nội</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 listing-view-button">
                  <Eye className="mr-2 h-4 w-4" />
                  Xem
                </Button>
                <Button variant="outline" className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thuê
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Listing Card 3 */}
          <Card className="listing-card">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-1">
                  <Badge>Bán</Badge>
                  <Badge variant="secondary">Cho thuê</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="listing-favorite-button"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">
                Container 45ft High Cube - Refurbished
              </CardTitle>
              <CardDescription>
                Container tân trang, như mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-400">📦 Image</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-lg">$4,200</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kích thước:</span>
                  <span>45ft</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vị trí:</span>
                  <span>Đà Nẵng</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 listing-view-button">
                  <Eye className="mr-2 h-4 w-4" />
                  Xem
                </Button>
                <Button variant="outline" className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Mua
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activities (for dashboard tour) */}
        <div id="recent-activities" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt Động Gần Đây</CardTitle>
              <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Đơn hàng mới #1234</p>
                    <p className="text-sm text-gray-500">2 giờ trước</p>
                  </div>
                  <Badge>Mới</Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review mới từ khách hàng</p>
                    <p className="text-sm text-gray-500">5 giờ trước</p>
                  </div>
                  <Badge variant="secondary">5★</Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Cập nhật hệ thống</p>
                    <p className="text-sm text-gray-500">1 ngày trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📖 Hướng dẫn sử dụng Demo
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p><strong>1.</strong> Click nút "Bắt đầu Tour" ở góc trên để xem tour hướng dẫn</p>
            <p><strong>2.</strong> Tour sẽ highlight các phần tử quan trọng và hiện popup giải thích</p>
            <p><strong>3.</strong> Dùng nút "Tiếp theo" / "Quay lại" để di chuyển giữa các bước</p>
            <p><strong>4.</strong> Click "Reset Tour" (dev only) để test lại từ đầu</p>
            <p><strong>5.</strong> Xem code trong <code className="bg-blue-100 px-2 py-0.5 rounded">frontend/lib/tour/driver-config.ts</code></p>
          </div>
        </div>
      </div>
    </>
  );
}
