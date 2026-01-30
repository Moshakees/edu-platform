// Store.js - Supabase Live Integration (Security & Auto-Fix)
(function () {
    const SUPABASE_URL = 'https://leijfflxeyqaioyzkxgi.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWpmZmx4ZXlxYWlveXpreGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTQ5MzQsImV4cCI6MjA4NTM3MDkzNH0.8v_LT9Gh0QmrUjyXB4V9BPazk_yUBIkbHngwlQhLFiI';

    if (!window.supabase) return;
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const SESSION_KEY = 'edu_platform_session';

    class Store {
        constructor() { this.db = {}; }

        async fetchAllData() {
            const { data: subjects } = await supabase.from('subjects').select('*').order('id');
            const { data: slider } = await supabase.from('slider').select('*').order('created_at');
            const { data: teachers } = await supabase.from('teachers').select('*');
            const { data: units } = await supabase.from('units').select('*');
            const { data: lessons } = await supabase.from('lessons').select('*');
            this.db = { subjects: subjects || [], slider: slider || [], teachers: teachers || [], units: units || [], lessons: lessons || [] };
            return this.db;
        }

        async login(codeStr) {
            localStorage.removeItem(SESSION_KEY); // تنظيف الجلسة القديمة

            if (codeStr === 'admin123') {
                const session = { role: 'admin', name: 'المسؤول', expiry: Date.now() + 86400000 };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'admin' };
            }

            const { data: code, error } = await supabase.from('codes').select('*').eq('code', codeStr).single();
            if (error || !code) return { success: false, message: 'الكود غير موجود' };
            if (code.status === 'banned') return { success: false, message: 'هذا الكود محظور من قبل الإدارة' };

            // --- منطق الذكاء والإصلاح التلقائي ---
            const shouldActivate = (code.status === 'new' || code.status === 'expired' || (code.status === 'active' && !code.expiry_date));

            if (shouldActivate) {
                const now = new Date();
                const days = parseInt(code.duration_days) || 30;
                const expiry = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

                await supabase.from('codes').update({
                    status: 'active',
                    activation_date: now.toISOString(),
                    expiry_date: expiry.toISOString()
                }).eq('code', codeStr);

                const session = { role: 'student', code: code.code, name: code.name, expiry: expiry.getTime() };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }

            // إذا كان الكود نشطاً وموجوداً مع تاريخ صحيح
            if (code.status === 'active') {
                const expiryTime = new Date(code.expiry_date).getTime();
                if (Date.now() > expiryTime) {
                    await supabase.from('codes').update({ status: 'expired' }).eq('code', codeStr);
                    return { success: false, message: 'انتهت صلاحية الكود، يرجى التجديد ككود جديد' };
                }
                const session = { role: 'student', code: code.code, name: code.name, expiry: expiryTime };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }

            return { success: false, message: 'حدث خطأ غير متوقع' };
        }

        async checkLiveStatus() {
            const session = this.checkSession();
            if (!session || session.role === 'admin') return true;

            const { data: code } = await supabase.from('codes').select('status, expiry_date').eq('code', session.code).single();
            if (!code || code.status === 'banned') return false;

            // إذا تم تجديد الكود (وحده الأدمن لـ new)، لا نطرده، سنسمح له بالاستمرار برقم الجلسة القديم أو نطلب منه إعادة الدخول
            if (code.status === 'new') return true;

            if (code.status === 'active' && code.expiry_date) {
                if (Date.now() > new Date(code.expiry_date).getTime()) return false;
            }
            return true;
        }

        checkSession() {
            const s = localStorage.getItem(SESSION_KEY);
            if (!s) return null;
            const session = JSON.parse(s);
            if (Date.now() > session.expiry) return null;
            return session;
        }

        logout() { localStorage.removeItem(SESSION_KEY); location.hash = '#login'; }

        // الدوال الإدارية
        async renewCode(codeStr, days) {
            await supabase.from('codes').update({
                status: 'new',
                duration_days: parseInt(days),
                activation_date: null,
                expiry_date: null
            }).eq('code', codeStr);
            return true;
        }

        async generateCode(name, days) {
            const code = '7' + Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
            await supabase.from('codes').insert([{ code, name, duration_days: parseInt(days), status: 'new' }]);
            return code;
        }
        async getCodes() { const { data } = await supabase.from('codes').select('*').order('created_at', { ascending: false }); return data || []; }
        async updateCodeStatus(c, s) { await supabase.from('codes').update({ status: s }).eq('code', c); }
        async deleteCode(codeStr) { await supabase.from('codes').delete().eq('code', codeStr); }

        async addSubject(t, i) {
            const { error } = await supabase.from('subjects').insert([{ title: t, image: i }]);
            if (error) throw error;
        }
        async addTeacher(sid, n, i, b) {
            const { error } = await supabase.from('teachers').insert([{ subject_id: parseInt(sid), name: n, image: i, bio: b }]);
            if (error) throw error;
        }
        async addUnit(tid, t) {
            const { error } = await supabase.from('units').insert([{ teacher_id: parseInt(tid), title: t }]);
            if (error) throw error;
        }
        async addLesson(uid, t, ty, c) {
            const { error } = await supabase.from('lessons').insert([{ unit_id: parseInt(uid), title: t, type: ty, content: c }]);
            if (error) throw error;
        }

        async deleteSubject(id) { await supabase.from('subjects').delete().eq('id', id); }
        async deleteTeacher(id) { await supabase.from('teachers').delete().eq('id', id); }
        async deleteUnit(id) { await supabase.from('units').delete().eq('id', id); }
        async deleteLesson(id) { await supabase.from('lessons').delete().eq('id', id); }
        async getSubjects() { const { data } = await supabase.from('subjects').select('*').order('id'); return data || []; }
        async getTeachers(sid) { const { data } = await supabase.from('teachers').select('*').eq('subject_id', sid); return data || []; }
        async getTeacherUnits(tid) { const { data } = await supabase.from('units').select('*, lessons(*)').eq('teacher_id', tid); return data || []; }
        async getLesson(id) { const { data } = await supabase.from('lessons').select('*').eq('id', id).single(); return data; }

        async getQuizAttempts(code, lessonId) {
            const { data } = await supabase.from('quiz_attempts').select('*').eq('code', code).eq('lesson_id', lessonId).single();
            return data;
        }

        async recordQuizAttempt(code, lessonId, score) {
            const existing = await this.getQuizAttempts(code, lessonId);
            if (existing) {
                await supabase.from('quiz_attempts').update({
                    attempts_count: existing.attempts_count + 1,
                    last_score: score
                }).eq('id', existing.id);
            } else {
                await supabase.from('quiz_attempts').insert([{ code, lesson_id: lessonId, last_score: score, attempts_count: 1 }]);
            }
        }
        async getSliderImages() { const { data } = await supabase.from('slider').select('*'); return data || []; }
        async addSliderImage(u) { await supabase.from('slider').insert([{ image_url: u }]); }
        async deleteSliderImage(id) { await supabase.from('slider').delete().eq('id', id); }
    }

    window.store = new Store();
})();
