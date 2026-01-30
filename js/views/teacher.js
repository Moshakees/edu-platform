// Teacher View
window.TeacherView = async function (teacherId) {
    const elt = window.Utils.elt;

    // جلب البيانات من Supabase
    const db = await window.store.fetchAllData();
    const teacher = db.teachers.find(t => t.id == teacherId);
    const units = await window.store.getTeacherUnits(teacherId);

    if (!teacher) {
        window.location.hash = '#home';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' },
        elt('div', { style: 'margin-bottom: 30px;' },
            elt('a', { href: `#subject/${teacher.subject_id}`, style: 'color: var(--primary-color); text-decoration: none;' }, '← العودة للمدرسين'),
            elt('div', { style: 'display: flex; align-items: center; gap: 20px; margin-top: 20px;' },
                elt('img', { src: teacher.image, style: 'width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary-color);' }),
                elt('div', {},
                    elt('h1', {}, teacher.name),
                    elt('p', { style: 'color: var(--text-muted);' }, teacher.bio)
                )
            )
        ),
        elt('div', {},
            ...units.map(u => elt('div', { className: 'glass-panel', style: 'margin-bottom: 20px; padding: 0; overflow: hidden;' },
                elt('div', { style: 'padding: 15px 20px; background: rgba(255,255,255,0.05); font-weight: bold; border-bottom: 1px solid var(--surface-border);' }, u.title),
                elt('div', { style: 'padding: 10px 0;' },
                    ...(u.lessons || []).map(l => elt('div', {
                        className: 'lesson-row',
                        style: 'padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s;',
                        onclick: () => window.location.hash = `#lesson/${l.id}`,
                        onmouseover: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)',
                        onmouseout: (e) => e.currentTarget.style.background = 'transparent'
                    },
                        elt('div', { style: 'display: flex; align-items: center; gap: 15px;' },
                            elt('ion-icon', {
                                name: l.type === 'video' ? 'play-circle' : (l.type === 'quiz' ? 'help-circle' : 'document'),
                                style: `font-size: 1.4rem; color: var(--primary-color);`
                            }),
                            elt('span', {}, l.title)
                        ),
                        elt('ion-icon', { name: 'chevron-forward-outline', style: 'color: var(--text-muted);' })
                    ))
                )
            ))
        )
    );

    return container;
};
