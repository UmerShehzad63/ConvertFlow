import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadZone from './components/UploadZone';
import FileCard from './components/FileCard';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import Features from './components/Features';
import Toast from './components/Toast';
import PreviewModal from './components/PreviewModal';
import { detectFileType, getConversionOptions, getOperations, generateId, formatFileSize } from './utils/fileDetection';
import { convertFile, mergePdfs, splitPdf, compressImage, imageToGrayscale } from './utils/converter';

const VIEWS = { UPLOAD: 'upload', PROCESSING: 'processing', RESULTS: 'results' };

export default function App() {
    const [currentView, setCurrentView] = useState(VIEWS.UPLOAD);
    const [files, setFiles] = useState([]);
    const [processingFiles, setProcessingFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);

    // ─── Toast helpers ──────────────────────────────────────────
    const addToast = useCallback((message, type = 'info') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // ─── File handling ──────────────────────────────────────────
    const handleFilesAdded = useCallback((newFiles) => {
        const fileItems = newFiles.map(file => {
            const detectedType = detectFileType(file);
            const conversionOptions = getConversionOptions(detectedType);
            const operations = getOperations(detectedType);

            // Auto-select recommended conversion
            const recommended = conversionOptions.find(o => o.isRecommended);

            return {
                id: generateId(),
                file,
                detectedType,
                conversionOptions,
                operations,
                selectedConversion: recommended?.format || (conversionOptions[0]?.format || ''),
                selectedOperations: [],
            };
        });

        setFiles(prev => [...prev, ...fileItems]);
        addToast(`${newFiles.length} file${newFiles.length !== 1 ? 's' : ''} added`, 'success');
    }, [addToast]);

    const handleConversionChange = useCallback((fileId, format) => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, selectedConversion: format } : f
        ));
    }, []);

    const handleOperationToggle = useCallback((fileId, opId) => {
        setFiles(prev => prev.map(f => {
            if (f.id !== fileId) return f;
            const ops = f.selectedOperations || [];
            return {
                ...f,
                selectedOperations: ops.includes(opId)
                    ? ops.filter(o => o !== opId)
                    : [...ops, opId],
            };
        }));
    }, []);

    const handleRemoveFile = useCallback((fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // ─── Conversion ─────────────────────────────────────────────
    const handleConvert = useCallback(async () => {
        const filesToConvert = files.filter(f => f.selectedConversion);
        if (filesToConvert.length === 0) {
            addToast('Please select a conversion format for at least one file', 'error');
            return;
        }

        // Check for PDF merge operation
        const pdfMergeFiles = files.filter(f =>
            f.detectedType.subcategory === 'pdf' &&
            (f.selectedOperations || []).includes('merge')
        );

        setCurrentView(VIEWS.PROCESSING);

        // Initialize processing state
        const processingState = filesToConvert.map(f => ({
            id: f.id,
            originalName: f.file.name,
            targetFormat: f.selectedConversion,
            targetName: replaceExt(f.file.name, f.selectedConversion),
            status: 'pending',
            progress: 0,
            errorMessage: null,
        }));
        setProcessingFiles([...processingState]);

        const allResults = [];

        // Handle PDF merge if applicable
        if (pdfMergeFiles.length > 1) {
            const mergeIdx = processingState.findIndex(p =>
                pdfMergeFiles.some(f => f.id === p.id)
            );
            if (mergeIdx >= 0) {
                processingState[mergeIdx].status = 'processing';
                setProcessingFiles([...processingState]);

                try {
                    const mergeResult = await mergePdfs(
                        pdfMergeFiles.map(f => f.file),
                        (progress) => {
                            processingState[mergeIdx].progress = progress;
                            setProcessingFiles([...processingState]);
                        }
                    );
                    allResults.push({
                        ...mergeResult,
                        id: generateId(),
                        category: 'document',
                        originalSize: pdfMergeFiles.reduce((sum, f) => sum + f.file.size, 0),
                    });
                    processingState[mergeIdx].status = 'complete';
                    processingState[mergeIdx].progress = 100;
                    setProcessingFiles([...processingState]);
                } catch (err) {
                    processingState[mergeIdx].status = 'error';
                    processingState[mergeIdx].errorMessage = err.message;
                    setProcessingFiles([...processingState]);
                }
            }
        }

        // Process individual conversions
        for (let i = 0; i < filesToConvert.length; i++) {
            const fileItem = filesToConvert[i];
            const pIdx = processingState.findIndex(p => p.id === fileItem.id);

            // Skip if already handled by merge
            if (processingState[pIdx].status === 'complete') continue;

            processingState[pIdx].status = 'processing';
            setProcessingFiles([...processingState]);

            try {
                // Handle special operations
                const ops = fileItem.selectedOperations || [];

                if (ops.includes('split') && fileItem.detectedType.subcategory === 'pdf') {
                    const splitResults = await splitPdf(fileItem.file, (progress) => {
                        processingState[pIdx].progress = progress;
                        setProcessingFiles([...processingState]);
                    });
                    splitResults.forEach(r => {
                        allResults.push({
                            ...r,
                            id: generateId(),
                            category: 'document',
                            originalSize: fileItem.file.size,
                        });
                    });
                } else if (ops.includes('compress') && fileItem.detectedType.category === 'image') {
                    const compressed = await compressImage(fileItem.file, 0.6, (progress) => {
                        processingState[pIdx].progress = progress;
                        setProcessingFiles([...processingState]);
                    });
                    allResults.push({
                        ...compressed,
                        id: generateId(),
                        category: 'image',
                        originalSize: fileItem.file.size,
                    });
                } else if (ops.includes('grayscale') && fileItem.detectedType.category === 'image') {
                    const gray = await imageToGrayscale(fileItem.file, (progress) => {
                        processingState[pIdx].progress = progress;
                        setProcessingFiles([...processingState]);
                    });
                    allResults.push({
                        ...gray,
                        id: generateId(),
                        category: 'image',
                        originalSize: fileItem.file.size,
                    });
                } else {
                    // Standard conversion
                    const result = await convertFile(
                        fileItem.file,
                        fileItem.selectedConversion,
                        fileItem.detectedType,
                        (progress) => {
                            processingState[pIdx].progress = progress;
                            setProcessingFiles([...processingState]);
                        }
                    );

                    allResults.push({
                        ...result,
                        id: generateId(),
                        category: fileItem.detectedType.category,
                        originalSize: fileItem.file.size,
                    });
                }

                processingState[pIdx].status = 'complete';
                processingState[pIdx].progress = 100;
            } catch (err) {
                processingState[pIdx].status = 'error';
                processingState[pIdx].errorMessage = err.message;
            }

            setProcessingFiles([...processingState]);
        }

        // Small delay to show completion state
        await sleep(500);
        setResults(allResults);
        setCurrentView(VIEWS.RESULTS);

        if (allResults.length > 0) {
            addToast(`${allResults.length} file${allResults.length !== 1 ? 's' : ''} converted!`, 'success');
        }
    }, [files, addToast]);

    // ─── Download handlers ──────────────────────────────────────
    const handleDownload = useCallback((result) => {
        if (!result.blob) return;
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const handleDownloadAll = useCallback(async () => {
        if (results.length === 0) return;

        if (results.length === 1) {
            handleDownload(results[0]);
            return;
        }

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            results.forEach(r => {
                if (r.blob) zip.file(r.name, r.blob);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'convertflow-files.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast('ZIP downloaded!', 'success');
        } catch (err) {
            addToast('Failed to create ZIP: ' + err.message, 'error');
        }
    }, [results, handleDownload, addToast]);

    const handlePreview = useCallback((result) => {
        setPreviewFile(result);
    }, []);

    const handleReset = useCallback(() => {
        setFiles([]);
        setProcessingFiles([]);
        setResults([]);
        setCurrentView(VIEWS.UPLOAD);
    }, []);

    // ─── Render ─────────────────────────────────────────────────
    const canConvert = files.some(f => f.selectedConversion);

    return (
        <>
            <Header />

            <main className="main">
                {/* ── Upload View ─────────────────────────────────── */}
                {currentView === VIEWS.UPLOAD && (
                    <>
                        <section className="hero">
                            <div className="hero-badge">✨ 100% Free & Private</div>
                            <h1>
                                Upload anything.<br />
                                <span className="gradient-text">Convert everything.</span>
                            </h1>
                            <p>
                                Simply drop your files and we'll detect the format, show all conversion options,
                                and process everything right in your browser. No uploads. No servers.
                            </p>
                        </section>

                        <UploadZone onFilesAdded={handleFilesAdded} />

                        {/* File List */}
                        {files.length > 0 && (
                            <section className="file-list-section">
                                <div className="file-list-header">
                                    <h2>
                                        Your Files
                                        <span className="file-count-badge">{files.length}</span>
                                    </h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-ghost" onClick={handleReset}>
                                            🗑️ Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="file-list">
                                    {files.map(fileItem => (
                                        <FileCard
                                            key={fileItem.id}
                                            fileItem={fileItem}
                                            onConversionChange={handleConversionChange}
                                            onRemove={handleRemoveFile}
                                            onOperationToggle={handleOperationToggle}
                                        />
                                    ))}
                                </div>

                                <div className="convert-actions">
                                    <button
                                        className="convert-btn"
                                        onClick={handleConvert}
                                        disabled={!canConvert}
                                        aria-label="Convert all files"
                                    >
                                        🚀 Convert {files.filter(f => f.selectedConversion).length} File{files.filter(f => f.selectedConversion).length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </section>
                        )}

                        {files.length === 0 && <Features />}
                    </>
                )}

                {/* ── Processing View ─────────────────────────────── */}
                {currentView === VIEWS.PROCESSING && (
                    <ProcessingView processingFiles={processingFiles} />
                )}

                {/* ── Results View ────────────────────────────────── */}
                {currentView === VIEWS.RESULTS && (
                    <ResultsView
                        results={results}
                        onDownload={handleDownload}
                        onDownloadAll={handleDownloadAll}
                        onPreview={handlePreview}
                        onReset={handleReset}
                    />
                )}
            </main>

            <Footer />

            <Toast toasts={toasts} removeToast={removeToast} />

            {previewFile && (
                <PreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </>
    );
}

function replaceExt(filename, newExt) {
    const dotIndex = filename.lastIndexOf('.');
    const baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
    return `${baseName}.${newExt}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
