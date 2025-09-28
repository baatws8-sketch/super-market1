import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

export default function Dashboard() {
  const { products, notifications } = useApp();

  // حساب الإحصائيات
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const expiringSoonProducts = products.filter(p => p.status === 'expiring_soon').length;
  const expiredProducts = products.filter(p => p.status === 'expired').length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // حساب النسب المئوية
  const activePercentage = totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0;
  const expiringSoonPercentage = totalProducts > 0 ? (expiringSoonProducts / totalProducts) * 100 : 0;
  const expiredPercentage = totalProducts > 0 ? (expiredProducts / totalProducts) * 100 : 0;

  // المنتجات الأحدث
  const recentProducts = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // المنتجات التي تحتاج انتباه
  const urgentProducts = products
    .filter(p => p.status === 'expired' || p.status === 'expiring_soon')
    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expiring_soon': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  const formatDate = (dateString: string) => {
    // التاريخ الميلادي فقط
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              جميع المنتجات المسجلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activePercentage.toFixed(1)}% من إجمالي المنتجات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قارب على الانتهاء</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoonProducts}</div>
            <p className="text-xs text-muted-foreground">
              {expiringSoonPercentage.toFixed(1)}% من إجمالي المنتجات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتهي الصلاحية</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredProducts}</div>
            <p className="text-xs text-muted-foreground">
              {expiredPercentage.toFixed(1)}% من إجمالي المنتجات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالة المنتجات</CardTitle>
            <CardDescription>نظرة عامة على حالة جميع المنتجات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">المنتجات النشطة</span>
                <span className="text-sm text-muted-foreground">{activeProducts}</span>
              </div>
              <Progress value={activePercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">قارب على الانتهاء</span>
                <span className="text-sm text-muted-foreground">{expiringSoonProducts}</span>
              </div>
              <Progress value={expiringSoonPercentage} className="h-2 bg-yellow-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">منتهي الصلاحية</span>
                <span className="text-sm text-muted-foreground">{expiredProducts}</span>
              </div>
              <Progress value={expiredPercentage} className="h-2 bg-red-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التنبيهات الحالية</CardTitle>
            <CardDescription>
              {unreadNotifications > 0 
                ? `لديك ${unreadNotifications} تنبيه غير مقروء`
                : 'لا توجد تنبيهات جديدة'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>لا توجد تنبيهات حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={notification.type === 'danger' ? 'destructive' : 'secondary'}
                        className="mr-2"
                      >
                        {notification.type === 'danger' ? 'عاجل' : 'تحذير'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {notifications.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    و {notifications.length - 3} تنبيهات أخرى...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* المنتجات الأحدث والمنتجات العاجلة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المنتجات المضافة حديثاً</CardTitle>
            <CardDescription>آخر 5 منتجات تم إضافتها</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p>لا توجد منتجات مضافة بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&q=80'}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover mr-4 border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(product.expiry_date)}</span>
                          <span className="ml-2 text-blue-700 font-bold">{getDaysUntilExpiry(product.expiry_date) >= 0 ? `${getDaysUntilExpiry(product.expiry_date)} يوم متبقي` : `منتهي منذ ${Math.abs(getDaysUntilExpiry(product.expiry_date))} يوم`}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MapPin className="h-3 w-3" />
                          <span>{product.storage_location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Badge variant="outline">{product.quantity}</Badge>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>منتجات تحتاج انتباه</CardTitle>
            <CardDescription>المنتجات المنتهية أو القاربة على الانتهاء</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>جميع المنتجات في حالة جيدة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentProducts.map((product) => {
                  const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&q=80'}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover mr-4 border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(product.expiry_date)}</span>
                            <span className="ml-2 text-blue-700 font-bold">{daysUntilExpiry >= 0 ? `${daysUntilExpiry} يوم متبقي` : `منتهي منذ ${Math.abs(daysUntilExpiry)} يوم`}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="h-3 w-3" />
                            <span>{product.storage_location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge 
                          variant={product.status === 'expired' ? 'destructive' : 'secondary'}
                          className="mb-1"
                        >
                          {getStatusText(product.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {daysUntilExpiry < 0 
                            ? `منتهي منذ ${Math.abs(daysUntilExpiry)} يوم`
                            : `${daysUntilExpiry} يوم متبقي`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}