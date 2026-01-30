// Subject View
window.SubjectView = async function (subjectId) {
    const elt = window.Utils.elt;

    // جلب البيانات من Supabase
    const db = await window.store.fetchAllData();
    const subject = db.subjects.find(s => s.id == subjectId);
    const teachers = await window.store.getTeachers(subjectId);

    if (!subject) {
        window.location.hash = '#home';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' },
        elt('div', { style: 'margin-bottom: 30px;' },
            elt('a', { href: '#home', style: 'color: var(--primary-color); text-decoration: none;' }, '← العودة للمواد'),
            elt('h1', { style: 'margin-top: 10px;' }, `مدرسين مادة ${subject.title}`)
        ),
        elt('div', { className: 'grid-cards' },
            ...teachers.map(t => elt('div', {
                className: 'glass-panel card',
                onclick: () => window.location.hash = `#teacher/${t.id}`
            },
                elt('img', { src: t.image || 'https://via.placeholder.com/100' }),
                elt('h3', {}, t.name),
                elt('p', { style: 'font-size: 0.9rem; color: var(--text-muted); margin-top: 10px;' }, t.bio)
            ))
        )
    );

    return container;
};
