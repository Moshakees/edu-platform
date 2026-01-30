// Home View
window.HomeView = function () {
    const elt = window.Utils.elt;
    const formatDate = window.Utils.formatDate;

    const session = window.store.checkSession();
    if (!session) return elt('div');

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' });

    const header = elt('header', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;' });
    const welcome = elt('div', {},
        elt('h1', {}, `مرحباً، ${session.name || 'طالب'}`),
        elt('p', { style: 'color: var(--text-muted);' }, `تاريخ انتهاء الكود: ${formatDate(new Date(session.expiry).toISOString())}`)
    );
    const logoutBtn = elt('button', { className: 'btn btn-outline', onclick: () => window.store.logout() }, 'تسجيل الخروج');
    header.append(welcome, logoutBtn);

    const subjectsTitle = elt('h2', { style: 'border-right: 4px solid var(--primary-color); padding-right: 12px;' }, 'المواد الدراسية');

    const db = window.store.db;
    const subjectsGrid = elt('div', { className: 'grid-cards' });

    db.subjects.forEach(sub => {
        const card = elt('div', {
            className: 'glass-panel card',
            style: 'cursor: pointer;',
            onclick: () => window.location.hash = `#subject/${sub.id}`
        });

        const img = elt('img', { src: sub.image, alt: sub.title });
        const title = elt('h3', {}, sub.title);

        card.append(img, title);
        subjectsGrid.append(card);
    });

    if (db.subjects.length === 0) {
        subjectsGrid.append(elt('p', { style: 'color: var(--text-muted);' }, 'لا توجد مواد مضافة حالياً.'));
    }

    container.append(header, subjectsTitle, subjectsGrid);
    return container;
};
