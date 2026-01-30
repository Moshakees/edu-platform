// Utils.js - Global Scope
window.Utils = {
    elt: function (type, props, ...children) {
        const dom = document.createElement(type);
        if (props) {
            // Handle specific props like onclick directly or via Object.assign
            // But Object.assign works for most DOM props
            Object.assign(dom, props);
            // Handling styles object if passed
            if (props.style && typeof props.style === 'object') {
                Object.assign(dom.style, props.style);
            }
        }
        for (const child of children) {
            if (typeof child !== "string") dom.appendChild(child);
            else dom.appendChild(document.createTextNode(child));
        }
        return dom;
    },

    showNotification: function (message, type = 'info') {
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        Object.assign(div.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            padding: '12px 24px',
            borderRadius: '8px',
            backdropFilter: 'blur(4px)',
            color: 'white',
            zIndex: '1000',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        });
        div.innerText = message;

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    },

    formatDate: function (isoString) {
        if (!isoString) return 'غير محدد';
        return new Date(isoString).toLocaleDateString('ar-EG');
    }
};
