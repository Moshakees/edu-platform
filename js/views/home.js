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
    const header = elt('header', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;' },
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
    );

    container.append(header);

    // --- مكون السلايدر (Slideshow) ---
    if (sliderImages.length > 0) {
        const sliderContainer = elt('div', {
            className: 'glass-panel',
            style: 'width: 100%; height: 350px; margin-bottom: 40px; position: relative; overflow: hidden; padding: 0; border-radius: 20px;'
        });

        const imagesElements = sliderImages.map((img, index) => elt('div', {
            style: `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: url("${img.image_url}") center/cover no-repeat;
                opacity: ${index === 0 ? '1' : '0'};
                transition: opacity 1s ease-in-out;
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
