import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download, 
  Filter,
  Store,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Activity,
  ArrowUpDown,
  Crown,
  Medal,
  Package
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface Store {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone?: string;
  is_active: boolean;
}

interface ComparisonData {
  store: Store;
  revenue: number;
  transactions: number;
  products: number;
  avg_transaction: number;
  unique_customers: number;
  conversion_rate: number;
  revenue_growth: number;
  transaction_growth: number;
}

interface Benchmarks {
  revenue: {
    highest: number;
    lowest: number;
    average: number;
    median: number;
  };
  transactions: {
    highest: number;
    lowest: number;
    average: number;
    median: number;
  };
  products: {
    highest: number;
    lowest: number;
    average: number;
    median: number;
  };
}

interface TrendData {
  period: string;
  data: {
    store_id: number;
    store_name: string;
    revenue: number;
    transactions: number;
  }[];
}

interface Props {
  stores: Store[];
  comparisonData: ComparisonData[];
  benchmarks: Benchmarks;
  trends: TrendData[];
  filters: {
    stores: number[];
    date_range: string;
    metric: string;
    date_range_label: string;
  };
  dateRanges: Record<string, string>;
  metrics: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reports', href: '/reports' },
  { title: 'Store Comparison', href: '/reports/store-comparison' },
];

export default function StoreComparison({ 
  stores, 
  comparisonData, 
  benchmarks, 
  trends, 
  filters, 
  dateRanges, 
  metrics 
}: Props) {
  const [selectedStores, setSelectedStores] = useState<number[]>(filters.stores || []);
  const [dateRange, setDateRange] = useState(filters.date_range || '30_days');
  const [metric, setMetric] = useState(filters.metric || 'revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return DollarSign;
      case 'transactions': return ShoppingCart;
      case 'products': return Package;
      case 'customers': return Users;
      case 'avg_transaction': return Target;
      case 'conversion_rate': return Activity;
      default: return BarChart3;
    }
  };

  const getMetricValue = (data: ComparisonData, metric: string) => {
    switch (metric) {
      case 'revenue': return data.revenue;
      case 'transactions': return data.transactions;
      case 'products': return data.products;
      case 'customers': return data.unique_customers;
      case 'avg_transaction': return data.avg_transaction;
      case 'conversion_rate': return data.conversion_rate;
      default: return data.revenue;
    }
  };

  const getBenchmarkValue = (metric: string) => {
    switch (metric) {
      case 'revenue': return benchmarks.revenue;
      case 'transactions': return benchmarks.transactions;
      case 'products': return benchmarks.products;
      default: return benchmarks.revenue;
    }
  };

  const GrowthIcon = ({ growth }: { growth: number }) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleStoreToggle = (storeId: number) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter(id => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  const applyFilters = () => {
    router.get('/reports/store-comparison', {
      stores: selectedStores,
      date_range: dateRange,
      metric: metric,
    }, { preserveState: true });
  };

  const clearFilters = () => {
    setSelectedStores([]);
    setDateRange('30_days');
    setMetric('revenue');
    router.get('/reports/store-comparison', {}, { preserveState: true });
  };

  const exportData = () => {
    const params = new URLSearchParams({
      stores: selectedStores.join(','),
      date_range: dateRange,
      metric: metric,
      format: 'csv',
    });
    
    window.open(`/reports/store-comparison/export?${params.toString()}`, '_blank');
  };

  const getRankBadge = (value: number, benchmark: { highest: number; lowest: number }) => {
    if (value === benchmark.highest) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Crown className="w-3 h-3 mr-1" />
          1st
        </Badge>
      );
    }
    if (value === benchmark.lowest) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <Medal className="w-3 h-3 mr-1" />
          Lowest
        </Badge>
      );
    }
    return null;
  };

  const MetricIcon = getMetricIcon(metric);

  return (
    <>
      <Head title="Store Performance Comparison" />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Performance Comparison</h1>
              <p className="text-gray-600">Compare performance metrics across multiple stores</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={exportData} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-white border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Store Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Stores</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {stores.map((store) => (
                      <div key={store.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`store-${store.id}`}
                          checked={selectedStores.includes(store.id)}
                          onCheckedChange={() => handleStoreToggle(store.id)}
                        />
                        <label 
                          htmlFor={`store-${store.id}`} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {store.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dateRanges).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Metric */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary Metric</label>
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(metrics).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply Button */}
                <div className="flex items-end">
                  <Button onClick={applyFilters} className="w-full gap-2">
                    <Filter className="w-4 h-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {comparisonData.length} stores • {filters.date_range_label}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {comparisonData.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <MetricIcon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(benchmarks.revenue.average)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Revenue</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-green-600" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatNumber(benchmarks.transactions.average)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Transactions</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Package className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatNumber(benchmarks.products.average)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Products</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatNumber(benchmarks.transactions.average)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Customers</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Comparison Table */}
              <Card className="bg-white border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Store</th>
                          <th className="text-right p-3 font-semibold">Revenue</th>
                          <th className="text-right p-3 font-semibold">Transactions</th>
                          <th className="text-right p-3 font-semibold">Products</th>
                          <th className="text-right p-3 font-semibold">Avg Transaction</th>
                          <th className="text-right p-3 font-semibold">Customers</th>
                          <th className="text-right p-3 font-semibold">Conversion Rate</th>
                          <th className="text-right p-3 font-semibold">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((data, index) => (
                          <tr key={data.store.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{data.store.name}</span>
                                {getRankBadge(
                                  getMetricValue(data, metric),
                                  getBenchmarkValue(metric)
                                )}
                              </div>
                            </td>
                            <td className="text-right p-3 font-medium">
                              {formatCurrency(data.revenue)}
                            </td>
                            <td className="text-right p-3">
                              {formatNumber(data.transactions)}
                            </td>
                            <td className="text-right p-3">
                              {formatNumber(data.products)}
                            </td>
                            <td className="text-right p-3">
                              {formatCurrency(data.avg_transaction)}
                            </td>
                            <td className="text-right p-3">
                              {formatNumber(data.unique_customers)}
                            </td>
                            <td className="text-right p-3">
                              {data.conversion_rate.toFixed(1)}%
                            </td>
                            <td className="text-right p-3">
                              <div className={`flex items-center justify-end gap-1 ${getGrowthColor(data.revenue_growth)}`}>
                                <GrowthIcon growth={data.revenue_growth} />
                                <span className="font-medium">
                                  {data.revenue_growth >= 0 ? '+' : ''}{data.revenue_growth.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Trends Chart */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Trends ({filters.date_range_label})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trends.map((trend, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900 mb-3">{trend.period}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {trend.data.map((storeData) => (
                            <div 
                              key={storeData.store_id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="font-medium text-gray-900 mb-1">
                                {storeData.store_name}
                              </div>
                              <div className="text-sm text-gray-600">
                                Revenue: {formatCurrency(storeData.revenue)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Transactions: {formatNumber(storeData.transactions)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-6">
                  Select stores and filters to view performance comparison.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
