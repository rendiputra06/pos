import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Package, 
  TrendingUp, 
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  DollarSign
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface StoreProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  productBank: {
    id: number;
    name: string;
    category?: {
      name: string;
    };
  };
}

interface Transaction {
  id: number;
  total: number;
  created_at: string;
}

interface Store {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone?: string;
  receipt_header?: string;
  receipt_footer?: string;
  is_active: boolean;
  storeProducts: StoreProduct[];
  transactions: Transaction[];
  created_at: string;
}

interface Props {
  store: Store;
  stats: {
    total_products: number;
    total_transactions: number;
    revenue_this_month: number;
    revenue_last_month: number;
  };
  categories: string[];
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  nearbyStores: {
    id: number;
    name: string;
    slug: string;
    address: string;
  }[];
}

export default function StoreDetail({ store, stats, categories, operatingHours, nearbyStores }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const revenueGrowth = stats.revenue_this_month - stats.revenue_last_month;
  const revenueGrowthPercentage = stats.revenue_last_month > 0 
    ? ((revenueGrowth / stats.revenue_last_month) * 100).toFixed(1)
    : 0;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Store Directory', href: '/stores' },
    { title: store.name, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${store.name} - Store Details`} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-8">
            <Link 
              href="/stores" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
              <div className="flex items-center justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{store.address}</span>
                </div>
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Store Stats */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Store Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stats.total_products}
                      </div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stats.total_transactions.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(stats.revenue_this_month)}
                      </div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${
                        revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowthPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Available Products ({stats.total_products})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {store.storeProducts.length > 0 ? (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category}>
                          <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {store.storeProducts
                              .filter(product => product.productBank.category?.name === category)
                              .slice(0, 4)
                              .map((product) => (
                                <div 
                                  key={product.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Stock: {product.stock}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-blue-600">
                                      {formatCurrency(product.price)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {store.storeProducts.filter(product => product.productBank.category?.name === category).length > 4 && (
                            <div className="text-center mt-2">
                              <Button variant="outline" size="sm">
                                View All {category} Products
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No products available at this store.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {store.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {store.transactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              Transaction #{transaction.id}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(transaction.total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent transactions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Operating Hours */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="font-medium capitalize text-gray-900">
                          {day}
                        </span>
                        <span className="text-gray-600">{hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Store Contact */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div className="font-medium text-gray-900">{store.address}</div>
                    </div>
                    {store.phone && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Phone</div>
                        <div className="font-medium text-gray-900">{store.phone}</div>
                      </div>
                    )}
                    <div className="pt-4">
                      <Button className="w-full gap-2" disabled>
                        <ExternalLink className="w-4 h-4" />
                        Visit Store (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Stores */}
              {nearbyStores.length > 0 && (
                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Nearby Stores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {nearbyStores.map((nearbyStore) => (
                        <Link
                          key={nearbyStore.id}
                          href={`/stores/${nearbyStore.slug}`}
                          className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900 mb-1">
                            {nearbyStore.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {nearbyStore.address}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
