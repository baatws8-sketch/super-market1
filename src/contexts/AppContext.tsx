import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { sendExpiryEmail } from '../lib/emailjs';
import { toast } from '../components/ui/use-toast';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  image_url?: string;
  production_date: string;
  expiry_date: string;
  quantity: number;
  storage_location: string;
  status: 'active' | 'expiring_soon' | 'expired';
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  product_id: string;
  product_name: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  is_read: boolean;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  notifications: Notification[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحديد حالة المنتج بناءً على تاريخ الانتهاء
  const getProductStatus = (expiryDate: string): Product['status'] => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'expiring_soon';
    return 'active';
  };

  // تسجيل الدخول
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    if (username === 'admin' && password === 'admin') {
      const userData = {
        id: 'admin-user',
        username: 'admin',
        email: 'admin@example.com'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await refreshData();
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  // تسجيل الخروج
  const logout = () => {
    setUser(null);
    setProducts([]);
    setNotifications([]);
    localStorage.removeItem('user');
  };

  // إضافة منتج جديد
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        status: getProductStatus(productData.expiry_date),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        quantity: productData.quantity ? Number(productData.quantity) : 1,
        storage_location: productData.storage_location && productData.storage_location.trim() !== '' ? productData.storage_location : 'غير محدد',
      };
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) {
        toast({
          title: 'خطأ في حفظ المنتج',
          description: `رسالة Supabase: ${error.message || error.details || 'تعذر حفظ المنتج في قاعدة البيانات'}`,
          variant: 'destructive',
        });
        console.error('Supabase error:', error);
        return;
      }
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'خطأ غير متوقع',
        description: error?.message || 'حدث خطأ أثناء إضافة المنتج',
        variant: 'destructive',
      });
      console.error('Error adding product:', error);
    }
  };

  // تحديث منتج
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      if (updates.expiry_date) {
        updatedProduct.status = getProductStatus(updates.expiry_date);
      }
      const { error } = await supabase.from('products').update(updatedProduct).eq('id', id);
      if (error) {
        toast({
          title: 'خطأ في تحديث المنتج',
          description: error.message || 'تعذر تحديث المنتج في قاعدة البيانات',
          variant: 'destructive',
        });
        return;
      }
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'خطأ غير متوقع',
        description: error?.message || 'حدث خطأ أثناء تحديث المنتج',
        variant: 'destructive',
      });
      console.error('Error updating product:', error);
    }
  };

  // حذف منتج
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast({
          title: 'خطأ في حذف المنتج',
          description: error.message || 'تعذر حذف المنتج من قاعدة البيانات',
          variant: 'destructive',
        });
        return;
      }
      await refreshData();
    } catch (error: any) {
      toast({
        title: 'خطأ غير متوقع',
        description: error?.message || 'حدث خطأ أثناء حذف المنتج',
        variant: 'destructive',
      });
      console.error('Error deleting product:', error);
    }
  };

  // تحديد التنبيه كمقروء
  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
  };

  // تحديث البيانات
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsError) {
        toast({
          title: 'خطأ في تحميل المنتجات',
          description: productsError.message || 'تعذر تحميل المنتجات من قاعدة البيانات',
          variant: 'destructive',
        });
        setProducts([]);
      } else if (productsData) {
        const updatedProducts = productsData.map((product: Product) => ({
          ...product,
          status: getProductStatus(product.expiry_date)
        }));
        setProducts(updatedProducts);
        // إنشاء التنبيهات للمنتجات المنتهية أو القريبة على الانتهاء
        const newNotifications: Notification[] = [];
        updatedProducts.forEach(product => {
          if (product.status === 'expiring_soon' || product.status === 'expired') {
            newNotifications.push({
              id: `${product.id}-${Date.now()}`,
              product_id: product.id,
              product_name: product.name,
              message: product.status === 'expired' 
                ? `المنتج ${product.name} منتهي الصلاحية`
                : `المنتج ${product.name} قارب على انتهاء الصلاحية`,
              type: product.status === 'expired' ? 'danger' : 'warning',
              is_read: false,
              created_at: new Date().toISOString(),
            });
            // إرسال بريد إلكتروني عند التنبيه
            sendExpiryEmail(
              'البريد_الإلكتروني_الذي_تريد_الإرسال_إليه',
              product.status === 'expired' ? 'منتج منتهي الصلاحية' : 'منتج قارب على الانتهاء',
              product.status === 'expired'
                ? `المنتج ${product.name} انتهت صلاحيته.`
                : `المنتج ${product.name} قارب على انتهاء الصلاحية.`
            );
          }
        });
        setNotifications(newNotifications);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ غير متوقع',
        description: error?.message || 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
      setProducts([]);
      setNotifications([]);
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // مزامنة المنتجات فوراً عند أي تغيير في قاعدة البيانات (real-time)
  useEffect(() => {
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // التحقق من المصادقة عند تحميل التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        refreshData();
      } catch (error) {
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // تحديث التنبيهات كل دقيقة
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshData();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AppContextType = {
    user,
    products,
    notifications,
    isLoading,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    markNotificationAsRead,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

