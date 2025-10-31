"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  Package,
  User,
  MoreVertical,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    priceAmount: number;
    priceCurrency: string;
    media?: string[];
  };
  otherUser: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem tin nhắn');
        return;
      }

      const response = await fetch(`http://localhost:3006/api/v1/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Messages loaded from API:', data.data);
          setConversations(data.data || []);
          return;
        }
      }
      
      // No fallback - show error for real data only
      console.error('❌ Failed to load messages from API:', response.status, response.statusText);
      setError('Không thể tải tin nhắn từ server. Vui lòng thử lại sau.');
      setConversations([]);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      setError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredConversations = conversations.filter(conv =>
    conv.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }
    return `${amount} ${currency}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tin nhắn</h1>
            <p className="text-muted-foreground">
              Quản lý cuộc hội thoại với người mua và người bán
            </p>
          </div>
          <Button variant="outline">
            <MoreVertical className="mr-2 h-4 w-4" />
            Tùy chọn
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm cuộc hội thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <div className="space-y-3">
          {paginatedConversations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Chưa có tin nhắn</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Bắt đầu cuộc hội thoại bằng cách liên hệ với người bán từ trang listing
                </p>
                <Button asChild>
                  <Link href="/listings">
                    <Package className="mr-2 h-4 w-4" />
                    Tìm container
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            paginatedConversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={`/messages/${conversation.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherUser.avatar} />
                        <AvatarFallback>
                          {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">
                            {conversation.otherUser.displayName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Listing Info */}
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Package className="h-3 w-3 mr-1" />
                          <span className="truncate mr-2">{conversation.listing.title}</span>
                          <span className="font-medium">
                            {formatPrice(conversation.listing.priceAmount, conversation.listing.priceCurrency)}
                          </span>
                        </div>

                        {/* Last Message */}
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'
                        }`}>
                          {conversation.lastMessage.senderId === user?.id ? 'Bạn: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredConversations.length > 0 && totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredConversations.length)} trong tổng số {filteredConversations.length} cuộc hội thoại
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {filteredConversations.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 divide-x text-center">
                <div>
                  <div className="text-2xl font-bold">{filteredConversations.length}</div>
                  <div className="text-sm text-muted-foreground">Cuộc hội thoại</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tin chưa đọc</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredConversations.filter(conv => 
                      new Date(conv.lastMessage.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Hoạt động hôm nay</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}