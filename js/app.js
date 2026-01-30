// App Controller
async function router() {
    const app = document.getElementById('app');
    const hash = window.location.hash || '#home';
    const parts = hash.split('/');
    const route = parts[0].substring(1);
    const id = parts[1];

    // Auth Gating
    const session = window.store.checkSession();
    if (!session && route !== 'login') {
        window.location.hash = '#login';
        return;
    }

    app.innerHTML = '<div class="container" style="text-align:center; padding-top:100px;"><div class="glass-panel">جاري فحص الاتصال بقاعدة البيانات...</div></div>';

    // التحقق من صحة الجداول في Supabase
    try {
        const test = await window.store.getSubjects();
        if (test === null || (Array.isArray(test) && test.error)) {
            throw new Error("Missing Tables");
        }
    } catch (e) {
        app.innerHTML = `
            <div class="container" style="text-align:center; padding-top:100px;">
                <div class="glass-panel" style="border-right: 5px solid #ef4444; padding: 40px;">
                    <h2 style="color: #ef4444;">⚠️ خطأ في قاعدة البيانات</h2>
                    <p style="margin: 20px 0;">يبدو أن الجداول غير موجودة في مشروع Supabase الخاص بك.</p>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
                        <p><strong>لحل المشكلة:</strong></p>
                        <ol style="margin-right: 20px; line-height: 1.8;">
                            <li>افتح ملف <strong>SETUP_SUPABASE.sql</strong> وانسخ محتواه.</li>
                            <li>اذهب إلى <strong>SQL Editor</strong> في Supabase.</li>
                            <li>الصق الكود واضغط <strong>Run</strong>.</li>
                        </ol>
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">أعد المحاولة بعد تنفيذ الكود</button>
                    <p style="margin-top:20px; font-size: 0.8rem; color: var(--text-muted);">رابط المشروع: https://leijfflxeyqaioyzkxgi.supabase.co</p>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = '<div class="container" style="text-align:center; padding-top:100px;"><div class="glass-panel">جاري تحميل البيانات...</div></div>';

    let view;
    switch (route) {
        case 'login':
            view = window.LoginView();
            break;
        case 'home':
            view = await window.HomeView();
            break;
        case 'subject':
            view = await window.SubjectView(id);
            break;
        case 'teacher':
            view = await window.TeacherView(id);
            break;
        case 'lesson':
            view = await window.LessonView(id);
            break;
        case 'admin':
            view = await window.AdminView();
            break;
        default:
            window.location.hash = '#home';
            return;
    }

    app.innerHTML = '';
    app.appendChild(view);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
