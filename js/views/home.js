// Home View
window.HomeView = async function () {
    const elt = window.Utils.elt;
    const formatDate = window.Utils.formatDate;
    const session = window.store.checkSession();

    // جلب البيانات
    const db = await window.store.fetchAllData();
    const subjects = db.subjects;
    const sliderImages = db.slider;

    const container = elt('div', { className: 'container page-transition', style: 'padding-top: 40px;' });

    // Header
    const header = elt('header', { className: 'main-header' },
        elt('div', {},
            elt('h1', {}, `أهلاً بك، ${session.name}`),
            elt('p', { style: 'color: var(--text-muted);' },
                session.role === 'admin' ? 'لوحة تحكم المسؤول' : `ينتهي اشتراكك في: ${formatDate(new Date(session.expiry).toISOString())}`
            )
        ),
        elt('div', { style: 'display: flex; gap: 10px;' },
            session.role === 'admin' ? elt('button', { className: 'btn btn-outline', onclick: () => window.location.hash = '#admin', title: 'لوحة التحكم' }, elt('ion-icon', { name: 'settings-outline' })) : null,
            elt('button', { className: 'btn btn-outline', style: 'color: #ef4444; border-color: rgba(239, 68, 68, 0.3);', onclick: () => { if (confirm('هل تريد تسجيل الخروج؟')) window.store.logout(); }, title: 'تسجيل الخروج' }, elt('ion-icon', { name: 'log-out-outline', style: 'font-size: 1.2rem;' }))
        )
    );

    container.append(header);

    // --- مكون السلايدر (Slideshow) ---
    if (sliderImages.length > 0) {
        const sliderContainer = elt('div', { className: 'hero-slider glass-panel' });

        const imagesElements = sliderImages.map((img, index) => elt('div', {
            className: 'slider-img',
            style: `
                background-image: url("${img.image_url}");
                opacity: ${index === 0 ? '1' : '0'};
            `
        }));

        sliderContainer.append(...imagesElements);
        container.append(sliderContainer);

        // منطق تغيير الصور تلقائياً
        let currentIdx = 0;
        if (sliderImages.length > 1) {
            setInterval(() => {
                imagesElements[currentIdx].style.opacity = '0';
                currentIdx = (currentIdx + 1) % imagesElements.length;
                imagesElements[currentIdx].style.opacity = '1';
            }, 5000);
        }
    }

    // Grid Subjects
    const gridSection = elt('section', {},
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
    );

    container.append(gridSection);
    return container;
};
