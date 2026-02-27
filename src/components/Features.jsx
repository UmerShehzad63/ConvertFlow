import React from 'react';

const features = [
    {
        icon: '⚡',
        iconBg: 'rgba(99, 102, 241, 0.12)',
        title: 'Lightning Fast',
        description: 'All conversions happen right in your browser. No uploads, no waiting for servers.',
    },
    {
        icon: '🔒',
        iconBg: 'rgba(16, 185, 129, 0.12)',
        title: '100% Private',
        description: 'Your files never leave your device. Everything is processed locally using client-side technology.',
    },
    {
        icon: '🎯',
        iconBg: 'rgba(239, 68, 68, 0.12)',
        title: 'Smart Detection',
        description: 'Upload any file and we automatically detect its type, showing all available conversion options.',
    },
    {
        icon: '📦',
        iconBg: 'rgba(245, 158, 11, 0.12)',
        title: 'Batch Processing',
        description: 'Convert multiple files at once, even with different formats. Mix and match as you please.',
    },
    {
        icon: '🎨',
        iconBg: 'rgba(139, 92, 246, 0.12)',
        title: 'Image Conversions',
        description: 'Convert between JPG, PNG, WebP, GIF, BMP, SVG and more with quality control.',
    },
    {
        icon: '📄',
        iconBg: 'rgba(59, 130, 246, 0.12)',
        title: 'Document Tools',
        description: 'PDF merge, split, text/markdown to PDF, CSV to JSON, and many more document operations.',
    },
];

const supportedFormats = [
    'PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'RTF', 'HTML', 'MD', 'CSV', 'JSON', 'XML',
    'JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'SVG', 'TIFF', 'ICO', 'HEIC', 'AVIF',
    'MP4', 'AVI', 'MOV', 'MKV', 'WebM', 'WMV',
    'MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A',
    'ZIP', 'RAR', '7Z', 'TAR',
    'EPUB', 'MOBI',
];

export default function Features() {
    return (
        <>
            <section className="features-section" aria-label="Features">
                <h2>Why <span className="gradient-text">ConvertFlow</span>?</h2>
                <p className="features-subtitle">
                    The smartest way to convert your files — entirely in your browser
                </p>

                <div className="features-grid">
                    {features.map((feature, i) => (
                        <div key={i} className="feature-card" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="feature-icon" style={{ background: feature.iconBg }}>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="formats-section" aria-label="Supported formats">
                <h3>Supported Formats</h3>
                <div className="formats-grid">
                    {supportedFormats.map(format => (
                        <span key={format} className="format-tag">{format}</span>
                    ))}
                </div>
            </section>
        </>
    );
}
