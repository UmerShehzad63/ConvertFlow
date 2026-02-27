/**
 * File Detection Engine
 * Detects file type based on extension, MIME type, and categorizes files
 */

const EXTENSION_MAP = {
    // Documents
    pdf: { category: 'document', subcategory: 'pdf', label: 'PDF', icon: 'PDF' },
    doc: { category: 'document', subcategory: 'word', label: 'Word Document', icon: 'DOC' },
    docx: { category: 'document', subcategory: 'word', label: 'Word Document', icon: 'DOCX' },
    xls: { category: 'spreadsheet', subcategory: 'excel', label: 'Excel Spreadsheet', icon: 'XLS' },
    xlsx: { category: 'spreadsheet', subcategory: 'excel', label: 'Excel Spreadsheet', icon: 'XLSX' },
    ppt: { category: 'presentation', subcategory: 'powerpoint', label: 'PowerPoint', icon: 'PPT' },
    pptx: { category: 'presentation', subcategory: 'powerpoint', label: 'PowerPoint', icon: 'PPTX' },
    txt: { category: 'document', subcategory: 'text', label: 'Plain Text', icon: 'TXT' },
    rtf: { category: 'document', subcategory: 'richtext', label: 'Rich Text', icon: 'RTF' },
    odt: { category: 'document', subcategory: 'opendocument', label: 'OpenDocument Text', icon: 'ODT' },
    ods: { category: 'spreadsheet', subcategory: 'opendocument', label: 'OpenDocument Spreadsheet', icon: 'ODS' },
    odp: { category: 'presentation', subcategory: 'opendocument', label: 'OpenDocument Presentation', icon: 'ODP' },
    csv: { category: 'spreadsheet', subcategory: 'csv', label: 'CSV', icon: 'CSV' },
    html: { category: 'document', subcategory: 'html', label: 'HTML', icon: 'HTML' },
    htm: { category: 'document', subcategory: 'html', label: 'HTML', icon: 'HTML' },
    md: { category: 'document', subcategory: 'markdown', label: 'Markdown', icon: 'MD' },
    epub: { category: 'ebook', subcategory: 'epub', label: 'ePub', icon: 'EPUB' },
    mobi: { category: 'ebook', subcategory: 'mobi', label: 'MOBI', icon: 'MOBI' },
    json: { category: 'document', subcategory: 'json', label: 'JSON', icon: 'JSON' },
    xml: { category: 'document', subcategory: 'xml', label: 'XML', icon: 'XML' },
    tex: { category: 'document', subcategory: 'latex', label: 'LaTeX', icon: 'TEX' },

    // Images
    jpg: { category: 'image', subcategory: 'jpeg', label: 'JPEG Image', icon: 'JPG' },
    jpeg: { category: 'image', subcategory: 'jpeg', label: 'JPEG Image', icon: 'JPG' },
    png: { category: 'image', subcategory: 'png', label: 'PNG Image', icon: 'PNG' },
    gif: { category: 'image', subcategory: 'gif', label: 'GIF', icon: 'GIF' },
    webp: { category: 'image', subcategory: 'webp', label: 'WebP Image', icon: 'WEBP' },
    bmp: { category: 'image', subcategory: 'bmp', label: 'BMP Image', icon: 'BMP' },
    svg: { category: 'image', subcategory: 'svg', label: 'SVG', icon: 'SVG' },
    tiff: { category: 'image', subcategory: 'tiff', label: 'TIFF Image', icon: 'TIFF' },
    tif: { category: 'image', subcategory: 'tiff', label: 'TIFF Image', icon: 'TIFF' },
    ico: { category: 'image', subcategory: 'ico', label: 'Icon', icon: 'ICO' },
    heic: { category: 'image', subcategory: 'heic', label: 'HEIC Image', icon: 'HEIC' },
    heif: { category: 'image', subcategory: 'heif', label: 'HEIF Image', icon: 'HEIF' },
    avif: { category: 'image', subcategory: 'avif', label: 'AVIF Image', icon: 'AVIF' },

    // Video
    mp4: { category: 'video', subcategory: 'mp4', label: 'MP4 Video', icon: 'MP4' },
    avi: { category: 'video', subcategory: 'avi', label: 'AVI Video', icon: 'AVI' },
    mov: { category: 'video', subcategory: 'mov', label: 'MOV Video', icon: 'MOV' },
    mkv: { category: 'video', subcategory: 'mkv', label: 'MKV Video', icon: 'MKV' },
    webm: { category: 'video', subcategory: 'webm', label: 'WebM Video', icon: 'WEBM' },
    wmv: { category: 'video', subcategory: 'wmv', label: 'WMV Video', icon: 'WMV' },
    flv: { category: 'video', subcategory: 'flv', label: 'FLV Video', icon: 'FLV' },
    '3gp': { category: 'video', subcategory: '3gp', label: '3GP Video', icon: '3GP' },
    mpeg: { category: 'video', subcategory: 'mpeg', label: 'MPEG Video', icon: 'MPEG' },
    mpg: { category: 'video', subcategory: 'mpeg', label: 'MPEG Video', icon: 'MPG' },

    // Audio
    mp3: { category: 'audio', subcategory: 'mp3', label: 'MP3 Audio', icon: 'MP3' },
    wav: { category: 'audio', subcategory: 'wav', label: 'WAV Audio', icon: 'WAV' },
    aac: { category: 'audio', subcategory: 'aac', label: 'AAC Audio', icon: 'AAC' },
    ogg: { category: 'audio', subcategory: 'ogg', label: 'OGG Audio', icon: 'OGG' },
    flac: { category: 'audio', subcategory: 'flac', label: 'FLAC Audio', icon: 'FLAC' },
    wma: { category: 'audio', subcategory: 'wma', label: 'WMA Audio', icon: 'WMA' },
    m4a: { category: 'audio', subcategory: 'm4a', label: 'M4A Audio', icon: 'M4A' },
    aiff: { category: 'audio', subcategory: 'aiff', label: 'AIFF Audio', icon: 'AIFF' },

    // Archives
    zip: { category: 'archive', subcategory: 'zip', label: 'ZIP Archive', icon: 'ZIP' },
    rar: { category: 'archive', subcategory: 'rar', label: 'RAR Archive', icon: 'RAR' },
    '7z': { category: 'archive', subcategory: '7z', label: '7-Zip Archive', icon: '7Z' },
    tar: { category: 'archive', subcategory: 'tar', label: 'TAR Archive', icon: 'TAR' },
    gz: { category: 'archive', subcategory: 'gz', label: 'GZip Archive', icon: 'GZ' },
};

// Conversion options per category/subcategory
const CONVERSION_MAP = {
    // Images - client-side conversions via Canvas API
    image: {
        jpeg: ['png', 'webp', 'bmp', 'gif', 'pdf', 'ico'],
        png: ['jpg', 'webp', 'bmp', 'gif', 'pdf', 'ico'],
        webp: ['jpg', 'png', 'bmp', 'gif', 'pdf'],
        gif: ['jpg', 'png', 'webp', 'bmp', 'pdf'],
        bmp: ['jpg', 'png', 'webp', 'gif', 'pdf'],
        svg: ['png', 'jpg', 'webp', 'pdf'],
        tiff: ['jpg', 'png', 'webp', 'pdf'],
        ico: ['png', 'jpg'],
        heic: ['jpg', 'png', 'webp', 'pdf'],
        heif: ['jpg', 'png', 'webp', 'pdf'],
        avif: ['jpg', 'png', 'webp', 'pdf'],
    },
    // Documents
    document: {
        pdf: ['txt', 'jpg', 'png'],
        word: ['pdf', 'txt', 'html'],
        text: ['pdf', 'html'],
        richtext: ['pdf', 'txt'],
        html: ['pdf', 'txt'],
        markdown: ['pdf', 'html', 'txt'],
        json: ['txt', 'csv'],
        xml: ['txt', 'json'],
        latex: ['pdf', 'txt'],
    },
    // Spreadsheets
    spreadsheet: {
        excel: ['pdf', 'csv', 'json', 'html', 'txt'],
        csv: ['json', 'txt', 'html', 'xlsx'],
        opendocument: ['pdf', 'csv', 'xlsx'],
    },
    // Presentations
    presentation: {
        powerpoint: ['pdf', 'jpg', 'png'],
        opendocument: ['pdf', 'pptx'],
    },
    // Video
    video: {
        mp4: ['webm', 'gif', 'mp3'],
        avi: ['mp4', 'webm', 'gif', 'mp3'],
        mov: ['mp4', 'webm', 'gif', 'mp3'],
        mkv: ['mp4', 'webm', 'gif', 'mp3'],
        webm: ['mp4', 'gif', 'mp3'],
        wmv: ['mp4', 'webm', 'mp3'],
        flv: ['mp4', 'webm', 'mp3'],
        '3gp': ['mp4', 'webm', 'mp3'],
        mpeg: ['mp4', 'webm', 'mp3'],
    },
    // Audio
    audio: {
        mp3: ['wav', 'ogg', 'aac'],
        wav: ['mp3', 'ogg', 'aac'],
        aac: ['mp3', 'wav', 'ogg'],
        ogg: ['mp3', 'wav', 'aac'],
        flac: ['mp3', 'wav', 'ogg'],
        wma: ['mp3', 'wav'],
        m4a: ['mp3', 'wav', 'ogg'],
        aiff: ['mp3', 'wav'],
    },
    // Archives
    archive: {
        zip: ['extract'],
        rar: ['extract'],
        '7z': ['extract'],
        tar: ['extract'],
        gz: ['extract'],
    },
    // eBooks
    ebook: {
        epub: ['pdf', 'txt'],
        mobi: ['pdf', 'txt'],
    },
};

// Operations available per category
const OPERATIONS_MAP = {
    document: {
        pdf: ['compress', 'merge', 'split', 'rotate', 'extract-text', 'extract-images'],
    },
    image: {
        _all: ['compress', 'resize', 'crop', 'rotate', 'grayscale', 'remove-bg'],
    },
    video: {
        _all: ['compress', 'trim', 'extract-audio', 'to-gif'],
    },
    audio: {
        _all: ['compress', 'trim', 'merge'],
    },
};

// Format display names
const FORMAT_DISPLAY = {
    jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF', webp: 'WebP',
    bmp: 'BMP', svg: 'SVG', tiff: 'TIFF', ico: 'ICO', heic: 'HEIC',
    heif: 'HEIF', avif: 'AVIF',
    pdf: 'PDF', doc: 'DOC', docx: 'DOCX', txt: 'TXT', rtf: 'RTF',
    html: 'HTML', md: 'Markdown', csv: 'CSV', json: 'JSON', xml: 'XML',
    xls: 'XLS', xlsx: 'XLSX', ppt: 'PPT', pptx: 'PPTX',
    odt: 'ODT', ods: 'ODS', odp: 'ODP',
    mp4: 'MP4', avi: 'AVI', mov: 'MOV', mkv: 'MKV', webm: 'WebM',
    wmv: 'WMV', flv: 'FLV', mpeg: 'MPEG',
    mp3: 'MP3', wav: 'WAV', aac: 'AAC', ogg: 'OGG', flac: 'FLAC',
    wma: 'WMA', m4a: 'M4A', aiff: 'AIFF',
    zip: 'ZIP', rar: 'RAR', '7z': '7Z', tar: 'TAR', gz: 'GZ',
    epub: 'ePub', mobi: 'MOBI',
    extract: 'Extract Files',
};

/**
 * Detect file type from File object
 */
export function detectFileType(file) {
    const ext = getExtension(file.name);
    const typeInfo = EXTENSION_MAP[ext] || {
        category: 'other',
        subcategory: ext || 'unknown',
        label: ext ? `${ext.toUpperCase()} File` : 'Unknown File',
        icon: ext ? ext.toUpperCase() : '?',
    };

    return {
        ...typeInfo,
        extension: ext,
        mimeType: file.type,
        confidence: EXTENSION_MAP[ext] ? 0.95 : 0.5,
    };
}

/**
 * Get available conversion options for a detected file type
 */
export function getConversionOptions(detectedType) {
    const { category, subcategory } = detectedType;
    const categoryMap = CONVERSION_MAP[category];
    if (!categoryMap) return [];

    const options = categoryMap[subcategory] || [];
    return options.map(format => ({
        format,
        displayName: FORMAT_DISPLAY[format] || format.toUpperCase(),
        isRecommended: isRecommendedConversion(category, subcategory, format),
    }));
}

/**
 * Get available operations for a file type
 */
export function getOperations(detectedType) {
    const { category, subcategory } = detectedType;
    const categoryOps = OPERATIONS_MAP[category];
    if (!categoryOps) return [];

    const ops = categoryOps[subcategory] || categoryOps._all || [];
    return ops.map(op => ({
        id: op,
        label: formatOperationLabel(op),
    }));
}

function isRecommendedConversion(category, subcategory, target) {
    const recommendations = {
        'image.jpeg': ['png', 'webp'],
        'image.png': ['jpg', 'webp'],
        'image.webp': ['jpg', 'png'],
        'image.bmp': ['png', 'jpg'],
        'image.gif': ['mp4', 'webp'],
        'image.svg': ['png'],
        'image.heic': ['jpg'],
        'document.pdf': ['txt', 'jpg'],
        'document.word': ['pdf'],
        'document.text': ['pdf'],
        'document.markdown': ['html', 'pdf'],
        'spreadsheet.excel': ['pdf', 'csv'],
        'spreadsheet.csv': ['json', 'xlsx'],
        'presentation.powerpoint': ['pdf'],
        'video.mp4': ['webm', 'gif'],
        'video.avi': ['mp4'],
        'video.mov': ['mp4'],
        'audio.wav': ['mp3'],
        'audio.flac': ['mp3'],
    };
    const key = `${category}.${subcategory}`;
    return (recommendations[key] || []).includes(target);
}

function formatOperationLabel(op) {
    const labels = {
        'compress': '🗜️ Compress',
        'merge': '🔗 Merge',
        'split': '✂️ Split',
        'rotate': '🔄 Rotate',
        'extract-text': '📝 Extract Text',
        'extract-images': '🖼️ Extract Images',
        'resize': '📐 Resize',
        'crop': '✂️ Crop',
        'grayscale': '⬛ Grayscale',
        'remove-bg': '🎯 Remove BG',
        'trim': '✂️ Trim',
        'extract-audio': '🔊 Extract Audio',
        'to-gif': '🎬 To GIF',
    };
    return labels[op] || op;
}

function getExtension(fileName) {
    const parts = fileName.toLowerCase().split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1];
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function generateId() {
    return Math.random().toString(36).substring(2, 12);
}

export { FORMAT_DISPLAY, EXTENSION_MAP };
