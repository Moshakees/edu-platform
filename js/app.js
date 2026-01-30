// App Controller
async function router() {
    const app = document.getElementById('app');
    const hash = window.location.hash || '#home';
    const parts = hash.split('/');
    const route = parts[0].substring(1);
    const id = parts[1];

    // 1. فحص الجلسة المحلية
    const session = window.store.checkSession();

    // إذا لم يكن هناك جلسة وهو ليس في صفحة الدخول، وجهه للدخول
    if (!session && route !== 'login') {
        window.location.hash = '#login';
        return;
    }

    // 2. إذا كان طالباً، افحص حالته "لايف" من قاعدة البيانات
    if (session && session.role === 'student' && route !== 'login') {
        const isLive = await window.store.checkLiveStatus();
        if (!isLive) {
            window.Utils.showNotification('عذراً، الكود الخاص بك محظور أو منتهي الصلاحية!', 'error');
            window.store.logout();
            window.location.hash = '#login';
            return;
        }
    }

    // 3. عرض شاشة التحميل
    app.innerHTML = '<div class="container" style="text-align:center; padding-top:100px;"><div class="glass-panel">جاري تحميل البيانات...</div></div>';

    // 4. تحميل العرض المطلوب
    let view;
    try {
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
    } catch (e) {
        console.error("Route Error:", e);
        window.location.hash = '#home';
        return;
    }

    app.innerHTML = '';
    app.appendChild(view);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
