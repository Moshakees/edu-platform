// Store.js - Supabase Live Integration (Security Enhanced)
(function () {
    const SUPABASE_URL = 'https://leijfflxeyqaioyzkxgi.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWpmZmx4ZXlxYWlveXpreGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTQ5MzQsImV4cCI6MjA4NTM3MDkzNH0.8v_LT9Gh0QmrUjyXB4V9BPazk_yUBIkbHngwlQhLFiI';

    if (!window.supabase) {
        console.error("Supabase library not loaded!");
        return;
    }

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const SESSION_KEY = 'edu_platform_session';

    class Store {
        constructor() {
            this.db = { codes: [], subjects: [], teachers: [], units: [], lessons: [], slider: [] };
        }

        async fetchAllData() {
            try {
                const [codes, subjects, teachers, units, lessons, slider] = await Promise.all([
                    supabase.from('codes').select('*'),
                    supabase.from('subjects').select('*'),
                    supabase.from('teachers').select('*'),
                    supabase.from('units').select('*'),
                    supabase.from('lessons').select('*'),
                    supabase.from('slider').select('*')
                ]);
                this.db = {
                    codes: codes.data || [],
                    subjects: subjects.data || [],
                    teachers: teachers.data || [],
                    units: units.data || [],
                    lessons: lessons.data || [],
                    slider: slider.data || []
                };
                return this.db;
            } catch (e) {
                console.error("Fetch Error:", e);
                return this.db;
            }
        }

        async login(codeStr) {
            if (codeStr === 'admin123') {
                const session = { role: 'admin', name: 'المسؤول', expiry: Date.now() + 86400000 };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'admin' };
            }

            const { data: code, error } = await supabase.from('codes').select('*').eq('code', codeStr).single();
            if (error || !code) return { success: false, message: 'كود غير صحيح' };

            // 1. التحقق من الحظر
            if (code.status === 'banned') return { success: false, message: 'تم حظر هذا الكود من قبل الإدارة' };
            if (code.status === 'expired') return { success: false, message: 'انتهت صلاحية هذا الكود' };

            // 2. تفعيل كود جديد
            if (code.status === 'new') {
                const now = new Date();
                const expiry = new Date(now.getTime() + (code.duration_days * 24 * 60 * 60 * 1000));
                await supabase.from('codes').update({
                    status: 'active',
                    activation_date: now.toISOString(),
                    expiry_date: expiry.toISOString()
                }).eq('code', codeStr);

                const session = { role: 'student', code: code.code, name: code.name, expiry: expiry.getTime() };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }

            // 3. كود نشط (الاستخدام لمرة واحدة)
            if (code.status === 'active') {
                const expiryTime = new Date(code.expiry_date).getTime();
                if (Date.now() > expiryTime) {
                    await supabase.from('codes').update({ status: 'expired' }).eq('code', codeStr);
                    return { success: false, message: 'انتهت صلاحية الكود' };
                }

                const session = { role: 'student', code: code.code, name: code.name, expiry: expiryTime };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }
            return { success: false, message: 'حالة الكود غير معروفة' };
        }

        // فحص "حي" لحالة المستخدم عند كل حركة في الموقع
        async checkLiveStatus() {
            const session = this.checkSession();
            if (!session || session.role === 'admin') return true;

            const { data: code } = await supabase.from('codes').select('status, expiry_date').eq('code', session.code).single();
            if (!code) return false;

            if (code.status !== 'active') return false;

            const expiryTime = new Date(code.expiry_date).getTime();
            if (Date.now() > expiryTime) {
                await supabase.from('codes').update({ status: 'expired' }).eq('code', session.code);
                return false;
            }

            return true;
        }

        checkSession() {
            const s = localStorage.getItem(SESSION_KEY);
            if (!s) return null;
            const session = JSON.parse(s);
            if (Date.now() > session.expiry) { this.logout(); return null; }
            return session;
        }

        logout() {
            localStorage.removeItem(SESSION_KEY);
            location.hash = '#login';
            // لا نستخدم reload هنا لضمان عدم حدوث Loop، الراوتر سيتكلف بالأمر
        }

        // --- الدوال الأخرى كما هي ---
        async getSliderImages() { const { data } = await supabase.from('slider').select('*').order('created_at'); return data || []; }
        async addSliderImage(url) { await supabase.from('slider').insert([{ image_url: url }]); }
        async deleteSliderImage(id) { await supabase.from('slider').delete().eq('id', id); }
        async generateCode(name, days) {
            const code = '7' + Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
            await supabase.from('codes').insert([{ code, name, duration_days: parseInt(days), status: 'new' }]);
            return code;
        }
        async getCodes() { const { data } = await supabase.from('codes').select('*').order('created_at', { ascending: false }); return data || []; }
        async updateCodeStatus(code, status) { await supabase.from('codes').update({ status }).eq('code', code); }
        async renewCode(codeStr, days) {
            const { data: code } = await supabase.from('codes').select('*').eq('code', codeStr).single();
            if (!code) return false;
            const now = new Date();
            const currentExpiry = code.expiry_date ? new Date(code.expiry_date) : now;
            const baseDate = currentExpiry > now ? currentExpiry : now;
            const newExpiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));
            await supabase.from('codes').update({ status: 'active', expiry_date: newExpiry.toISOString(), duration_days: (code.duration_days || 0) + parseInt(days) }).eq('code', codeStr);
            return true;
        }
        async addSubject(title, image) { await supabase.from('subjects').insert([{ title, image }]); }
        async addTeacher(sid, name, img, bio) { await supabase.from('teachers').insert([{ subject_id: parseInt(sid), name, image: img, bio }]); }
        async addUnit(tid, title) { await supabase.from('units').insert([{ teacher_id: parseInt(tid), title }]); }
        async addLesson(uid, title, type, content) { await supabase.from('lessons').insert([{ unit_id: parseInt(uid), title, type, content }]); }
        async deleteSubject(id) { await supabase.from('subjects').delete().eq('id', id); }
        async deleteTeacher(id) { await supabase.from('teachers').delete().eq('id', id); }
        async deleteUnit(id) { await supabase.from('units').delete().eq('id', id); }
        async deleteLesson(id) { await supabase.from('lessons').delete().eq('id', id); }
        async getSubjects() { const { data } = await supabase.from('subjects').select('*').order('id'); return data || []; }
        async getTeachers(sid) { const { data } = await supabase.from('teachers').select('*').eq('subject_id', sid).order('id'); return data || []; }
        async getTeacherUnits(tid) { const { data } = await supabase.from('units').select('*, lessons(*)').eq('teacher_id', tid).order('id'); return data || []; }
        async getLesson(id) { const { data } = await supabase.from('lessons').select('*').eq('id', id).single(); return data; }
    }

    window.store = new Store();
})();
