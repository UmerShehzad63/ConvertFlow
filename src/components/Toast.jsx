import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    return (
        <div className={`toast ${toast.type}`} role="alert">
            <span>{icons[toast.type] || 'ℹ️'}</span>
            <span>{toast.message}</span>
        </div>
    );
}
