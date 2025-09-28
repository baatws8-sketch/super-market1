import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from './ui/use-toast';
import { Calendar, Package, MapPin, Hash } from 'lucide-react';

export default function ProductForm() {
  const { addProduct } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    production_date: '',
    expiry_date: '',
    quantity: '',
    storage_location: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      // جلب رابط الصورة العام
      const { publicUrl, error: urlError } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة المنتج بنجاح",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ برفع الصورة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.expiry_date) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم المنتج وتاريخ الانتهاء",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // إضافة المنتج للـ Supabase
      const { data, error } = await supabase.from('products').insert([
        {
          name: formData.name,
          image_url: formData.image_url,
          production_date: formData.production_date || null,
          expiry_date: formData.expiry_date,
          quantity: formData.quantity || null,
          storage_location: formData.storage_location || null,
          description: formData.description || null
        }
      ]);

      if (error) throw error;

      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${formData.name} بنجاح`,
      });

      setFormData({
        name: '',
        image_url: '',
        production_date: '',
        expiry_date: '',
        quantity: '',
        storage_location: '',
        description: ''
      });

      // إعادة تحميل المنتجات بالمكون الأب
      addProduct(data[0]);
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ في الإضافة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Package className="h-5 w-5" />
            <span>إضافة منتج جديد</span>
          </CardTitle>
          <CardDescription>
            أدخل بيانات المنتج الجديد لإضافته إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">اسم المنتج *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المنتج"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-right">صورة المنتج</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.image_url && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={formData.image_url}
                    alt="معاينة المنتج"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-right flex items-center space-x-1 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ انتهاء الصلاحية *</span>
                </Label>
                <Input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-right flex items-center space-x-1 space-x-reverse">
                  <Hash className="h-4 w-4" />
                  <span>الكمية (اختياري)</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_location" className="text-right flex items-center space-x-1 space-x-reverse">
                  <MapPin className="h-4 w-4" />
                  <span>موقع التخزين (اختياري)</span>
                </Label>
                <Input
                  id="storage_location"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleInputChange}
                  placeholder="مثل: الثلاجة، المخزن، الرف الأول"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">وصف إضافي (اختياري)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="text-right"
              />
            </div>

            <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  name: '',
                  image_url: '',
                  production_date: '',
                  expiry_date: '',
                  quantity: '',
                  storage_location: '',
                  description: ''
                })}
                disabled={isLoading}
              >
                إعادة تعيين
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'جاري الإضافة...' : 'إضافة المنتج'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
