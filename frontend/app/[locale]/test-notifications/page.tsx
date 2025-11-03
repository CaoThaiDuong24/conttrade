'use client';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '@/components/ui/button';

export default function TestNotificationsPage() {
  const createTestNotification = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/v1/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_completed',
          title: 'Đơn hàng hoàn tất',
          message: 'Đơn hàng #4d489d1a đã được giao thành công',
        }),
      });

      if (response.ok) {
        alert('✅ Đã tạo thông báo test thành công!');
      } else {
        alert('❌ Lỗi tạo thông báo: ' + response.statusText);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Test Notification Bell</h1>
          <p className="text-gray-600 mb-6">
            Trang này để test chức năng thông báo
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Notification Bell Component</h2>
              <p className="text-sm text-gray-600">
                Component notification bell sẽ hiển thị ở đây:
              </p>
            </div>
            <div className="flex items-center gap-2 border p-2 rounded-lg">
              <span className="text-sm text-gray-600">→</span>
              <NotificationBell />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Tạo thông báo test</h2>
            <Button onClick={createTestNotification}>
              Tạo thông báo test
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Hướng dẫn test</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click vào icon chuông ở góc trên bên phải</li>
            <li>Kiểm tra xem dropdown có mở ra không</li>
            <li>Kiểm tra xem có scroll được trong danh sách thông báo không</li>
            <li>Click vào một thông báo chưa đọc để đánh dấu là đã đọc</li>
            <li>Click "Làm mới thông báo" để refresh danh sách</li>
            <li>Click "Tạo thông báo test" để tạo thêm thông báo mới</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý</h3>
          <p className="text-sm text-yellow-700">
            Đảm bảo bạn đã đăng nhập và backend server đang chạy tại{' '}
            <code className="bg-yellow-100 px-1 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_URL}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
