-- 1. تفعيل الامتدادات اللازمة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. إنشاء الجداول الأساسية
-- جدول المواد
CREATE TABLE IF NOT EXISTS public.subjects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المدرسين
CREATE TABLE IF NOT EXISTS public.teachers (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الوحدات
CREATE TABLE IF NOT EXISTS public.units (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES public.teachers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الدروس
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER REFERENCES public.units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأكواد
CREATE TABLE IF NOT EXISTS public.codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    status TEXT DEFAULT 'new',
    activation_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول السلايدر
CREATE TABLE IF NOT EXISTS public.slider (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. تفعيل الأذونات (مهم جداً للوصول العام)
-- هذا يسمح بقراءة وكتابة البيانات بدون نظام حماية معقد حالياً
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.slider DISABLE ROW LEVEL SECURITY;

-- جدول محاولات الاختبارات
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
    attempts_count INTEGER DEFAULT 1,
    last_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, lesson_id)
);
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;

-- جدول الإعدادات (مثلاً رقم الكاش)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- جدول طلبات الاشتراك (الدفع)
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    telegram_username TEXT,
    plan_type TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- تأكد من إنشاء Storage Bucket باسم 'uploads' في لوحة تحكم Supabase لجعل رفع الصور والملفات متاحاً.
-- واحرص على جعل الـ Bucket "Public".

-- بيانات افتراضية للإعدادات
INSERT INTO public.settings (key, value) VALUES ('cash_number', '010XXXXXXXX') ON CONFLICT DO NOTHING;
