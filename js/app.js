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
