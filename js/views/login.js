// Login View
window.LoginView = function () {
    const elt = window.Utils.elt;
    const showNotification = window.Utils.showNotification;

    const container = elt('div', { className: 'login-container' });

    const orb1 = elt('div', { style: 'position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; background: var(--primary-color); filter: blur(100px); opacity: 0.4; border-radius: 50%;' });
    const orb2 = elt('div', { style: 'position: absolute; bottom: -100px; right: -100px; width: 400px; height: 400px; background: var(--secondary-color); filter: blur(100px); opacity: 0.3; border-radius: 50%;' });

    const card = elt('div', { className: 'glass-panel', style: 'padding: 40px; width: 100%; max-width: 400px; z-index: 1;' });

    const title = elt('h2', { style: 'text-align: center; margin-bottom: 30px;' }, 'تسجيل الدخول');

    const input = elt('input', {
        type: 'text',
        placeholder: 'أدخل كود التفعيل (8 أرقام)',
        maxLength: '8',
        style: 'text-align: center; letter-spacing: 4px; font-size: 1.2rem; direction: ltr;'
    });

    const btn = elt('button', {
        className: 'btn btn-primary',
        style: 'width: 100%; margin-top: 20px;'
    }, 'دخول');

    const hint = elt('p', { style: 'margin-top: 20px; font-size: 0.8rem; color: #64748b; text-align: center;' }, 'للتجربة: اضغط 7 للأكواد أو admin123');

    btn.onclick = async () => {
        const code = input.value.trim();
        if (code.length < 5) return showNotification('الرجاء إدخال كود صحيح', 'error');

        const res = window.store.login(code);
        if (res.success) {
            showNotification('تم تسجيل الدخول بنجاح');
            window.location.hash = res.role === 'admin' ? '#admin' : '#home';
        } else {
            showNotification(res.message, 'error');
        }
    };

    card.append(title, input, btn, hint);
    container.append(orb1, orb2, card);

    return container;
};
