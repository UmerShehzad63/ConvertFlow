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
    tsv: { category: 'spreadsheet', subcategory: 'tsv', label: 'TSV', icon: 'TSV' },
    html: { category: 'document', subcategory: 'html', label: 'HTML', icon: 'HTML' },
    htm: { category: 'document', subcategory: 'html', label: 'HTML', icon: 'HTML' },
    md: { category: 'document', subcategory: 'markdown', label: 'Markdown', icon: 'MD' },
    epub: { category: 'ebook', subcategory: 'epub', label: 'ePub', icon: 'EPUB' },
    mobi: { category: 'ebook', subcategory: 'mobi', label: 'MOBI', icon: 'MOBI' },
    json: { category: 'document', subcategory: 'json', label: 'JSON', icon: 'JSON' },
    xml: { category: 'document', subcategory: 'xml', label: 'XML', icon: 'XML' },
    yaml: { category: 'document', subcategory: 'yaml', label: 'YAML', icon: 'YAML' },
    yml: { category: 'document', subcategory: 'yaml', label: 'YAML', icon: 'YML' },
    tex: { category: 'document', subcategory: 'latex', label: 'LaTeX', icon: 'TEX' },
    log: { category: 'document', subcategory: 'text', label: 'Log File', icon: 'LOG' },
    ini: { category: 'document', subcategory: 'text', label: 'INI Config', icon: 'INI' },
    cfg: { category: 'document', subcategory: 'text', label: 'Config File', icon: 'CFG' },
    toml: { category: 'document', subcategory: 'toml', label: 'TOML', icon: 'TOML' },

    // Code files
    js: { category: 'document', subcategory: 'code', label: 'JavaScript', icon: 'JS' },
    ts: { category: 'document', subcategory: 'code', label: 'TypeScript', icon: 'TS' },
    jsx: { category: 'document', subcategory: 'code', label: 'JSX', icon: 'JSX' },
    tsx: { category: 'document', subcategory: 'code', label: 'TSX', icon: 'TSX' },
    py: { category: 'document', subcategory: 'code', label: 'Python', icon: 'PY' },
    java: { category: 'document', subcategory: 'code', label: 'Java', icon: 'JAVA' },
    c: { category: 'document', subcategory: 'code', label: 'C Source', icon: 'C' },
    cpp: { category: 'document', subcategory: 'code', label: 'C++ Source', icon: 'CPP' },
    cs: { category: 'document', subcategory: 'code', label: 'C# Source', icon: 'CS' },
    go: { category: 'document', subcategory: 'code', label: 'Go Source', icon: 'GO' },
    rs: { category: 'document', subcategory: 'code', label: 'Rust Source', icon: 'RS' },
    rb: { category: 'document', subcategory: 'code', label: 'Ruby', icon: 'RB' },
    php: { category: 'document', subcategory: 'code', label: 'PHP', icon: 'PHP' },
    swift: { category: 'document', subcategory: 'code', label: 'Swift', icon: 'SWIFT' },
    kt: { category: 'document', subcategory: 'code', label: 'Kotlin', icon: 'KT' },
    sql: { category: 'document', subcategory: 'code', label: 'SQL', icon: 'SQL' },
    css: { category: 'document', subcategory: 'code', label: 'CSS', icon: 'CSS' },
    scss: { category: 'document', subcategory: 'code', label: 'SCSS', icon: 'SCSS' },
    less: { category: 'document', subcategory: 'code', label: 'LESS', icon: 'LESS' },
    sh: { category: 'document', subcategory: 'code', label: 'Shell Script', icon: 'SH' },
    bat: { category: 'document', subcategory: 'code', label: 'Batch File', icon: 'BAT' },
    ps1: { category: 'document', subcategory: 'code', label: 'PowerShell', icon: 'PS1' },

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
    raw: { category: 'image', subcategory: 'raw', label: 'RAW Image', icon: 'RAW' },
    psd: { category: 'image', subcategory: 'psd', label: 'Photoshop', icon: 'PSD' },
    ai: { category: 'image', subcategory: 'ai', label: 'Illustrator', icon: 'AI' },

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
    m4v: { category: 'video', subcategory: 'm4v', label: 'M4V Video', icon: 'M4V' },
    ts: { category: 'video', subcategory: 'ts', label: 'TS Video', icon: 'TS' },

    // Audio
    mp3: { category: 'audio', subcategory: 'mp3', label: 'MP3 Audio', icon: 'MP3' },
    wav: { category: 'audio', subcategory: 'wav', label: 'WAV Audio', icon: 'WAV' },
    aac: { category: 'audio', subcategory: 'aac', label: 'AAC Audio', icon: 'AAC' },
    ogg: { category: 'audio', subcategory: 'ogg', label: 'OGG Audio', icon: 'OGG' },
    flac: { category: 'audio', subcategory: 'flac', label: 'FLAC Audio', icon: 'FLAC' },
    wma: { category: 'audio', subcategory: 'wma', label: 'WMA Audio', icon: 'WMA' },
    m4a: { category: 'audio', subcategory: 'm4a', label: 'M4A Audio', icon: 'M4A' },
    aiff: { category: 'audio', subcategory: 'aiff', label: 'AIFF Audio', icon: 'AIFF' },
    opus: { category: 'audio', subcategory: 'opus', label: 'Opus Audio', icon: 'OPUS' },
    midi: { category: 'audio', subcategory: 'midi', label: 'MIDI', icon: 'MIDI' },
    mid: { category: 'audio', subcategory: 'midi', label: 'MIDI', icon: 'MID' },

    // Archives
    zip: { category: 'archive', subcategory: 'zip', label: 'ZIP Archive', icon: 'ZIP' },
    rar: { category: 'archive', subcategory: 'rar', label: 'RAR Archive', icon: 'RAR' },
    '7z': { category: 'archive', subcategory: '7z', label: '7-Zip Archive', icon: '7Z' },
    tar: { category: 'archive', subcategory: 'tar', label: 'TAR Archive', icon: 'TAR' },
    gz: { category: 'archive', subcategory: 'gz', label: 'GZip Archive', icon: 'GZ' },
    bz2: { category: 'archive', subcategory: 'bz2', label: 'BZip2 Archive', icon: 'BZ2' },
    xz: { category: 'archive', subcategory: 'xz', label: 'XZ Archive', icon: 'XZ' },

    // Fonts
    ttf: { category: 'other', subcategory: 'font', label: 'TrueType Font', icon: 'TTF' },
    otf: { category: 'other', subcategory: 'font', label: 'OpenType Font', icon: 'OTF' },
    woff: { category: 'other', subcategory: 'font', label: 'Web Font', icon: 'WOFF' },
    woff2: { category: 'other', subcategory: 'font', label: 'Web Font 2', icon: 'WOFF2' },
};

// ─── Comprehensive Conversion Options ─────────────────────────────
const CONVERSION_MAP = {
    // Images — all formats available via Canvas API + pdf-lib
    image: {
        jpeg: ['png', 'webp', 'gif', 'bmp', 'ico', 'tiff', 'avif', 'pdf', 'svg'],
        png: ['jpg', 'webp', 'gif', 'bmp', 'ico', 'tiff', 'avif', 'pdf', 'svg'],
        webp: ['jpg', 'png', 'gif', 'bmp', 'ico', 'tiff', 'pdf'],
        gif: ['jpg', 'png', 'webp', 'bmp', 'ico', 'tiff', 'pdf'],
        bmp: ['jpg', 'png', 'webp', 'gif', 'ico', 'tiff', 'pdf'],
        svg: ['png', 'jpg', 'webp', 'gif', 'bmp', 'pdf'],
        tiff: ['jpg', 'png', 'webp', 'gif', 'bmp', 'pdf'],
        ico: ['png', 'jpg', 'webp', 'bmp', 'gif'],
        heic: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
        heif: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
        avif: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
        raw: ['jpg', 'png', 'webp', 'tiff', 'pdf'],
        psd: ['jpg', 'png', 'webp', 'pdf'],
        ai: ['png', 'jpg', 'svg', 'pdf'],
    },

    // Documents — maximum cross-format conversion
    document: {
        pdf: ['docx', 'txt', 'html', 'md', 'rtf', 'jpg', 'png', 'csv', 'json', 'xml', 'epub'],
        word: ['pdf', 'txt', 'html', 'md', 'rtf', 'odt', 'epub', 'json', 'csv'],
        text: ['pdf', 'html', 'md', 'docx', 'rtf', 'csv', 'json', 'xml', 'epub'],
        richtext: ['pdf', 'txt', 'html', 'md', 'docx', 'odt'],
        html: ['pdf', 'txt', 'md', 'docx', 'rtf', 'json', 'epub'],
        markdown: ['pdf', 'html', 'txt', 'docx', 'rtf', 'epub'],
        json: ['txt', 'csv', 'xml', 'yaml', 'html', 'md', 'pdf'],
        xml: ['txt', 'json', 'csv', 'yaml', 'html', 'pdf'],
        yaml: ['json', 'xml', 'txt', 'csv', 'html', 'pdf'],
        toml: ['json', 'yaml', 'xml', 'txt'],
        latex: ['pdf', 'txt', 'html', 'md', 'docx'],
        code: ['pdf', 'html', 'txt', 'md', 'rtf'],
        opendocument: ['pdf', 'docx', 'txt', 'html', 'rtf'],
    },

    // Spreadsheets — all data interchange formats
    spreadsheet: {
        excel: ['pdf', 'csv', 'tsv', 'json', 'xml', 'html', 'txt', 'md', 'ods'],
        csv: ['json', 'xml', 'xlsx', 'html', 'txt', 'md', 'pdf', 'tsv', 'yaml'],
        tsv: ['csv', 'json', 'xml', 'xlsx', 'html', 'txt', 'pdf', 'yaml'],
        opendocument: ['pdf', 'csv', 'tsv', 'json', 'xlsx', 'html', 'xml', 'txt'],
    },

    // Presentations
    presentation: {
        powerpoint: ['pdf', 'jpg', 'png', 'html', 'txt', 'pptx', 'odp'],
        opendocument: ['pdf', 'pptx', 'jpg', 'png', 'html', 'txt'],
    },

    // Video — all cross-format conversions
    video: {
        mp4: ['webm', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav', 'flv', 'wmv', '3gp'],
        avi: ['mp4', 'webm', 'mov', 'mkv', 'gif', 'mp3', 'wav', 'flv', 'wmv'],
        mov: ['mp4', 'webm', 'avi', 'mkv', 'gif', 'mp3', 'wav', 'flv', 'wmv'],
        mkv: ['mp4', 'webm', 'avi', 'mov', 'gif', 'mp3', 'wav', 'flv', 'wmv'],
        webm: ['mp4', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav', 'flv'],
        wmv: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav'],
        flv: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav'],
        '3gp': ['mp4', 'webm', 'avi', 'mov', 'gif', 'mp3', 'wav'],
        mpeg: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav'],
        m4v: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'mp3', 'wav'],
        ts: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'mp3', 'wav'],
    },

    // Audio — all cross-format conversions
    audio: {
        mp3: ['wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'aiff', 'opus'],
        wav: ['mp3', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'aiff', 'opus'],
        aac: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'wma', 'aiff', 'opus'],
        ogg: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'wma', 'aiff', 'opus'],
        flac: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'wma', 'aiff', 'opus'],
        wma: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'aiff'],
        m4a: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'aiff', 'opus'],
        aiff: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'],
        opus: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
        midi: ['mp3', 'wav'],
    },

    // Archives
    archive: {
        zip: ['tar', '7z', 'gz', 'extract'],
        rar: ['zip', 'tar', '7z', 'extract'],
        '7z': ['zip', 'tar', 'gz', 'extract'],
        tar: ['zip', '7z', 'gz', 'extract'],
        gz: ['zip', 'tar', '7z', 'extract'],
        bz2: ['zip', 'tar', 'gz', 'extract'],
        xz: ['zip', 'tar', 'gz', 'extract'],
    },

    // eBooks — cross-format conversions
    ebook: {
        epub: ['pdf', 'txt', 'html', 'md', 'docx', 'mobi'],
        mobi: ['pdf', 'txt', 'html', 'md', 'docx', 'epub'],
    },

    // Other
    other: {
        font: ['ttf', 'otf', 'woff', 'woff2'],
    },
};

// Operations available per category
const OPERATIONS_MAP = {
    document: {
        pdf: ['compress', 'merge', 'split', 'rotate', 'extract-text', 'extract-images', 'watermark', 'password'],
        word: ['extract-text', 'word-count'],
        _all: ['extract-text'],
    },
    image: {
        _all: ['compress', 'resize', 'crop', 'rotate', 'grayscale', 'remove-bg', 'flip', 'invert'],
    },
    video: {
        _all: ['compress', 'trim', 'extract-audio', 'to-gif', 'thumbnail', 'mute'],
    },
    audio: {
        _all: ['compress', 'trim', 'merge', 'normalize', 'fade'],
    },
    spreadsheet: {
        _all: ['sort', 'filter', 'deduplicate'],
    },
};

// Format display names
const FORMAT_DISPLAY = {
    jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF', webp: 'WebP',
    bmp: 'BMP', svg: 'SVG', tiff: 'TIFF', ico: 'ICO', heic: 'HEIC',
    heif: 'HEIF', avif: 'AVIF', raw: 'RAW', psd: 'PSD', ai: 'AI',
    pdf: 'PDF', doc: 'DOC', docx: 'Word', txt: 'TXT', rtf: 'RTF',
    html: 'HTML', md: 'Markdown', csv: 'CSV', tsv: 'TSV',
    json: 'JSON', xml: 'XML', yaml: 'YAML', toml: 'TOML',
    xls: 'XLS', xlsx: 'Excel', ppt: 'PPT', pptx: 'PPTX',
    odt: 'ODT', ods: 'ODS', odp: 'ODP',
    epub: 'ePub', mobi: 'MOBI',
    mp4: 'MP4', avi: 'AVI', mov: 'MOV', mkv: 'MKV', webm: 'WebM',
    wmv: 'WMV', flv: 'FLV', mpeg: 'MPEG', m4v: 'M4V', '3gp': '3GP',
    mp3: 'MP3', wav: 'WAV', aac: 'AAC', ogg: 'OGG', flac: 'FLAC',
    wma: 'WMA', m4a: 'M4A', aiff: 'AIFF', opus: 'Opus', midi: 'MIDI',
    zip: 'ZIP', rar: 'RAR', '7z': '7Z', tar: 'TAR', gz: 'GZ', bz2: 'BZ2', xz: 'XZ',
    ttf: 'TTF', otf: 'OTF', woff: 'WOFF', woff2: 'WOFF2',
    extract: 'Extract Files',
    js: 'JS', ts: 'TS', py: 'Python', java: 'Java', c: 'C', cpp: 'C++',
    cs: 'C#', go: 'Go', rs: 'Rust', rb: 'Ruby', php: 'PHP',
    swift: 'Swift', kt: 'Kotlin', sql: 'SQL',
    css: 'CSS', scss: 'SCSS', less: 'LESS',
    sh: 'Shell', bat: 'Batch', ps1: 'PowerShell',
    log: 'LOG', ini: 'INI', cfg: 'Config',
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
        'image.heif': ['jpg'],
        'image.avif': ['jpg', 'png'],
        'image.tiff': ['jpg', 'png'],
        'image.raw': ['jpg', 'png'],
        'image.psd': ['png', 'jpg'],
        'document.pdf': ['docx', 'txt', 'jpg'],
        'document.word': ['pdf', 'txt', 'html'],
        'document.text': ['pdf', 'html', 'docx'],
        'document.richtext': ['pdf', 'docx'],
        'document.html': ['pdf', 'txt', 'md'],
        'document.markdown': ['html', 'pdf'],
        'document.json': ['csv', 'xml', 'yaml'],
        'document.xml': ['json', 'csv'],
        'document.yaml': ['json', 'xml'],
        'document.toml': ['json', 'yaml'],
        'document.latex': ['pdf', 'html'],
        'document.code': ['pdf', 'html'],
        'spreadsheet.excel': ['pdf', 'csv', 'json'],
        'spreadsheet.csv': ['json', 'xlsx', 'xml'],
        'spreadsheet.tsv': ['csv', 'json', 'xlsx'],
        'presentation.powerpoint': ['pdf', 'jpg'],
        'video.mp4': ['webm', 'gif', 'mp3'],
        'video.avi': ['mp4', 'webm'],
        'video.mov': ['mp4', 'webm'],
        'video.mkv': ['mp4', 'webm'],
        'video.webm': ['mp4', 'gif'],
        'video.wmv': ['mp4', 'webm'],
        'video.flv': ['mp4', 'webm'],
        'audio.mp3': ['wav', 'ogg', 'flac'],
        'audio.wav': ['mp3', 'flac'],
        'audio.aac': ['mp3', 'wav'],
        'audio.ogg': ['mp3', 'wav'],
        'audio.flac': ['mp3', 'wav'],
        'audio.wma': ['mp3', 'wav'],
        'audio.m4a': ['mp3', 'wav'],
        'audio.aiff': ['mp3', 'wav'],
        'audio.opus': ['mp3', 'wav'],
        'ebook.epub': ['pdf', 'txt'],
        'ebook.mobi': ['pdf', 'epub'],
        'archive.zip': ['tar', 'extract'],
        'archive.rar': ['zip', 'extract'],
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
        'flip': '🔃 Flip',
        'invert': '🔲 Invert',
        'trim': '✂️ Trim',
        'extract-audio': '🔊 Extract Audio',
        'to-gif': '🎬 To GIF',
        'thumbnail': '📸 Thumbnail',
        'mute': '🔇 Mute',
        'watermark': '💧 Watermark',
        'password': '🔒 Password',
        'word-count': '🔢 Word Count',
        'sort': '↕️ Sort',
        'filter': '🔍 Filter',
        'deduplicate': '🧹 Deduplicate',
        'normalize': '📊 Normalize',
        'fade': '🎵 Fade',
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
