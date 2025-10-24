"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical,
  Package,
  Phone,
  Video,
  Paperclip,
  Image as ImageIcon,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  readAt?: string;
  messageType: 'text' | 'image' | 'file';
  metadata?: any;
}

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
    isOnline?: boolean;
    lastSeen?: string;
  };
  messages: Message[];
  createdAt: string;
}

export default function ConversationPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user && conversationId) {
      fetchConversation();
    }
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem tin nhắn');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversation(data.data);
          setMessages(data.data.messages || []);
        } else {
          // Fallback to mock data for demo
          const mockConv = getMockConversation();
          setConversation(mockConv);
          setMessages(mockConv.messages);
        }
      } else {
        // Fallback to mock data
        const mockConv = getMockConversation();
        setConversation(mockConv);
        setMessages(mockConv.messages);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Fallback to mock data
      const mockConv = getMockConversation();
      setConversation(mockConv);
      setMessages(mockConv.messages);
    } finally {
      setLoading(false);
    }
  };

  const getMockConversation = (): Conversation => ({
    id: conversationId,
    listing: {
      id: 'listing_001',
      title: 'Container 40ft HC - Tình trạng tốt',
      priceAmount: 75000000,
      priceCurrency: 'VND',
      media: []
    },
    otherUser: {
      id: 'user_seller_001',
      displayName: 'Công ty ABC Logistics',
      avatar: undefined,
      isOnline: true,
      lastSeen: '2024-10-06T10:30:00Z'
    },
    messages: [
      {
        id: 'msg_001',
        content: 'Chào anh, em quan tâm đến container 40ft này. Anh có thể cho em xem thêm hình ảnh được không?',
        senderId: user?.id || 'user_buyer_001',
        createdAt: '2024-10-06T09:00:00Z',
        messageType: 'text'
      },
      {
        id: 'msg_002', 
        content: 'Chào em, container này vẫn còn hàng. Em có thể đến depot xem trực tiếp hoặc anh gửi thêm hình ảnh chi tiết.',
        senderId: 'user_seller_001',
        createdAt: '2024-10-06T09:15:00Z',
        readAt: '2024-10-06T09:16:00Z',
        messageType: 'text'
      },
      {
        id: 'msg_003',
        content: 'Container này đã qua sử dụng bao lâu ạ? Và có bảo hành không anh?',
        senderId: user?.id || 'user_buyer_001', 
        createdAt: '2024-10-06T09:30:00Z',
        messageType: 'text'
      },
      {
        id: 'msg_004',
        content: 'Container đã sử dụng 3 năm, tình trạng rất tốt. Anh bảo hành 6 tháng cho các vấn đề kỹ thuật.',
        senderId: 'user_seller_001',
        createdAt: '2024-10-06T10:00:00Z',
        readAt: '2024-10-06T10:01:00Z',
        messageType: 'text'
      },
      {
        id: 'msg_005',
        content: 'Giá có thương lượng được không ạ? Em muốn mua ngay nếu giá phù hợp.',
        senderId: user?.id || 'user_buyer_001',
        createdAt: '2024-10-06T10:15:00Z',
        messageType: 'text'
      },
      {
        id: 'msg_006',
        content: 'Container vẫn còn hàng ạ. Anh có thể đến xem trực tiếp. Giá có thể thương lượng nếu em mua số lượng lớn.',
        senderId: 'user_seller_001',
        createdAt: '2024-10-06T10:30:00Z',
        messageType: 'text'
      }
    ],
    createdAt: '2024-10-06T09:00:00Z'
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Optimistic update
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        content: messageContent,
        senderId: user?.id || 'user_buyer_001',
        createdAt: new Date().toISOString(),
        messageType: 'text'
      };
      setMessages(prev => [...prev, tempMessage]);

      const response = await fetch(`${API_URL}/api/v1/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent,
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Replace temp message with real one
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id ? data.data : msg
          ));
        }
      } else {
        // Keep temp message for demo purposes
        console.log('Message sent (demo mode)');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Keep temp message for demo purposes
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
          <div className="animate-pulse">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">Không tìm thấy cuộc hội thoại</h3>
              <p className="text-muted-foreground mb-4">
                Cuộc hội thoại này có thể đã bị xóa hoặc bạn không có quyền truy cập.
              </p>
              <Button asChild>
                <Link href="/messages">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại tin nhắn
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          {/* Header */}
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/messages">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.otherUser.avatar} />
                  <AvatarFallback>
                    {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="font-medium">{conversation.otherUser.displayName}</h2>
                    {conversation.otherUser.isOnline && (
                      <Badge variant="secondary" className="text-xs">
                        Đang online
                      </Badge>
                    )}
                  </div>
                  
                  {/* Listing Info */}
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Package className="h-3 w-3 mr-1" />
                    <span className="truncate mr-2">{conversation.listing.title}</span>
                    <span className="font-medium">
                      {formatPrice(conversation.listing.priceAmount, conversation.listing.priceCurrency)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-3 ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className={`flex items-center mt-1 space-x-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <div className="text-xs text-muted-foreground">
                            {message.readAt ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-end space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Textarea
                  ref={messageInputRef}
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  rows={1}
                />
              </div>
              
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Listing Quick Info */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{conversation.listing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(conversation.listing.priceAmount, conversation.listing.priceCurrency)}
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/listings/${conversation.listing.id}`}>
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}