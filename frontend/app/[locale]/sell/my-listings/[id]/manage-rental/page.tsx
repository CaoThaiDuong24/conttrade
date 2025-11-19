"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { 
  RentalOverview,
  RentedContainersTab,
  AvailableContainersTab,
  MaintenanceContainersTab
} from '@/components/rental';

interface RentalStats {
  total: number;
  active: number;
  completed: number;
  terminated: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageRentalDuration: number;
  totalDeposit: number;
  depositReturned: number;
}

interface ContainerGroup {
  available: any[];
  rented: any[];
  maintenance: any[];
  reserved: any[];
  sold: any[];
}

export default function ManageRentalPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const listingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [listing, setListing] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [containers, setContainers] = useState<ContainerGroup>({
    available: [],
    rented: [],
    maintenance: [],
    reserved: [],
    sold: []
  });
  const [stats, setStats] = useState<RentalStats | null>(null);

  useEffect(() => {
    if (listingId) {
      fetchData();
    }
  }, [listingId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch listing details
      const listingRes = await fetch(`/api/v1/listings/${listingId}`, {
        credentials: 'include'
      });
      
      if (!listingRes.ok) {
        throw new Error('Failed to fetch listing');
      }
      
      const listingData = await listingRes.json();
      setListing(listingData.data);

      // Fetch rental contracts with summary
      const contractsRes = await fetch(
        `/api/v1/listings/${listingId}/rental-contracts?groupBy=status`,
        { credentials: 'include' }
      );
      
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json();
        setContracts(contractsData.data?.contracts || []);
        setStats(contractsData.data?.summary || null);
      }

      // Fetch containers grouped by status
      const containersRes = await fetch(
        `/api/v1/rental/listings/${listingId}/containers?groupBy=status`,
        { credentials: 'include' }
      );
      
      if (containersRes.ok) {
        const containersData = await containersRes.json();
        setContainers(containersData.data?.containers || {
          available: [],
          rented: [],
          maintenance: [],
          reserved: [],
          sold: []
        });
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message || "Không thể tải thông tin cho thuê",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Đã cập nhật",
      description: "Dữ liệu đã được làm mới"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Không tìm thấy listing</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📦 Quản Lý Container Cho Thuê</h1>
            <p className="text-muted-foreground mt-1">
              {listing.title || `${listing.container_type} - ${listing.container_size}`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng hợp đồng</p>
                <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang cho thuê</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats?.active || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-muted-foreground">VND</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chờ thanh toán</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {(stats?.pendingRevenue || 0).toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-muted-foreground">VND</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="rented">
            <Users className="w-4 h-4 mr-2" />
            Đang thuê ({containers.rented?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="available">
            <Package className="w-4 h-4 mr-2" />
            Có sẵn ({containers.available?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="w-4 h-4 mr-2" />
            Bảo trì ({containers.maintenance?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <RentalOverview 
            listing={listing}
            stats={stats}
            contracts={contracts}
            containers={containers}
          />
        </TabsContent>

        <TabsContent value="rented" className="space-y-4 mt-6">
          <RentedContainersTab
            listingId={listingId}
            containers={containers.rented}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="available" className="space-y-4 mt-6">
          <AvailableContainersTab
            listingId={listingId}
            containers={containers.available}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4 mt-6">
          <MaintenanceContainersTab
            listingId={listingId}
            containers={containers.maintenance}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
