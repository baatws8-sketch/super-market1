import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import React from "react";
import { requestNotificationPermission } from "./lib/supabase";
import { testSupabaseConnection } from "./lib/supabase_test";
import { toast } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/toaster";
import Login from "./components/Login";
import Home from "./components/home";

function AppContent() {
  const { user, isLoading, login } = useApp();
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // طلب إذن الإشعارات عند تحميل التطبيق
    requestNotificationPermission();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');
    
    const success = await login(username, password);
    
    if (!success) {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    
    setLoginLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        error={loginError} 
        loading={loginLoading} 
      />
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
  {/* تم حذف استخدام routes غير الموجود */}
      </>
    </Suspense>
  );
}

function App() {
  // اختبار الاتصال بقاعدة البيانات عند تحميل التطبيق
  React.useEffect(() => {
    testSupabaseConnection().then((success) => {
      toast({
        title: success ? "تم الاتصال بقاعدة البيانات بنجاح" : "فشل الاتصال بقاعدة البيانات",
        description: success
          ? "يمكنك الآن إضافة المنتجات وعرضها."
          : "يرجى مراجعة إعدادات Supabase أو الاتصال بالدعم الفني.",
        variant: success ? "default" : "destructive",
      });
    });
  }, []);
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}

export default App;