// Store.js - Supabase Integration
(function () {
    // --- ⚠️ إعدادات Supabase ⚠️ ---
    // استبدل هذه القيم من إعدادات مشروعك في Supabase (Settings > API)
    const SUPABASE_URL = 'https://leijfflxeyqaioyzkxgi.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_gmnQXuI23HeiA0dtIshbyQ_KiOlNZaL';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const SESSION_KEY = 'edu_platform_session';

    class Store {
        constructor() {
            this.db = { codes: [], subjects: [], teachers: [], units: [], lessons: [] };
            this.initialized = false;
        }

        // جلب كل البيانات من قاعدة البيانات ومزامنتها محلياً مؤقتاً للتسريع
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
                this.initialized = true;
                return this.db;
            } catch (error) {
                console.error('Error fetching data:', error);
                return this.db;
            }
        }

        async login(codeStr) {
            if (codeStr === 'admin123') {
                const session = { role: 'admin', name: 'المسؤول', expiry: Date.now() + 86400000 };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'admin' };
            }

            const { data: codeData, error } = await supabase
                .from('codes')
                .select('*')
                .eq('code', codeStr)
                .single();

            if (error || !codeData) return { success: false, message: 'كود غير صحيح' };
            const code = codeData;

            if (code.status === 'banned') return { success: false, message: 'تم حظر هذا الكود' };

            if (code.status === 'new') {
                const now = new Date();
                const expiry = new Date(now.getTime() + (code.duration_days * 24 * 60 * 60 * 1000));

                const { error: updateError } = await supabase
                    .from('codes')
                    .update({
                        status: 'active',
                        activation_date: now.toISOString(),
                        expiry_date: expiry.toISOString()
                    })
                    .eq('code', codeStr);

                if (updateError) return { success: false, message: 'فشل تفعيل الكود' };

                const session = {
                    role: 'student',
                    code: code.code,
                    name: code.name,
                    expiry: expiry.getTime()
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }

            if (code.status === 'active') {
                const expiryTime = new Date(code.expiry_date).getTime();
                if (Date.now() > expiryTime) {
                    await supabase.from('codes').update({ status: 'expired' }).eq('code', codeStr);
                    return { success: false, message: 'انتهت صلاحية الكود' };
                }

                const session = {
                    role: 'student',
                    code: code.code,
                    name: code.name,
                    expiry: expiryTime
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'student' };
            }

            return { success: false, message: 'حالة الكود غير صالحة' };
        }

        checkSession() {
            const sessionStr = localStorage.getItem(SESSION_KEY);
            if (!sessionStr) return null;
            const session = JSON.parse(sessionStr);
            if (Date.now() > session.expiry) {
                this.logout();
                return null;
            }
            return session;
        }

        logout() {
            localStorage.removeItem(SESSION_KEY);
            location.hash = '#login';
            location.reload();
        }

        // --- إدارة الأكواد ---
        async generateCode(name, days) {
            const randomPart = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
            const codeStr = '7' + randomPart;

            const { data, error } = await supabase
                .from('codes')
                .insert([{
                    code: codeStr,
                    name: name,
                    duration_days: parseInt(days),
                    status: 'new'
                }])
                .select()
                .single();

            return data;
        }

        async getCodes() {
            const { data } = await supabase.from('codes').select('*').order('created_at', { ascending: false });
            return data || [];
        }

        async updateCodeStatus(codeStr, status) {
            await supabase.from('codes').update({ status }).eq('code', codeStr);
        }

        async renewCode(codeStr, additionalDays) {
            const { data: code } = await supabase.from('codes').select('*').eq('code', codeStr).single();
            if (!code) return false;

            let updateData = {};
            if (code.status === 'active' && code.expiry_date) {
                const currentExpiry = new Date(code.expiry_date);
                const newExpiry = new Date(currentExpiry.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
                updateData = {
                    expiry_date: newExpiry.toISOString(),
                    duration_days: code.duration_days + parseInt(additionalDays)
                };
            } else {
                const now = new Date();
                const newExpiry = new Date(now.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
                updateData = {
                    status: 'active',
                    expiry_date: newExpiry.toISOString(),
                    duration_days: parseInt(additionalDays)
                };
            }

            const { error } = await supabase.from('codes').update(updateData).eq('code', codeStr);
            return !error;
        }

        // --- إدارة المحتوى ---
        async addSubject(title, image) {
            await supabase.from('subjects').insert([{ title, image }]);
        }

        async addTeacher(subjectId, name, image, bio) {
            await supabase.from('teachers').insert([{ subject_id: parseInt(subjectId), name, image, bio }]);
        }

        async addUnit(teacherId, title) {
            await supabase.from('units').insert([{ teacher_id: parseInt(teacherId), title }]);
        }

        async addLesson(unitId, title, type, content) {
            await supabase.from('lessons').insert([{ unit_id: parseInt(unitId), title, type, content }]);
        }

        // --- دوال الحذف ---
        async deleteSubject(id) { await supabase.from('subjects').delete().eq('id', id); }
        async deleteTeacher(id) { await supabase.from('teachers').delete().eq('id', id); }
        async deleteUnit(id) { await supabase.from('units').delete().eq('id', id); }
        async deleteLesson(id) { await supabase.from('lessons').delete().eq('id', id); }

        async getSubjects() { const { data } = await supabase.from('subjects').select('*'); return data || []; }
        async getTeachers(subjectId) {
            const query = supabase.from('teachers').select('*');
            if (subjectId) query.eq('subject_id', subjectId);
            const { data } = await query;
            return data || [];
        }
        async getTeacherUnits(teacherId) {
            const { data } = await supabase.from('units').select('*, lessons(*)').eq('teacher_id', teacherId);
            return data || [];
        }
        async getLesson(id) {
            const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
            return data;
        }
    }

    window.store = new Store();
})();
