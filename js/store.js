// Store.js - Supabase Live Integration
(function () {
    const SUPABASE_URL = 'https://leijfflxeyqaioyzkxgi.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWpmZmx4ZXlxYWlveXpreGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTQ5MzQsImV4cCI6MjA4NTM3MDkzNH0.8v_LT9Gh0QmrUjyXB4V9BPazk_yUBIkbHngwlQhLFiI';

    // تأكد من وجود مكتبة Supabase
    if (!window.supabase) {
        console.error("Supabase library not loaded!");
        return;
    }

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const SESSION_KEY = 'edu_platform_session';

    class Store {
        constructor() {
            this.db = { codes: [], subjects: [], teachers: [], units: [], lessons: [] };
        }

        async fetchAllData() {
            try {
                const [codes, subjects, teachers, units, lessons] = await Promise.all([
                    supabase.from('codes').select('*'),
                    supabase.from('subjects').select('*'),
                    supabase.from('teachers').select('*'),
                    supabase.from('units').select('*'),
                    supabase.from('lessons').select('*')
                ]);
                this.db = {
                    codes: codes.data || [],
                    subjects: subjects.data || [],
                    teachers: teachers.data || [],
                    units: units.data || [],
                    lessons: lessons.data || []
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
            if (error || !code) return { success: false, message: 'كود غير صحيح أو مشكلة في الاتصال' };
            if (code.status === 'banned') return { success: false, message: 'تم حظر هذا الكود' };

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
            return { success: false, message: 'الكود غير صالح' };
        }

        checkSession() {
            const s = localStorage.getItem(SESSION_KEY);
            if (!s) return null;
            const session = JSON.parse(s);
            if (Date.now() > session.expiry) { this.logout(); return null; }
            return session;
        }

        logout() { localStorage.removeItem(SESSION_KEY); location.hash = '#login'; location.reload(); }

        // Management Functions
        async generateCode(name, days) {
            const code = '7' + Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
            await supabase.from('codes').insert([{ code, name, duration_days: parseInt(days), status: 'new' }]);
            return code;
        }

        async getCodes() {
            const { data, error } = await supabase.from('codes').select('*').order('created_at', { ascending: false });
            if (error) { console.error("Error fetching codes:", error); return []; }
            return data || [];
        }

        async updateCodeStatus(codeStr, status) {
            await supabase.from('codes').update({ status }).eq('code', codeStr);
        }

        async renewCode(codeStr, days) {
            const { data: code } = await supabase.from('codes').select('*').eq('code', codeStr).single();
            if (!code) return false;
            const now = new Date();
            const currentExpiry = code.expiry_date ? new Date(code.expiry_date) : now;
            const baseDate = currentExpiry > now ? currentExpiry : now;
            const newExpiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));

            await supabase.from('codes').update({
                status: 'active',
                expiry_date: newExpiry.toISOString(),
                duration_days: (code.duration_days || 0) + parseInt(days)
            }).eq('code', codeStr);
            return true;
        }

        // Content
        async addSubject(title, image) {
            const { error } = await supabase.from('subjects').insert([{ title, image }]);
            if (error) console.error("Error adding subject:", error);
        }
        async addTeacher(subjectId, name, image, bio) {
            const { error } = await supabase.from('teachers').insert([{ subject_id: parseInt(subjectId), name, image, bio }]);
            if (error) console.error("Error adding teacher:", error);
        }
        async addUnit(teacherId, title) {
            const { error } = await supabase.from('units').insert([{ teacher_id: parseInt(teacherId), title }]);
            if (error) console.error("Error adding unit:", error);
        }
        async addLesson(unitId, title, type, content) {
            const { error } = await supabase.from('lessons').insert([{ unit_id: parseInt(unitId), title, type, content }]);
            if (error) console.error("Error adding lesson:", error);
        }

        async deleteSubject(id) { await supabase.from('subjects').delete().eq('id', id); }
        async deleteTeacher(id) { await supabase.from('teachers').delete().eq('id', id); }
        async deleteUnit(id) { await supabase.from('units').delete().eq('id', id); }
        async deleteLesson(id) { await supabase.from('lessons').delete().eq('id', id); }

        // Getters
        async getSubjects() {
            const { data, error } = await supabase.from('subjects').select('*').order('id');
            if (error) {
                console.error("Error fetching subjects:", error);
                return { error: true, details: error };
            }
            return data || [];
        }
        async getTeachers(sid) { const { data } = await supabase.from('teachers').select('*').eq('subject_id', sid).order('id'); return data || []; }
        async getTeacherUnits(tid) { const { data } = await supabase.from('units').select('*, lessons(*)').eq('teacher_id', tid).order('id'); return data || []; }
        async getLesson(id) { const { data } = await supabase.from('lessons').select('*').eq('id', id).single(); return data; }
    }

    window.store = new Store();
})();
