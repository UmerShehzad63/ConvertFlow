import React from 'react';
import { formatFileSize } from '../utils/fileDetection';

export default function FileCard({ fileItem, onConversionChange, onRemove, onOperationToggle }) {
    const { file, detectedType, conversionOptions, operations, selectedConversion, selectedOperations } = fileItem;

    const categoryClass = detectedType.category || 'other';

    return (
        <div className="file-card">
            <div className="file-card-top">
                <div className={`file-type-icon ${categoryClass}`}>
                    {detectedType.icon || '?'}
                </div>

                <div className="file-info">
                    <div className="file-name" title={file.name}>{file.name}</div>
                    <div className="file-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="file-meta-dot" />
                        <span>{detectedType.label}</span>
                        {detectedType.confidence && (
                            <>
                                <span className="file-meta-dot" />
                                <span style={{ color: detectedType.confidence > 0.9 ? 'var(--success)' : 'var(--warning)' }}>
                                    {Math.round(detectedType.confidence * 100)}% match
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    className="file-remove-btn"
                    onClick={() => onRemove(fileItem.id)}
                    aria-label={`Remove ${file.name}`}
                    title="Remove file"
                >
                    ✕
                </button>
            </div>

            <div className="file-card-options">
                {conversionOptions.length > 0 && (
                    <div className="file-options-row">
                        <span className="file-options-label">Convert to:</span>
                        <div className="format-buttons">
                            {conversionOptions.map(opt => (
                                <button
                                    key={opt.format}
                                    className={`format-btn ${selectedConversion === opt.format ? 'active' : ''} ${opt.isRecommended ? 'recommended' : ''}`}
                                    onClick={() => onConversionChange(fileItem.id, selectedConversion === opt.format ? '' : opt.format)}
                                    aria-pressed={selectedConversion === opt.format}
                                    title={opt.isRecommended ? `${opt.displayName} (Recommended)` : opt.displayName}
                                >
                                    {opt.displayName}
                                    {opt.isRecommended && <span className="format-star">⭐</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {operations.length > 0 && (
                    <div className="file-options-row">
                        <span className="file-options-label">Tools:</span>
                        <div className="file-operations">
                            {operations.map(op => (
                                <button
                                    key={op.id}
                                    className={`file-operation-tag ${(selectedOperations || []).includes(op.id) ? 'active' : ''}`}
                                    onClick={() => onOperationToggle(fileItem.id, op.id)}
                                    aria-pressed={(selectedOperations || []).includes(op.id)}
                                >
                                    {op.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
