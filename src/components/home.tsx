import { useState, useEffect } from 'react';
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

  useEffect(() => {
    getNotificationEmails().then(setNotificationEmails);
  }, []);

  const handleLogout = () => {
    logout();
    toast({ title: "تم تسجيل الخروج", description: "تم تسجيل خروجك بنجاح" });
  };

  const testNotifications = () => {
    if (pushNotifications) {
      sendLocalNotification('تنبيه تجريبي', 'هذا تنبيه تجريبي من نظام إدارة المنتجات');
    }

    if (emailNotifications && notificationEmails.length > 0) {
      notificationEmails.forEach(email => {
        sendEmailNotification(email, 'تنبيه تجريبي - نظام إدارة المنتجات', 'هذا تنبيه تجريبي من نظام إدارة المنتجات');
      });
    }

    toast({ title: "تم إرسال التنبيه التجريبي", description: "تحقق من الإشعارات أو البريد الإلكتروني" });
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  نظام إدارة المنتجات سوبر ماركت المهندس
                </h1>
                <p className="text-sm text-gray-500">مرحباً، {user?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              {expiringProducts > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse bg-red-50 px-3 py-1 rounded-full">
                  <Bell className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">{expiringProducts} منتج يحتاج انتباه</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2 space-x-reverse">
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-3 md:grid-cols-5 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="add-product" className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة منتج</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">التنبيهات</span>
              {unreadNotifications > 0 && <Badge variant="destructive">{unreadNotifications}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><Dashboard /></TabsContent>
          <TabsContent value="add-product"><ProductForm /></TabsContent>
          <TabsContent value="products"><ProductsTable /></TabsContent>
          <TabsContent value="notifications"><NotificationsList /></TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">إعدادات التنبيهات</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">إشعارات المتصفح</Label>
                        <p className="text-sm text-gray-500">استقبال إشعارات في المتصفح عند اقتراب انتهاء صلاحية المنتجات</p>
                      </div>
                      <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                        <p className="text-sm text-gray-500">استقبال إشعارات عبر البريد الإلكتروني</p>
                      </div>
                      <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>

                    {emailNotifications && (
                      <div className="space-y-2">
                        <Label htmlFor="notification-email">عناوين البريد الإلكتروني للتنبيهات</Label>
                        <div className="space-y-2">
                          {notificationEmails.map((email, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              {editingIndex === idx ? (
                                <>
                                  <Input
                                    type="email"
                                    value={editingEmailValue}
                                    onChange={e => setEditingEmailValue(e.target.value)}
                                    className="text-right"
                                  />
                                  <div className="flex gap-2">
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
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="font-medium text-blue-700">{email}</span>
                                  <div className="flex gap-2 flex-wrap">
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
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
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
                      <Button onClick={testNotifications} className="flex items-center space-x-2 space-x-reverse">
                        <Mail className="h-4 w-4" />
                        <span>اختبار الإشعارات</span>
                      </Button>
                    </div>
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
