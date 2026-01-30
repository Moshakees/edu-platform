// Store.js - Global Scope
(function () {
    const DB_KEY = 'edu_platform_db';
    const SESSION_KEY = 'edu_platform_session';

    const INITIAL_DATA = {
        codes: [],
        subjects: [
            { id: 1, title: 'الرياضيات', image: 'https://cdn-icons-png.flaticon.com/512/2997/2997108.png' }, // Updated icons
            { id: 2, title: 'الفيزياء', image: 'https://cdn-icons-png.flaticon.com/512/2997/2997155.png' },
            { id: 3, title: 'الكيمياء', image: 'https://cdn-icons-png.flaticon.com/512/2997/2997079.png' }
        ],
        teachers: [],
        units: [],
        lessons: [],
    };

    class Store {
        constructor() {
            this.init();
        }

        init() {
            if (!localStorage.getItem(DB_KEY)) {
                localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
            }
        }

        get db() {
            return JSON.parse(localStorage.getItem(DB_KEY));
        }

        save(data) {
            localStorage.setItem(DB_KEY, JSON.stringify(data));
        }

        login(codeStr) {
            const db = this.db;
            if (codeStr === 'admin123') {
                const session = { role: 'admin', name: 'المسؤول', expiry: Date.now() + 86400000 };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true, role: 'admin' };
            }

            const codeIndex = db.codes.findIndex(c => c.code === codeStr);
            if (codeIndex === -1) return { success: false, message: 'كود غير صحيح' };
            const code = db.codes[codeIndex];

            if (code.status === 'banned') return { success: false, message: 'تم حظر هذا الكود' };

            if (code.status === 'new') {
                const now = new Date();
                const expiry = new Date(now.getTime() + (code.durationDays * 24 * 60 * 60 * 1000));

                code.status = 'active';
                code.activationDate = now.toISOString();
                code.expiryDate = expiry.toISOString();

                db.codes[codeIndex] = code;
                this.save(db);

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
                const expiryTime = new Date(code.expiryDate).getTime();
                if (Date.now() > expiryTime) {
                    code.status = 'expired';
                    this.save(db);
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

            return { success: false, message: 'حالة الكود غير صالح' };
        }

        checkSession() {
            const sessionStr = localStorage.getItem(SESSION_KEY);
            if (!sessionStr) return null;

            const session = JSON.parse(sessionStr);
            if (Date.now() > session.expiry) {
                this.logout();
                return null;
            }

            if (session.role === 'student') {
                const db = this.db;
                const liveCode = db.codes.find(c => c.code === session.code);
                if (!liveCode || liveCode.status === 'banned') {
                    this.logout();
                    return null;
                }
            }
            return session;
        }

        logout() {
            localStorage.removeItem(SESSION_KEY);
            location.hash = '#login';
            location.reload();
        }

        generateCode(name, days) {
            const db = this.db;
            const randomPart = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
            const codeStr = '7' + randomPart;

            const newCode = {
                code: codeStr,
                name: name,
                durationDays: parseInt(days),
                status: 'new',
                createdAt: new Date().toISOString()
            };

            db.codes.push(newCode);
            this.save(db);
            return newCode;
        }

        getCodes() { return this.db.codes; }

        updateCodeStatus(codeStr, status) {
            const db = this.db;
            const index = db.codes.findIndex(c => c.code === codeStr);
            if (index !== -1) {
                db.codes[index].status = status;
                this.save(db);
            }
        }

        renewCode(codeStr, additionalDays) {
            const db = this.db;
            const index = db.codes.findIndex(c => c.code === codeStr);
            if (index !== -1) {
                const code = db.codes[index];

                // إذا كان الكود نشط، نضيف الأيام لتاريخ الانتهاء الحالي
                if (code.status === 'active' && code.expiryDate) {
                    const currentExpiry = new Date(code.expiryDate);
                    const newExpiry = new Date(currentExpiry.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
                    code.expiryDate = newExpiry.toISOString();
                    code.durationDays += parseInt(additionalDays);
                }
                // إذا كان منتهي، نعيد تفعيله بمدة جديدة
                else if (code.status === 'expired') {
                    const now = new Date();
                    const newExpiry = new Date(now.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
                    code.status = 'active';
                    code.expiryDate = newExpiry.toISOString();
                    code.durationDays = parseInt(additionalDays);
                }
                // إذا كان جديد، نضيف الأيام للمدة الأساسية
                else if (code.status === 'new') {
                    code.durationDays += parseInt(additionalDays);
                }

                db.codes[index] = code;
                this.save(db);
                return true;
            }
            return false;
        }

        addSubject(title, image) {
            const db = this.db;
            db.subjects.push({ id: Date.now(), title, image });
            this.save(db);
        }

        addTeacher(subjectId, name, image, bio) {
            const db = this.db;
            db.teachers.push({ id: Date.now(), subjectId: parseInt(subjectId), name, image, bio });
            this.save(db);
        }

        // Delete Methods
        deleteSubject(id) {
            const db = this.db;
            db.subjects = db.subjects.filter(s => s.id != id);
            // Cascading delete
            const teachersToDelete = db.teachers.filter(t => t.subjectId == id).map(t => t.id);
            teachersToDelete.forEach(tid => this.deleteTeacher(tid));
            this.save(db);
        }

        deleteTeacher(id) {
            const db = this.db;
            db.teachers = db.teachers.filter(t => t.id != id);
            const unitsToDelete = db.units.filter(u => u.teacherId == id).map(u => u.id);
            unitsToDelete.forEach(uid => this.deleteUnit(uid));
            this.save(db);
        }

        deleteUnit(id) {
            const db = this.db;
            db.units = db.units.filter(u => u.id != id);
            db.lessons = db.lessons.filter(l => l.unitId != id);
            this.save(db);
        }

        deleteLesson(id) {
            const db = this.db;
            db.lessons = db.lessons.filter(l => l.id != id);
            this.save(db);
        }
    }

    window.store = new Store();
})();
