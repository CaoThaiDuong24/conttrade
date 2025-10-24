"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  User, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  Send,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';

interface QAQuestion {
  id: string;
  authorId: string;
  question: string;
  moderated: boolean;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    orgUsers: Array<{
      org: {
        name: string;
      };
    }>;
  };
  answers: Array<{
    id: string;
    responderId: string;
    answer: string;
    moderated: boolean;
    createdAt: string;
    responder: {
      id: string;
      displayName: string;
      orgUsers: Array<{
        org: {
          name: string;
        };
      }>;
    };
  }>;
}

export default function RFQQAPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswers, setNewAnswers] = useState<Record<string, string>>({});
  const [showModerated, setShowModerated] = useState(false);

  const rfqId = params.id as string;

  useEffect(() => {
    fetchQuestions();
  }, [rfqId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const response = await apiClient.getRFQQuestions(rfqId);
      // setQuestions(response.data);
      
      // Mock data for now
      setQuestions([
        {
          id: 'q1',
          authorId: 'buyer-1',
          question: 'Container có được kiểm tra chất lượng gần đây không?',
          moderated: false,
          createdAt: '2024-01-16T10:00:00Z',
          author: {
            id: 'buyer-1',
            displayName: 'Nguyễn Văn A',
            orgUsers: [{
              org: {
                name: 'Công ty XYZ'
              }
            }]
          },
          answers: [
            {
              id: 'a1',
              responderId: 'seller-1',
              answer: 'Container đã được kiểm tra vào tháng 12/2023 và có chứng chỉ CSC hợp lệ.',
              moderated: false,
              createdAt: '2024-01-16T11:00:00Z',
              responder: {
                id: 'seller-1',
                displayName: 'Công ty ABC',
                orgUsers: [{
                  org: {
                    name: 'Công ty ABC Logistics'
                  }
                }]
              }
            }
          ]
        },
        {
          id: 'q2',
          authorId: 'buyer-1',
          question: 'Có thể cung cấp dịch vụ vận chuyển đến Hà Nội không?',
          moderated: false,
          createdAt: '2024-01-16T14:00:00Z',
          author: {
            id: 'buyer-1',
            displayName: 'Nguyễn Văn A',
            orgUsers: [{
              org: {
                name: 'Công ty XYZ'
              }
            }]
          },
          answers: []
        },
        {
          id: 'q3',
          authorId: 'buyer-1',
          question: 'Có thể liên hệ trực tiếp qua số điện thoại không? 0123456789',
          moderated: true,
          createdAt: '2024-01-16T15:00:00Z',
          author: {
            id: 'buyer-1',
            displayName: 'Nguyễn Văn A',
            orgUsers: [{
              org: {
                name: 'Công ty XYZ'
              }
            }]
          },
          answers: []
        }
      ]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      showError('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      showError('Vui lòng nhập câu hỏi');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement API call
      // await apiClient.createRFQQuestion(rfqId, { question: newQuestion });
      showSuccess('Câu hỏi đã được gửi và đang chờ kiểm duyệt');
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      showError('Không thể gửi câu hỏi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answer = newAnswers[questionId];
    if (!answer?.trim()) {
      showError('Vui lòng nhập câu trả lời');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement API call
      // await apiClient.createRFQAnswer(questionId, { answer });
      showSuccess('Câu trả lời đã được gửi và đang chờ kiểm duyệt');
      setNewAnswers(prev => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting answer:', error);
      showError('Không thể gửi câu trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(q => showModerated || !q.moderated);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hỏi đáp RFQ</h1>
            <p className="text-muted-foreground">ID: {rfqId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModerated(!showModerated)}
          >
            {showModerated ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Hiện câu hỏi đã kiểm duyệt
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Ẩn câu hỏi đã kiểm duyệt
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Ask New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Đặt câu hỏi mới
          </CardTitle>
          <CardDescription>
            Câu hỏi của bạn sẽ được kiểm duyệt trước khi hiển thị công khai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Nhập câu hỏi của bạn..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Thông tin liên hệ cá nhân sẽ được tự động ẩn
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitQuestion}
              disabled={submitting || !newQuestion.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Câu hỏi và trả lời ({filteredQuestions.length})
          </h2>
        </div>

        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className={question.moderated ? 'border-orange-200 bg-orange-50/50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {question.author.orgUsers[0]?.org.name || question.author.displayName}
                      </span>
                      <Clock className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(question.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm">{question.question}</p>
                  </div>
                  {question.moderated && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Đã kiểm duyệt
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Existing Answers */}
                {question.answers.map((answer) => (
                  <div key={answer.id} className="border-l-2 border-blue-200 pl-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {answer.responder.orgUsers[0]?.org.name || answer.responder.displayName}
                      </span>
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(answer.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {answer.moderated && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Đã kiểm duyệt
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{answer.answer}</p>
                  </div>
                ))}

                {/* Answer Form */}
                <div className="space-y-3">
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trả lời câu hỏi:</label>
                    <Textarea
                      placeholder="Nhập câu trả lời..."
                      value={newAnswers[question.id] || ''}
                      onChange={(e) => setNewAnswers(prev => ({ 
                        ...prev, 
                        [question.id]: e.target.value 
                      }))}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitAnswer(question.id)}
                      disabled={submitting || !newAnswers[question.id]?.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Moderation Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Về kiểm duyệt nội dung</h3>
              <p className="text-sm text-blue-800">
                Tất cả câu hỏi và trả lời sẽ được kiểm duyệt trước khi hiển thị công khai. 
                Thông tin liên hệ cá nhân sẽ được tự động ẩn để bảo vệ quyền riêng tư.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
