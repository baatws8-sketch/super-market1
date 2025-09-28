-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    production_date DATE,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    storage_location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التنبيهات
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_storage_location ON products(storage_location);
CREATE INDEX IF NOT EXISTS idx_notifications_product_id ON notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- دالة لتحديث حالة المنتجات تلقائياً
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث حالة المنتج بناءً على تاريخ الانتهاء
    IF NEW.expiry_date < CURRENT_DATE THEN
        NEW.status = 'expired';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN
        NEW.status = 'expiring_soon';
    ELSE
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث حالة المنتج
DROP TRIGGER IF EXISTS update_product_status_trigger ON products;
CREATE TRIGGER update_product_status_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_status();

-- دالة لإنشاء تنبيهات تلقائية
CREATE OR REPLACE FUNCTION create_expiry_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- إنشاء تنبيه للمنتجات المنتهية الصلاحية
    IF NEW.status = 'expired' AND (OLD IS NULL OR OLD.status != 'expired') THEN
        INSERT INTO notifications (id, product_id, product_name, message, type, is_read, created_at)
        VALUES (
            NEW.id || '-expired-' || EXTRACT(EPOCH FROM NOW()),
            NEW.id,
            NEW.name,
            'المنتج ' || NEW.name || ' منتهي الصلاحية',
            'danger',
            FALSE,
            NOW()
        );
    END IF;
    
    -- إنشاء تنبيه للمنتجات القاربة على الانتهاء
    IF NEW.status = 'expiring_soon' AND (OLD IS NULL OR OLD.status != 'expiring_soon') THEN
        INSERT INTO notifications (id, product_id, product_name, message, type, is_read, created_at)
        VALUES (
            NEW.id || '-expiring-' || EXTRACT(EPOCH FROM NOW()),
            NEW.id,
            NEW.name,
            'المنتج ' || NEW.name || ' قارب على انتهاء الصلاحية',
            'warning',
            FALSE,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger للتنبيهات التلقائية
DROP TRIGGER IF EXISTS create_expiry_notifications_trigger ON products;
CREATE TRIGGER create_expiry_notifications_trigger
    AFTER INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION create_expiry_notifications();

-- دالة لتنظيف التنبيهات القديمة (اختيارية)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- حذف التنبيهات المقروءة الأقدم من 30 يوم
    DELETE FROM notifications 
    WHERE is_read = TRUE 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql';

-- إدراج بيانات تجريبية (اختيارية)
INSERT INTO products (id, name, image_url, production_date, expiry_date, quantity, storage_location) VALUES
('demo-1', 'حليب طازج', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', '2024-01-15', '2024-01-25', 10, 'الثلاجة'),
('demo-2', 'خبز أبيض', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', '2024-01-20', '2024-01-27', 5, 'المخزن'),
('demo-3', 'تفاح أحمر', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', '2024-01-10', '2024-02-10', 20, 'الثلاجة')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users" ON products
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON notifications
    FOR ALL USING (true);
-- إنشاء جدول عناوين البريد الإلكتروني للتنبيهات
CREATE TABLE IF NOT EXISTS notification_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تمكين RLS
ALTER TABLE notification_emails ENABLE ROW LEVEL SECURITY;

-- سياسة أمان: السماح لجميع المستخدمين المصادق عليهم
CREATE POLICY "Enable all operations for authenticated users" ON notification_emails
    FOR ALL USING (true);