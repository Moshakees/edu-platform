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

-- 4. إضافة بيانات تجريبية (اختياري)
-- INSERT INTO public.subjects (title, image) VALUES ('الرياضيات', 'https://cdn-icons-png.flaticon.com/512/2997/2997108.png') ON CONFLICT DO NOTHING;
