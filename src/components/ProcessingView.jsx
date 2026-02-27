import React from 'react';

export default function ProcessingView({ processingFiles }) {
    const totalFiles = processingFiles.length;
    const completedFiles = processingFiles.filter(f => f.status === 'complete').length;
    const hasErrors = processingFiles.some(f => f.status === 'error');

    return (
        <div className="processing-section">
            <div className="processing-card">
                <div className="processing-title">
                    {completedFiles < totalFiles && !hasErrors && (
                        <div className="processing-spinner" />
                    )}
                    <span>
                        {completedFiles === totalFiles
                            ? '✅ Processing Complete!'
                            : `Converting your files...`}
                    </span>
                </div>

                <div className="processing-list">
                    {processingFiles.map((pf, index) => (
                        <div key={pf.id} className="processing-item" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className={`processing-status-icon ${pf.status}`}>
                                {pf.status === 'complete' ? '✓' : pf.status === 'error' ? '✕' : '⟳'}
                            </div>

                            <div className="processing-item-info">
                                <div className="processing-item-name">
                                    {pf.originalName} → {pf.targetName || pf.targetFormat?.toUpperCase()}
                                </div>
                                <div className="processing-item-detail">
                                    {pf.status === 'complete' && 'Done'}
                                    {pf.status === 'processing' && `${pf.progress || 0}%`}
                                    {pf.status === 'pending' && 'Waiting...'}
                                    {pf.status === 'error' && (
                                        <span style={{ color: 'var(--error)' }}>{pf.errorMessage || 'Failed'}</span>
                                    )}
                                </div>
                                {(pf.status === 'processing' || pf.status === 'complete') && (
                                    <div className="progress-bar-track">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${pf.status === 'complete' ? 100 : pf.progress || 0}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="processing-time">
                    {completedFiles < totalFiles
                        ? `⏱️ Processing ${completedFiles + 1} of ${totalFiles}...`
                        : `🎉 All ${totalFiles} file(s) converted successfully!`}
                </div>
            </div>
        </div>
    );
}
