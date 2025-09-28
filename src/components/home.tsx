import { useState } from 'react';
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import Dashboard from './Dashboard';
import ProductForm from './ProductForm';
import ProductsTable from './ProductsTable';
import NotificationsList from './NotificationsList';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Home, 
  Plus, 
  Package, 
  Bell, 
  LogOut, 
  User,
  Settings,
  Mail
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from './ui/use-toast';
import { sendEmailNotification, sendLocalNotification } from '../lib/supabase';
import { getNotificationEmails, addNotificationEmail, updateNotificationEmail, deleteNotificationEmail } from '../lib/supabase';

export default function HomePage() {
  // تحميل البريد الإلكتروني من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    getNotificationEmails().then(setNotificationEmails);
  }, []);
  const { user, logout, notifications, products } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEmailValue, setEditingEmailValue] = useState('');

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const expiringProducts = products.filter(p => p.status === 'expiring_soon' || p.status === 'expired').length;

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
  };

  const testNotifications = () => {
    if (pushNotifications) {
      sendLocalNotification(
        'تنبيه تجريبي',
        'هذا تنبيه تجريبي من نظام إدارة المنتجات'
      );
    }

    if (emailNotifications && notificationEmails.length > 0) {
      notificationEmails.forEach(email => {
        sendEmailNotification(
          email,
          'تنبيه تجريبي - نظام إدارة المنتجات',
          'هذا تنبيه تجريبي من نظام إدارة المنتجات'
        );
      });
    }

    toast({
      title: "تم إرسال التنبيه التجريبي",
      description: "تحقق من الإشعارات أو البريد الإلكتروني",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* شريط التنقل العلوي */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  نظام إدارة المنتجات سوبر ماركت المهندس
                </h1>
                <p className="text-sm text-gray-500">
                  مرحباً، {user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              {expiringProducts > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse bg-red-50 px-3 py-1 rounded-full">
                  <Bell className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">
                    {expiringProducts} منتج يحتاج انتباه
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 space-x-reverse">
              <Home className="h-4 w-4" />
              <span>لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="add-product" className="flex items-center space-x-2 space-x-reverse">
              <Plus className="h-4 w-4" />
              <span>إضافة منتج</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2 space-x-reverse">
              <Package className="h-4 w-4" />
              <span>المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
              <Bell className="h-4 w-4" />
              <span>التنبيهات</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="mr-1">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 space-x-reverse">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ProductForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsTable />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsList />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">إعدادات التنبيهات</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="push-notifications">إشعارات المتصفح</Label>
                          <p className="text-sm text-gray-500">
                            استقبال إشعارات في المتصفح عند اقتراب انتهاء صلاحية المنتجات
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                          <p className="text-sm text-gray-500">
                            استقبال إشعارات عبر البريد الإلكتروني
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      {emailNotifications && (
                        <div className="space-y-2">
                          <Label htmlFor="notification-email">عناوين البريد الإلكتروني للتنبيهات</Label>
                          <div className="space-y-2">
                            {notificationEmails.map((email, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {editingIndex === idx ? (
                                  <>
                                    <Input
                                      type="email"
                                      value={editingEmailValue}
                                      onChange={e => setEditingEmailValue(e.target.value)}
                                      className="text-right"
                                    />
                                    <Button size="sm" onClick={async () => {
                                      const oldEmail = notificationEmails[idx];
                                      const success = await updateNotificationEmail(oldEmail, editingEmailValue);
                                      if (success) {
                                        const updated = [...notificationEmails];
                                        updated[idx] = editingEmailValue;
                                        setNotificationEmails(updated);
                                        setEditingIndex(null);
                                        toast({ title: 'تم التعديل بنجاح' });
                                      } else {
                                        toast({ title: 'حدث خطأ أثناء التعديل', variant: 'destructive' });
                                      }
                                    }}>حفظ</Button>
                                    <Button variant="outline" size="sm" onClick={() => setEditingIndex(null)}>إلغاء</Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium text-blue-700">{email}</span>
                                    <Button variant="outline" size="sm" onClick={async () => {
                                      const success = await deleteNotificationEmail(email);
                                      if (success) {
                                        setNotificationEmails(notificationEmails.filter((_, i) => i !== idx));
                                        toast({ title: 'تم الحذف بنجاح' });
                                      } else {
                                        toast({ title: 'حدث خطأ أثناء الحذف', variant: 'destructive' });
                                      }
                                    }}>حذف</Button>
                                    <Button variant="secondary" size="sm" onClick={() => {
                                      setEditingIndex(idx);
                                      setEditingEmailValue(email);
                                    }}>تعديل</Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="notification-email"
                              type="email"
                              value={newEmail}
                              onChange={e => setNewEmail(e.target.value)}
                              placeholder="أدخل بريد إلكتروني جديد"
                              className="text-right"
                            />
                            <Button size="sm" onClick={async () => {
                              if (newEmail && !notificationEmails.includes(newEmail)) {
                                try {
                                  const success = await addNotificationEmail(newEmail);
                                  if (success) {
                                    setNotificationEmails([...notificationEmails, newEmail]);
                                    setNewEmail('');
                                    toast({ title: 'تمت الإضافة بنجاح' });
                                  }
                                } catch (error: any) {
                                  toast({ title: error.message || 'حدث خطأ أثناء الإضافة', variant: 'destructive' });
                                }
                              }
                            }}>إضافة</Button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button
                          onClick={testNotifications}
                          className="flex items-center space-x-2 space-x-reverse"
                        >
                          <Mail className="h-4 w-4" />
                          <span>اختبار الإشعارات</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    {/* تم حذف معلومات المستخدم */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}