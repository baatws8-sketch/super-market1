import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from './ui/use-toast';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  XCircle, 
  Info,
  Check,
  Trash2,
  Calendar,
  Package
} from 'lucide-react';

export default function NotificationsList() {
  const { notifications, markNotificationAsRead, products } = useApp();
  // خيار إشعارات البريد نشط دائماً
  const isEmailNotificationEnabled = true;
  const [activeTab, setActiveTab] = useState('all');

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseClasses = isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-l-4';
    
    if (isRead) return baseClasses;
    
    switch (type) {
      case 'danger': return `${baseClasses} border-l-red-500`;
      case 'warning': return `${baseClasses} border-l-yellow-500`;
      case 'info': return `${baseClasses} border-l-blue-500`;
      default: return `${baseClasses} border-l-gray-500`;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'danger': return 'عاجل';
      case 'warning': return 'تحذير';
      case 'info': return 'معلومات';
      default: return 'إشعار';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffHours > 0) {
      return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffMinutes > 0) {
      return `منذ ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
      return 'الآن';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      toast({
        title: "تم تحديث التنبيه",
        description: "تم تحديد التنبيه كمقروء",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التنبيه",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const notification of unreadNotifications) {
        await markNotificationAsRead(notification.id);
      }
      toast({
        title: "تم تحديث جميع التنبيهات",
        description: "تم تحديد جميع التنبيهات كمقروءة",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التنبيهات",
        variant: "destructive",
      });
    }
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const renderNotificationsList = (notificationsList: typeof notifications) => {
    if (notificationsList.length === 0) {
      return (
        <div className="text-center py-12">
          <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات</h3>
          <p className="text-gray-500">
            {activeTab === 'unread' 
              ? 'لا توجد تنبيهات غير مقروءة'
              : activeTab === 'read'
              ? 'لا توجد تنبيهات مقروءة'
              : 'لا توجد تنبيهات حالياً'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notificationsList.map((notification) => {
          const product = getProductDetails(notification.product_id);
          return (
            <Card 
              key={notification.id} 
              className={`${getNotificationColor(notification.type, notification.is_read)} transition-all hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 space-x-reverse flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Badge 
                          variant={notification.type === 'danger' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {getTypeText(notification.type)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="font-medium text-gray-900 mb-2">
                        {notification.message}
                      </p>
                      
                      {product && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <img
                              src={product.image_url || `https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&q=80`}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.name}</p>
                              <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500 mt-1">
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <Calendar className="h-3 w-3" />
                                  <span>ينتهي في {new Date(product.expiry_date).toLocaleDateString('ar-SA')}</span>
                                </div>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <Package className="h-3 w-3" />
                                  <span>{product.storage_location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse mr-4">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center space-x-1 space-x-reverse"
                      >
                        <Check className="h-3 w-3" />
                        <span>تحديد كمقروء</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* خيار إشعارات البريد الإلكتروني */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>إشعارات البريد الإلكتروني</span>
            {isEmailNotificationEnabled && (
              <Badge variant="secondary" className="ml-2">مفعل دائماً</Badge>
            )}
          </CardTitle>
          <CardDescription>
            سيتم إرسال إشعارات البريد الإلكتروني تلقائياً عند إضافة أو انتهاء المنتجات.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Bell className="h-5 w-5" />
                <span>التنبيهات</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="mr-2">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                إدارة ومتابعة جميع التنبيهات والإشعارات
              </CardDescription>
            </div>
            
            {unreadNotifications.length > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Check className="h-4 w-4" />
                <span>تحديد الكل كمقروء</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center space-x-2 space-x-reverse">
                <Bell className="h-4 w-4" />
                <span>جميع التنبيهات</span>
                <Badge variant="outline" className="mr-1">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center space-x-2 space-x-reverse">
                <AlertTriangle className="h-4 w-4" />
                <span>غير مقروءة</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="mr-1">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center space-x-2 space-x-reverse">
                <Check className="h-4 w-4" />
                <span>مقروءة</span>
                <Badge variant="outline" className="mr-1">
                  {readNotifications.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderNotificationsList(notifications)}
            </TabsContent>

            <TabsContent value="unread">
              {renderNotificationsList(unreadNotifications)}
            </TabsContent>

            <TabsContent value="read">
              {renderNotificationsList(readNotifications)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">حول التنبيهات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2 space-x-reverse">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">تنبيهات عاجلة (أحمر)</p>
                <p>للمنتجات منتهية الصلاحية</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 space-x-reverse">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">تنبيهات تحذيرية (أصفر)</p>
                <p>للمنتجات التي تقترب من انتهاء الصلاحية (خلال 7 أيام)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 space-x-reverse">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">تنبيهات معلوماتية (أزرق)</p>
                <p>للمعلومات العامة والتحديثات</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}