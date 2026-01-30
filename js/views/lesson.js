// Lesson View
window.LessonView = async function (lessonId) {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;
    const session = window.store.checkSession();

    const lesson = await window.store.getLesson(lessonId);
    if (!lesson) {
        window.location.hash = '#home';
        return elt('div');
    }

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px; padding-bottom: 100px;' },
        elt('div', { style: 'margin-bottom: 30px;' },
            elt('a', { href: 'javascript:history.back()', style: 'color: var(--primary-color); text-decoration: none;' }, '← العودة'),
            elt('h1', { style: 'margin-top: 10px;' }, lesson.title)
        )
    );

    const contentArea = elt('div', { className: 'glass-panel', style: 'padding: 0; position: relative; min-height: 400px;' });

    // --- Video Content ---
    if (lesson.type === 'video') {
        const videoWrapper = elt('div', { style: 'position: relative; width: 100%; aspect-ratio: 16/9; background: #000;' });

        // Watermark
        const watermark = elt('div', {
            id: 'video-watermark',
            style: 'position: absolute; z-index: 100; color: rgba(255,255,255,0.3); font-size: 1.2rem; pointer-events: none; transition: 0.5s;'
        }, `ID: ${session.code || 'User'}`);

        const iframe = elt('iframe', {
            src: lesson.content.includes('odysee.com') ? lesson.content.replace('odysee.com', 'odysee.com/$/embed') : lesson.content,
            style: 'width: 100%; height: 100%; border: none;',
            allowfullscreen: true
        });

        videoWrapper.append(watermark, iframe);
        contentArea.append(videoWrapper);

        // Watermark Movement Logic
        setInterval(() => {
            watermark.style.top = Math.random() * 80 + '%';
            watermark.style.left = Math.random() * 80 + '%';
        }, 4000);
    }

    // --- File Content ---
    if (lesson.type === 'file') {
        contentArea.style.padding = '60px 40px';
        contentArea.style.textAlign = 'center';
        contentArea.append(
            elt('ion-icon', { name: 'document-attach', style: 'font-size: 5rem; color: var(--primary-color); margin-bottom: 20px;' }),
            elt('h2', {}, 'هذا الدرس يحتوي على ملفات للتحميل'),
            elt('a', {
                href: lesson.content,
                target: '_blank',
                className: 'btn btn-primary',
                style: 'display: inline-block; margin-top: 20px;'
            }, 'تحميل الملفات (PDF / Resources)')
        );
    }

    // --- Quiz Content ---
    if (lesson.type === 'quiz') {
        contentArea.style.padding = '40px';
        const quizData = lesson.content;

        const renderQuiz = () => {
            contentArea.innerHTML = '';
            contentArea.append(elt('h2', { style: 'margin-bottom: 30px; text-align: center;' }, 'اختبار الدرس'));

            quizData.forEach((q, qIndex) => {
                const qDiv = elt('div', { style: 'margin-bottom: 30px; border-bottom: 1px solid var(--surface-border); padding-bottom: 20px;' },
                    elt('h3', { style: 'margin-bottom: 15px;' }, `${qIndex + 1}. ${q.question}`),
                    elt('div', { style: 'display: grid; gap: 10px;' },
                        ...q.options.map((opt, oIndex) => {
                            const label = elt('label', {
                                className: 'glass-panel',
                                style: 'padding: 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s;'
                            },
                                elt('input', { type: 'radio', name: `q${qIndex}`, value: oIndex, style: 'width: auto;' }),
                                elt('span', {}, opt)
                            );
                            label.onclick = () => {
                                label.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor = 'var(--surface-border)');
                                label.style.borderColor = 'var(--primary-color)';
                            };
                            return label;
                        })
                    )
                );
                contentArea.append(qDiv);
            });

            const submitBtn = elt('button', {
                className: 'btn btn-primary',
                style: 'width: 100%; margin-top: 20px;'
            }, 'إرسال الإجابات');

            submitBtn.onclick = () => {
                let score = 0;
                quizData.forEach((q, i) => {
                    const selected = document.querySelector(`input[name="q${i}"]:checked`);
                    if (selected && parseInt(selected.value) === q.correct) score++;
                });

                showNotification(`لقد حصلت على ${score} من ${quizData.length}`);

                // نتيجة الاختبار
                contentArea.innerHTML = '';
                contentArea.append(
                    elt('div', { style: 'text-align:center; padding: 40px;' },
                        elt('h2', {}, 'نتيجة الاختبار'),
                        elt('div', { style: 'font-size: 4rem; font-weight: bold; color: var(--primary-color); margin: 20px 0;' }, `${Math.round((score / quizData.length) * 100)}%`),
                        elt('p', {}, `لقد أجبت بشكل صحيح على ${score} من إجمالي ${quizData.length} سؤال`),
                        elt('button', { className: 'btn btn-outline', style: 'margin-top: 30px;', onclick: () => renderQuiz() }, 'إعادة المحاولة')
                    )
                );
            };
            contentArea.append(submitBtn);
        };
        renderQuiz();
    }

    container.append(contentArea);
    return container;
};
