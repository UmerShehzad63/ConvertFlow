import React from 'react';
import { formatFileSize } from '../utils/fileDetection';

export default function ResultsView({ results, onDownload, onDownloadAll, onPreview, onReset }) {
    return (
        <div className="results-section">
            <div className="results-header">
                <div className="results-icon">✅</div>
                <h2>Conversion Complete!</h2>
                <p>{results.length} file{results.length !== 1 ? 's' : ''} converted successfully</p>
            </div>

            <div className="results-list">
                {results.map((result, index) => (
                    <div
                        key={result.id || index}
                        className="result-card"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <div className={`file-type-icon ${result.category || 'other'}`}>
                            {(result.name?.split('.').pop() || '?').toUpperCase().slice(0, 4)}
                        </div>

                        <div className="result-info">
                            <div className="result-name">{result.name}</div>
                            <div className="result-meta">
                                <span>{formatFileSize(result.blob?.size || 0)}</span>
                                {result.originalSize && (
                                    <>
                                        <span>•</span>
                                        <span className="result-size-change">
                                            {result.blob?.size < result.originalSize
                                                ? `↓ ${Math.round((1 - result.blob.size / result.originalSize) * 100)}% smaller`
                                                : `${formatFileSize(result.blob?.size || 0)}`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="result-actions">
                            {result.blob && (result.type?.startsWith('image/') || result.type?.startsWith('text/') || result.type === 'application/json') && (
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => onPreview(result)}
                                    aria-label={`Preview ${result.name}`}
                                    title="Preview"
                                >
                                    👁️
                                </button>
                            )}
                            <button
                                className="btn btn-secondary"
                                onClick={() => onDownload(result)}
                                aria-label={`Download ${result.name}`}
                            >
                                ⬇️ Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="results-bulk-actions">
                {results.length > 1 && (
                    <button className="btn btn-primary btn-lg" onClick={onDownloadAll}>
                        📦 Download All (ZIP)
                    </button>
                )}
                <button className="btn btn-secondary btn-lg" onClick={onReset}>
                    🔄 Convert More Files
                </button>
            </div>

            <div className="results-notice">
                🔒 Your files are processed locally in your browser. Nothing is uploaded to any server.
            </div>
        </div>
    );
}
