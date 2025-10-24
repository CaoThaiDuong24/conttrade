"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Flag, 
  Receipt, 
  FileText
} from 'lucide-react';

export default function AdminConfigPage() {
  const [activeTab, setActiveTab] = useState('pricing');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cấu hình hệ thống</h1>
        <p className="text-muted-foreground">Quản lý các cài đặt và quy tắc của hệ thống</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pricing">Định giá</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="taxes">Thuế</TabsTrigger>
          <TabsTrigger value="fees">Phí</TabsTrigger>
          <TabsTrigger value="policies">Chính sách</TabsTrigger>
          <TabsTrigger value="templates">Mẫu</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quy tắc định giá
              </CardTitle>
              <CardDescription>
                Quản lý các quy tắc định giá theo khu vực và tiêu chuẩn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Bật/tắt các tính năng của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Thuế suất
              </CardTitle>
              <CardDescription>
                Quản lý thuế suất theo khu vực
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Biểu phí
              </CardTitle>
              <CardDescription>
                Cấu hình các loại phí dịch vụ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chính sách
              </CardTitle>
              <CardDescription>
                Quản lý các chính sách và điều khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mẫu thông báo
              </CardTitle>
              <CardDescription>
                Quản lý các mẫu email, SMS và thông báo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


