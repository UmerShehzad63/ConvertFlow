import React, { useRef, useState, useCallback } from 'react';

export default function UploadZone({ onFilesAdded, disabled }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesAdded(files);
        }
    }, [onFilesAdded, disabled]);

    const handleClick = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFilesAdded(files);
        }
        e.target.value = '';
    };

    const handlePaste = useCallback((e) => {
        if (disabled) return;
        const items = Array.from(e.clipboardData?.items || []);
        const files = items
            .filter(item => item.kind === 'file')
            .map(item => item.getAsFile())
            .filter(Boolean);
        if (files.length > 0) {
            onFilesAdded(files);
        }
    }, [onFilesAdded, disabled]);

    // Listen for paste events globally
    React.useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const handleUrlSubmit = () => {
        if (urlValue.trim()) {
            // For URL imports, we create a simple fetch
            setShowUrlInput(false);
            setUrlValue('');
            // Show a toast that URL import is noted
            alert('URL import would fetch: ' + urlValue + '\n\nNote: URL import requires server-side processing.');
        }
    };

    return (
        <>
            <div className="upload-zone-wrapper">
                <div
                    className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload files by clicking or dragging and dropping"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
                >
                    <div className="upload-zone-content">
                        <div className="upload-icon">
                            {isDragOver ? '📥' : '☁️'}
                        </div>
                        <h2 className="upload-title">
                            {isDragOver ? 'Release to upload' : 'Drop files here'}
                        </h2>
                        <p className="upload-subtitle">
                            or click to browse your files
                        </p>

                        <div className="upload-actions" onClick={e => e.stopPropagation()}>
                            <button className="btn btn-primary btn-lg" onClick={handleClick}>
                                📁 Choose Files
                            </button>
                        </div>

                        <div className="upload-divider" onClick={e => e.stopPropagation()}>
                            <span>or import from</span>
                        </div>

                        <div className="upload-cloud-actions" onClick={e => e.stopPropagation()}>
                            <button
                                className="cloud-btn"
                                onClick={() => setShowUrlInput(true)}
                                aria-label="Import from URL"
                            >
                                🔗 URL
                            </button>
                            <button className="cloud-btn" onClick={handleClick} aria-label="Import from device">
                                💻 Device
                            </button>
                        </div>

                        <div className="upload-formats">
                            <span>PDF</span>
                            <span>Word</span>
                            <span>Images</span>
                            <span>Video</span>
                            <span>Audio</span>
                            <span>200+</span>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                        aria-hidden="true"
                    />
                </div>

                <p style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: 'var(--fs-xs)',
                    color: 'var(--text-muted)'
                }}>
                    💡 Tip: You can also paste images with <kbd style={{
                        padding: '2px 6px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px'
                    }}>Ctrl+V</kbd>
                </p>
            </div>

            {showUrlInput && (
                <div className="url-input-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) setShowUrlInput(false);
                }}>
                    <div className="url-input-modal">
                        <h3>🔗 Import from URL</h3>
                        <div className="url-input-group">
                            <input
                                type="url"
                                placeholder="https://example.com/file.pdf"
                                value={urlValue}
                                onChange={e => setUrlValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleUrlSubmit(); }}
                                autoFocus
                            />
                            <button className="btn btn-primary" onClick={handleUrlSubmit}>
                                Fetch
                            </button>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                            Enter a direct link to a file you want to convert
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
