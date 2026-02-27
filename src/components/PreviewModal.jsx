import React, { useEffect, useState } from 'react';

export default function PreviewModal({ file, onClose }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [textContent, setTextContent] = useState(null);

    useEffect(() => {
        if (!file) return;

        const blob = file.blob || file.originalFile;
        if (!blob) return;

        const type = blob.type || file.type || '';

        if (type.startsWith('image/')) {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        if (
            type.startsWith('text/') ||
            type === 'application/json' ||
            type === 'application/xml'
        ) {
            const reader = new FileReader();
            reader.onload = (e) => setTextContent(e.target.result);
            reader.readAsText(blob);
        }
    }, [file]);

    if (!file) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="preview-overlay" onClick={handleOverlayClick}>
            <div className="preview-modal">
                <div className="preview-header">
                    <h3>{file.name}</h3>
                    <button className="btn btn-ghost" onClick={onClose} aria-label="Close preview">
                        ✕
                    </button>
                </div>
                <div className="preview-body">
                    {previewUrl && <img src={previewUrl} alt={`Preview of ${file.name}`} />}
                    {textContent && <pre>{textContent.substring(0, 5000)}{textContent.length > 5000 ? '\n\n... (truncated)' : ''}</pre>}
                    {!previewUrl && !textContent && (
                        <p style={{ color: 'var(--text-muted)' }}>
                            Preview not available for this file type.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
