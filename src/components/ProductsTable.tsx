import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/use-toast';
import { Calendar, MapPin, Package, AlertTriangle, CheckCircle, XCircle, Download, Trash2, Edit, Search } from 'lucide-react';

export default function ProductsTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // جلب المنتجات من Supabase عند التحميل
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error(error);
      toast({
        title: "خطأ بجلب المنتجات",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
      return;
    }
    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // فلترة وترتيب المنتجات
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.storage_location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || product.storage_location === locationFilter;
      return matchesSearch && matchesStatus && matchesLocation;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'expiry_date' || sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [products, searchTerm, statusFilter, locationFilter, sortBy, sortOrder]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(products.map(p => p.storage_location).filter(Boolean)));
  }, [products]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expiring_soon': return 'قارب على الانتهاء';
      case 'expired': return 'منتهي الصلاحية';
      default: return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expiring_soon': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({
        title: "خطأ بالحذف",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "تم الحذف",
      description: "تم حذف المنتج بنجاح"
    });
    fetchProducts();
  };

  const exportToCSV = () => {
    const headers = ['اسم المنتج','تاريخ الإنتاج','تاريخ الانتهاء','الكمية','موقع التخزين','الوصف'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedProducts.map(p => [
        p.name, p.production_date, p.expiry_date, p.quantity, p.storage_location, p.description
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم تصدير البيانات",
      description: "تم تصدير قائمة المنتجات بنجاح"
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Package className="h-5 w-5" />
              <span>قائمة المنتجات</span>
            </CardTitle>
            <CardDescription>إجمالي المنتجات ({filteredAndSortedProducts.length})</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2 space-x-reverse">
            <Download className="h-4 w-4" />
            <span>تصدير CSV</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border rounded p-2 w-full text-right"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="expiring_soon">قارب على الانتهاء</SelectItem>
                <SelectItem value="expired">منتهي الصلاحية</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="فلترة حسب الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواقع</SelectItem>
                {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500">
                {products.length === 0 ? 'لم يتم إضافة أي منتجات بعد' : 'لا توجد منتجات مطابقة للبحث'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>موقع التخزين</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map(product => {
                    const daysLeft = getDaysUntilExpiry(product.expiry_date);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <img
                              src={product.image_url || 'https://via.placeholder.com/100'}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">
                                أضيف في {formatDate(product.created_at)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(product.expiry_date)} ({daysLeft} يوم)</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{product.quantity || '-'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{product.storage_location || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(product.status)} flex items-center space-x-1 space-x-reverse w-fit`}>
