// Subject View
window.SubjectView = function (subjectId) {
    const elt = window.Utils.elt;
    const session = window.store.checkSession();
    if (!session) return elt('div');

    const db = window.store.db;
    const subject = db.subjects.find(s => s.id == subjectId);

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' });

    const nav = elt('nav', { style: 'margin-bottom: 20px; color: var(--text-muted);' },
        elt('a', { href: '#home', style: 'color: var(--text-muted); text-decoration: none;' }, 'الرئيسية'),
        elt('span', {}, ' / '),
        elt('span', { style: 'color: var(--primary-color);' }, subject ? subject.title : 'مادة غير موجودة')
    );

    if (!subject) {
        container.append(nav, elt('h2', {}, 'عفوا، هذه المادة غير موجودة'));
        return container;
    }

    const title = elt('h2', { style: 'margin-bottom: 30px;' }, `مدرسين مادة ${subject.title}`);
    const grid = elt('div', { className: 'grid-cards' });

    const teachers = db.teachers.filter(t => t.subjectId == subjectId);

    teachers.forEach(t => {
        const card = elt('div', {
            className: 'glass-panel card',
            style: 'cursor: pointer;',
            onclick: () => window.location.hash = `#teacher/${t.id}`
        });

        const img = elt('img', { src: t.image || 'https://via.placeholder.com/100', alt: t.name });
        const name = elt('h3', {}, t.name);
        const bio = elt('p', { style: 'font-size: 0.9rem; color: var(--text-muted); margin-top: 8px;' }, t.bio || '');

        card.append(img, name, bio);
        grid.append(card);
    });

    if (teachers.length === 0) {
        grid.append(elt('div', { style: 'grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);' }, 'لا يوجد مدرسين لهذة المادة حالياً'));
    }

    container.append(nav, title, grid);
    return container;
};
