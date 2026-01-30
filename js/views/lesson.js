// Lesson View
window.LessonView = function (lessonId) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const session = window.store.checkSession();
    if (!session) return elt('div');

    const db = window.store.db;
    const lesson = db.lessons.find(l => l.id == lessonId);

    let unit, teacher, subject;
    if (lesson) {
        unit = db.units.find(u => u.id == lesson.unitId);
        if (unit) teacher = db.teachers.find(t => t.id == unit.teacherId);
        if (teacher) subject = db.subjects.find(s => s.id == teacher.subjectId);
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 60px;' });

    const nav = elt('nav', { style: 'margin-bottom: 20px; color: var(--text-muted); font-size: 0.9rem;' },
        elt('a', { href: '#home', style: 'color: var(--text-muted); text-decoration: none;' }, 'الرئيسية'),
        elt('span', {}, ' / '),
        elt('a', { href: subject ? `#subject/${subject.id}` : '#', style: 'color: var(--text-muted); text-decoration: none;' }, subject ? subject.title : '...'),
        elt('span', {}, ' / '),
        elt('a', { href: teacher ? `#teacher/${teacher.id}` : '#', style: 'color: var(--text-muted); text-decoration: none;' }, teacher ? teacher.name : '...'),
        elt('span', {}, ' / '),
        elt('span', { style: 'color: var(--primary-color);' }, lesson ? lesson.title : '...')
    );

    if (!lesson) {
        container.append(nav, elt('h2', {}, 'الدرس غير موجود'));
        return container;
    }

    const title = elt('h2', { style: 'margin-bottom: 20px;' }, lesson.title);
    container.append(nav, title);

    const contentPanel = elt('div', { className: 'glass-panel', style: 'padding: 20px; min-height: 400px; position: relative; overflow: hidden;' });

    if (lesson.type === 'video') {
        const wrapper = elt('div', {
            style: 'position: relative; width: 100%; padding-top: 56.25%; background: black; border-radius: 8px; overflow: hidden;'
        });

        wrapper.oncontextmenu = (e) => e.preventDefault();

        const iframe = elt('iframe', {
            src: lesson.content, // Should be Embed URL
            style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;',
            allowfullscreen: 'true'
        });

        const watermark = elt('div', {
            style: 'position: absolute; color: rgba(255,255,255,0.3); font-size: 1.5rem; font-weight: bold; pointer-events: none; user-select: none; z-index: 10; white-space: nowrap;'
        }, `${session.name} (${session.code})`);

        const moveWatermark = () => {
            watermark.style.top = Math.floor(Math.random() * 80) + '%';
            watermark.style.left = Math.floor(Math.random() * 80) + '%';
        };
        moveWatermark();
        const wmInterval = setInterval(moveWatermark, 4000);

        const cleanup = setInterval(() => {
            if (!document.body.contains(watermark)) {
                clearInterval(wmInterval);
                clearInterval(cleanup);
            }
        }, 1000);

        wrapper.append(iframe, watermark);
        contentPanel.append(wrapper);
    } else if (lesson.type === 'quiz') {
        const attemptKey = `attempt_${session.code}_${lesson.id}`;
        let attempts = parseInt(localStorage.getItem(attemptKey) || '0');

        function renderQuiz(panel, lesson, attempts, attemptKey) {
            const questions = lesson.content || [];

            const form = elt('div', { style: 'display: flex; flex-direction: column; gap: 30px;' });

            questions.forEach((q, idx) => {
                const qDiv = elt('div', { className: 'quiz-question' },
                    elt('h4', {}, `${idx + 1}. ${q.question}`),
                    elt('div', { className: 'options', style: 'display: flex; flex-direction: column; gap: 10px; margin-top: 10px;' })
                );

                const optionsDiv = qDiv.querySelector('.options');
                q.options.forEach((opt, optIdx) => {
                    const label = elt('label', { style: 'display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; border: 1px solid var(--surface-border); border-radius: 8px;' });
                    const radio = elt('input', { type: 'radio', name: `q_${idx}`, value: optIdx, style: 'width: auto;' });
                    label.append(radio, elt('span', {}, opt));
                    optionsDiv.append(label);
                });

                form.append(qDiv);
            });

            const submitBtn = elt('button', { className: 'btn btn-primary', style: 'align-self: flex-start;' }, 'إرسال الإجابة');

            submitBtn.onclick = () => {
                let score = 0;
                let answeredAll = true;

                questions.forEach((q, idx) => {
                    const selected = form.querySelector(`input[name="q_${idx}"]:checked`);
                    if (!selected) answeredAll = false;
                    else if (parseInt(selected.value) === q.correct) score++;
                });

                if (!answeredAll) return showNotification('الرجاء الإجابة على جميع الأسئلة', 'error');

                const percentage = Math.round((score / questions.length) * 100);

                attempts++;
                localStorage.setItem(attemptKey, attempts);

                const oldMax = parseInt(localStorage.getItem(attemptKey + '_max') || '0');
                if (percentage > oldMax) localStorage.setItem(attemptKey + '_max', percentage);

                panel.innerHTML = '';
                panel.append(
                    elt('div', { style: 'text-align: center; padding: 40px;' },
                        elt('h3', {}, 'نتيجة الاختبار'),
                        elt('div', {
                            style: `font-size: 3rem; font-weight: bold; margin: 20px 0; color: ${percentage >= 50 ? '#10b981' : '#ef4444'};`
                        }, `${percentage}%`),
                        elt('p', {}, `عدد الإجابات الصحيحة: ${score} من ${questions.length}`),
                        elt('button', { className: 'btn btn-outline', onclick: () => location.reload() }, 'عودة')
                    )
                );
            };

            form.append(submitBtn);
            panel.append(form);
        }

        if (attempts >= 2) {
            contentPanel.append(
                elt('div', { style: 'text-align: center; padding: 40px;' },
                    elt('h3', { style: 'color: var(--secondary-color);' }, 'لقد استنفذت عدد المحاولات المسموح بها لهذا الاختبار.'),
                    elt('p', {}, `أعلى درجة: ${localStorage.getItem(attemptKey + '_max') || '0'}%`)
                )
            );
        } else {
            renderQuiz(contentPanel, lesson, attempts, attemptKey);
        }
    } else if (lesson.type === 'file') {
        contentPanel.append(
            elt('div', { style: 'text-align: center; padding: 60px;' },
                elt('ion-icon', { name: 'document-attach-outline', style: 'font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;' }),
                elt('h3', {}, 'ملف الدرس'),
                elt('a', {
                    href: lesson.content,
                    target: '_blank',
                    className: 'btn btn-primary',
                    style: 'margin-top: 20px;'
                }, 'تحميل الملف')
            )
        );
    }

    container.append(contentPanel);
    return container;
};
