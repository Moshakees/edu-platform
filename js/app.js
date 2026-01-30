// App Controller
(function () {
    const root = document.getElementById('app');

    function router() {
        const hash = window.location.hash.slice(1) || 'login';
        const parts = hash.split('/');
        const route = parts[0];
        const arg = parts[1];

        root.innerHTML = '';

        // Auth Gating
        const session = window.store.checkSession();
        if (!session && route !== 'login') {
            window.location.hash = '#login';
            return;
        }

        if (session && route === 'login') {
            window.location.hash = session.role === 'admin' ? '#admin' : '#home';
            return;
        }

        // Routing Logic
        let view;
        switch (route) {
            case 'login':
                view = window.LoginView();
                break;
            case 'home':
                view = window.HomeView();
                break;
            case 'subject':
                view = window.SubjectView(arg);
                break;
            case 'teacher':
                view = window.TeacherView(arg);
                break;
            case 'lesson':
                view = window.LessonView(arg);
                break;
            case 'admin':
                view = window.AdminView();
                break;
            default:
                view = window.HomeView();
        }

        if (view) root.appendChild(view);
    }

    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);
})();
