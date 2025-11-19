import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  Package,
  DollarSign,
  Truck,
  Shield,
  Star
} from 'lucide-react';

export default function RFQPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yêu cầu Báo giá (RFQ)</h1>
          <p className="text-muted-foreground">
            Quản lý yêu cầu báo giá và báo giá nhận được
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo RFQ mới
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có RFQ nào</h3>
          <p className="text-muted-foreground text-center mb-4">
            Bắt đầu bằng cách tạo yêu cầu báo giá đầu tiên của bạn
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo RFQ mới
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// OLD COMMENTED CODE:
//   const rfqs = [
//     {
//       id: 'RFQ-001',
//       title: 'Cần mua Container 40HC',
//       description: 'Cần mua 5 container 40HC tiêu chuẩn CW, tình trạng tốt',
//       requester: 'Công ty ABC',
//       date: '2024-01-15',
//       deadline: '2024-01-25',
//       status: 'active',
//       quotes: 3,
//       type: 'purchase',
//       quantity: 5,
//       size: '40HC',
//       standard: 'CW',
//       condition: 'Tốt',
//       services: ['inspection', 'delivery']
//     },
//     {
//       id: 'RFQ-002',
//       title: 'Thuê Container 20ft',
//       description: 'Cần thuê 10 container 20ft cho dự án 6 tháng',
//       requester: 'Công ty XYZ',
//       date: '2024-01-14',
//       deadline: '2024-01-24',
//       status: 'quoted',
//       quotes: 5,
//       type: 'rental',
//       quantity: 10,
//       size: '20ft',
//       standard: 'WWT',
//       condition: 'Tốt',
//       services: ['storage', 'delivery']
//     },
//     {
//       id: 'RFQ-003',
//       title: 'Mua Container cần sửa chữa',
//       description: 'Cần mua container 40ft cần sửa chữa, giá tốt',
//       requester: 'Công ty DEF',
//       date: '2024-01-13',
//       deadline: '2024-01-23',
//       status: 'expired',
//       quotes: 2,
//       type: 'purchase',
//       quantity: 3,
//       size: '40ft',
//       standard: 'CW',
//       condition: 'Cần sửa',
//       services: ['repair', 'inspection']
//     }
//   ];

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'active':
//         return <Badge variant="default" className="bg-green-100 text-green-800">Đang hoạt động</Badge>;
//       case 'quoted':
//         return <Badge variant="default" className="bg-blue-100 text-blue-800">Đã báo giá</Badge>;
//       case 'expired':
//         return <Badge variant="destructive">Hết hạn</Badge>;
//       case 'accepted':
//         return <Badge variant="default" className="bg-green-100 text-green-800">Đã chấp nhận</Badge>;
//       case 'declined':
//         return <Badge variant="outline">Từ chối</Badge>;
//       default:
//         return <Badge variant="outline">{status}</Badge>;
//     }
//   };

//   const getTypeBadge = (type: string) => {
//     return type === 'purchase' ? (
//       <Badge variant="outline" className="bg-green-50 text-green-700">Mua</Badge>
//     ) : (
//       <Badge variant="outline" className="bg-blue-50 text-blue-700">Thuê</Badge>
//     );
//   };

//   const getServiceIcon = (service: string) => {
//     switch (service) {
//       case 'inspection':
//         return <Shield className="h-4 w-4" />;
//       case 'delivery':
//         return <Truck className="h-4 w-4" />;
//       case 'storage':
//         return <Package className="h-4 w-4" />;
//       case 'repair':
//         return <Star className="h-4 w-4" />;
//       default:
//         return <Package className="h-4 w-4" />;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Yêu cầu Báo giá (RFQ)</h1>
//           <p className="text-muted-foreground">
//             Quản lý yêu cầu báo giá và báo giá nhận được
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline">
//             <Clock className="mr-2 h-4 w-4" />
//             Lọc theo trạng thái
//           </Button>
//           <Button>
//             <Plus className="mr-2 h-4 w-4" />
//             Tạo RFQ mới
//           </Button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <FileText className="h-8 w-8 text-blue-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold">12</p>
//                 <p className="text-sm text-muted-foreground">RFQ đã gửi</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <CheckCircle className="h-8 w-8 text-green-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold">8</p>
//                 <p className="text-sm text-muted-foreground">Đã báo giá</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <Clock className="h-8 w-8 text-yellow-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold">3</p>
//                 <p className="text-sm text-muted-foreground">Đang chờ</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <XCircle className="h-8 w-8 text-red-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold">1</p>
//                 <p className="text-sm text-muted-foreground">Hết hạn</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* RFQ List */}
//       <div className="grid gap-6">
//         {rfqs.map((rfq) => (
//           <Card key={rfq.id} className="hover:shadow-md transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-2">
//                     <CardTitle className="text-lg">{rfq.title}</CardTitle>
//                     {getTypeBadge(rfq.type)}
//                     {getStatusBadge(rfq.status)}
//                   </div>
//                   <CardDescription className="text-base">
//                     {rfq.description}
//                   </CardDescription>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button variant="ghost" size="sm">
//                     <FileText className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="sm">
//                     <CheckCircle className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {/* Requester */}
//                 <div className="flex items-center gap-2">
//                   <User className="h-4 w-4 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">{rfq.requester}</p>
//                     <p className="text-xs text-muted-foreground">Người yêu cầu</p>
//                   </div>
//                 </div>

//                 {/* Date */}
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-purple-600" />
//                   <div>
//                     <p className="text-sm font-medium">{rfq.date}</p>
//                     <p className="text-xs text-muted-foreground">Ngày tạo</p>
//                   </div>
//                 </div>

//                 {/* Deadline */}
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4 text-orange-600" />
//                   <div>
//                     <p className="text-sm font-medium">{rfq.deadline}</p>
//                     <p className="text-xs text-muted-foreground">Hạn chót</p>
//                   </div>
//                 </div>

//                 {/* Quotes */}
//                 <div className="flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-green-600" />
//                   <div>
//                     <p className="text-sm font-medium">{rfq.quotes} báo giá</p>
//                     <p className="text-xs text-muted-foreground">Đã nhận</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Specifications */}
//               <div className="mt-4 pt-4 border-t">
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <div>
//                     <h4 className="text-sm font-medium mb-2">Thông số kỹ thuật</h4>
//                     <div className="flex items-center gap-4 text-sm">
//                       <div className="flex items-center gap-1">
//                         <Package className="h-4 w-4" />
//                         <span className="font-medium">Số lượng:</span>
//                         <span>{rfq.quantity}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Package className="h-4 w-4" />
//                         <span className="font-medium">Kích thước:</span>
//                         <span>{rfq.size}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Shield className="h-4 w-4" />
//                         <span className="font-medium">Tiêu chuẩn:</span>
//                         <span>{rfq.standard}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Star className="h-4 w-4" />
//                         <span className="font-medium">Tình trạng:</span>
//                         <span>{rfq.condition}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium mb-2">Dịch vụ kèm theo</h4>
//                     <div className="flex items-center gap-2">
//                       {rfq.services.map((service, index) => (
//                         <div key={index} className="flex items-center gap-1 text-sm">
//                           {getServiceIcon(service)}
//                           <span className="capitalize">{service}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="mt-4 flex items-center gap-2">
//                 <Button size="sm">
//                   <FileText className="mr-2 h-4 w-4" />
//                   Xem chi tiết
//                 </Button>
//                 <Button size="sm" variant="outline">
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                   Báo giá
//                 </Button>
//                 <Button size="sm" variant="outline">
//                   <Clock className="mr-2 h-4 w-4" />
//                   Theo dõi
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Empty State */}
//       {rfqs.length === 0 && (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <FileText className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-semibold mb-2">Chưa có RFQ nào</h3>
//             <p className="text-muted-foreground text-center mb-4">
//               Bắt đầu bằng cách tạo yêu cầu báo giá đầu tiên của bạn
//             </p>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Tạo RFQ mới
//             </Button>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }