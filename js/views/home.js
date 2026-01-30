// Home View
window.HomeView = async function () {
    const elt = window.Utils.elt;
    const formatDate = window.Utils.formatDate;
    const session = window.store.checkSession();

    // جلب المواد من Supabase
    const subjects = await window.store.getSubjects();

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' },
        elt('header', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;' },
            elt('div', {},
                elt('h1', {}, `أهلاً بك، ${session.name}`),
                elt('p', { style: 'color: var(--text-muted);' },
                    session.role === 'admin' ? 'لوحة تحكم المسؤول' : `ينتهي اشتراكك في: ${formatDate(new Date(session.expiry).toISOString())}`
                )
            ),
            elt('div', { style: 'display: flex; gap: 10px;' },
                session.role === 'admin' ? elt('button', { className: 'btn btn-outline', onclick: () => window.location.hash = '#admin' }, 'لوحة التحكم') : null,
                elt('button', { className: 'btn btn-outline', onclick: () => window.store.logout() }, 'تسجيل الخروج')
            )
        ),
        elt('section', {},
            elt('h2', { style: 'margin-bottom: 24px;' }, 'اختر المادة الدراسية'),
            elt('div', { className: 'grid-cards' },
                ...subjects.map(s => elt('div', {
                    className: 'glass-panel card',
                    onclick: () => window.location.hash = `#subject/${s.id}`
                },
                    elt('img', { src: s.image || 'https://via.placeholder.com/100', alt: s.title }),
                    elt('h3', {}, s.title)
                ))
            )
        )
    );

    return container;
};
