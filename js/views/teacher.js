// Teacher View
window.TeacherView = function (teacherId) {
    const elt = window.Utils.elt;
    const session = window.store.checkSession();
    if (!session) return elt('div');

    const db = window.store.db;
    const teacher = db.teachers.find(t => t.id == teacherId);

    const subject = teacher ? db.subjects.find(s => s.id == teacher.subjectId) : null;

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' });

    const nav = elt('nav', { style: 'margin-bottom: 20px; color: var(--text-muted);' },
        elt('a', { href: '#home', style: 'color: var(--text-muted); text-decoration: none;' }, 'الرئيسية'),
        elt('span', {}, ' / '),
        elt('a', { href: subject ? `#subject/${subject.id}` : '#home', style: 'color: var(--text-muted); text-decoration: none;' }, subject ? subject.title : '...'),
        elt('span', {}, ' / '),
        elt('span', { style: 'color: var(--primary-color);' }, teacher ? teacher.name : '...')
    );

    if (!teacher) {
        container.append(nav, elt('h2', {}, 'المدرس غير موجود'));
        return container;
    }

    const header = elt('div', { style: 'display: flex; gap: 20px; align-items: center; margin-bottom: 40px;' });
    const img = elt('img', { src: teacher.image, style: 'width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);' });
    const info = elt('div', {},
        elt('h2', { style: 'margin: 0;' }, teacher.name),
        elt('p', { style: 'color: var(--text-muted); margin-top: 5px;' }, teacher.bio)
    );
    header.append(img, info);

    const contentDiv = elt('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });

    const units = db.units.filter(u => u.teacherId == teacherId);

    if (units.length === 0) {
        contentDiv.append(elt('p', { style: 'text-align: center; color: var(--text-muted); padding: 40px;' }, 'لا يوجد محتوى مضاف لهذا المدرس'));
    }

    units.forEach(unit => {
        const unitCard = elt('div', { className: 'glass-panel', style: 'overflow: hidden;' });
        const unitHeader = elt('div', {
            style: 'padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03);',
            onclick: () => {
                const list = unitCard.querySelector('.lesson-list');
                const isHidden = list.style.display === 'none';
                list.style.display = isHidden ? 'block' : 'none';
                const icon = unitHeader.querySelector('ion-icon');
                if (icon) icon.name = isHidden ? 'chevron-up-outline' : 'chevron-down-outline';
            }
        });

        unitHeader.append(
            elt('h3', { style: 'font-size: 1.2rem; margin: 0;' }, unit.title),
            elt('ion-icon', { name: 'chevron-down-outline', style: 'font-size: 1.5rem;' })
        );

        const lessons = db.lessons.filter(l => l.unitId == unit.id);
        const lessonList = elt('div', { className: 'lesson-list', style: 'display: none; padding: 0;' });

        if (lessons.length === 0) {
            lessonList.append(elt('div', { style: 'padding: 15px 20px; color: var(--text-muted);' }, 'لا توجد دروس'));
        } else {
            lessons.forEach(l => {
                const item = elt('div', {
                    style: 'padding: 15px 20px; border-top: 1px solid var(--surface-border); display: flex; align-items: center; gap: 10px; cursor: pointer; transition: background 0.2s;',
                    onmouseenter: (e) => e.target.style.background = 'rgba(255,255,255,0.05)',
                    onmouseleave: (e) => e.target.style.background = 'transparent',
                    onclick: () => window.location.hash = `#lesson/${l.id}`
                });

                let iconName = 'document-text-outline';
                if (l.type === 'video') iconName = 'play-circle-outline';
                if (l.type === 'quiz') iconName = 'checkbox-outline';

                item.append(
                    elt('ion-icon', { name: iconName, style: 'font-size: 1.2rem; color: var(--primary-color);' }),
                    elt('span', {}, l.title)
                );
                lessonList.append(item);
            });
        }

        unitCard.append(unitHeader, lessonList);
        contentDiv.append(unitCard);
    });

    container.append(nav, header, contentDiv);
    return container;
};
