import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Package, 
  TrendingUp, 
  Clock, 
  Star, 
  Filter,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface Store {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone?: string;
  is_active: boolean;
  store_products_count: number;
  transactions_count: number;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  stores: {
    data: Store[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  featuredStores: Store[];
  stats: {
    total_stores: number;
    total_products: number;
    total_transactions: number;
  };
  filters: {
    search?: string;
    location?: string;
    sort?: string;
    direction?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Store Directory', href: '/stores' },
];

export default function StoreDirectory({ stores, featuredStores, stats, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [location, setLocation] = useState(filters.location || '');
  const [sortBy, setSortBy] = useState(filters.sort || 'name');
  const [sortDirection, setSortDirection] = useState(filters.direction || 'asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/stores', { 
      ...filters, 
      search: value, 
      page: 1 
    }, { preserveState: true });
  };

  const handleLocation = (value: string) => {
    setLocation(value);
    router.get('/stores', { 
      ...filters, 
      location: value, 
      page: 1 
    }, { preserveState: true });
  };

  const handleSort = (field: string) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    router.get('/stores', { 
      ...filters, 
      sort: field, 
      direction: newDirection 
    }, { preserveState: true });
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setSortBy('name');
    setSortDirection('asc');
    router.get('/stores', {}, { preserveState: true });
  };

  return (
    <>
      <Head title="Store Directory - Find Stores Near You" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Find Stores Near You</h1>
              <p className="text-xl mb-8 opacity-90">
                Discover amazing stores and services in your area
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search stores by name, address, or phone..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 pr-4 h-14 text-lg bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total_stores}</h3>
                <p className="text-gray-600">Active Stores</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total_products.toLocaleString()}</h3>
                <p className="text-gray-600">Products Available</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total_transactions.toLocaleString()}</h3>
                <p className="text-gray-600">Transactions (30 days)</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 pb-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Enter city or area..."
                      value={location}
                      onChange={(e) => handleLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={handleSort}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                        <SelectItem value="transactions">Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="gap-2"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                  
                  {(search || location || sortBy !== 'name') && (
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <Filter className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Stores */}
        {featuredStores.length > 0 && (
          <div className="container mx-auto px-4 pb-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Stores</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStores.map((store) => (
                <Card key={store.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{store.store_products_count} Products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{store.transactions_count} Transactions (30 days)</span>
                      </div>
                    </div>
                    
                    <Link href={`/stores/${store.slug}`}>
                      <Button className="w-full">
                        View Store
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stores List/Grid */}
        <div className="container mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Stores ({stores.total})
          </h2>
          
          {stores.data.length === 0 ? (
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find stores.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.data.map((store) => (
                <Card key={store.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{store.store_products_count} Products</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/stores/${store.slug}`}>
                      <Button className="w-full">
                        View Store
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stores.data.map((store) => (
                <Card key={store.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{store.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{store.store_products_count} Products</span>
                          </div>
                          {store.phone && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{store.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {store.transactions_count} transactions
                        </Badge>
                        <Link href={`/stores/${store.slug}`}>
                          <Button>View Store</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {stores.last_page > 1 && (
          <div className="container mx-auto px-4 pb-12">
            <div className="flex justify-center items-center gap-2">
              {stores.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : link.url
                      ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
