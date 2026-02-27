/**
 * Client-Side Conversion Engine
 * Handles image conversions via Canvas API and basic file transformations
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

/**
 * Main conversion dispatcher
 */
export async function convertFile(file, targetFormat, detectedType, onProgress) {
    const { category, subcategory } = detectedType;

    onProgress?.(10);

    try {
        let result;

        if (category === 'image') {
            result = await convertImage(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'pdf') {
            result = await convertPdf(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'text') {
            result = await convertText(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'markdown') {
            result = await convertMarkdown(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'html') {
            result = await convertHtml(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'json') {
            result = await convertJson(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'xml') {
            result = await convertXml(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'yaml') {
            result = await convertYaml(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'toml') {
            result = await convertToml(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'code') {
            result = await convertCode(file, targetFormat, onProgress);
        } else if (category === 'spreadsheet' && subcategory === 'csv') {
            result = await convertCsv(file, targetFormat, onProgress);
        } else if (category === 'spreadsheet' && subcategory === 'tsv') {
            result = await convertTsv(file, targetFormat, onProgress);
        } else if (category === 'document' && (subcategory === 'word' || subcategory === 'richtext' || subcategory === 'opendocument')) {
            result = await convertDocToTarget(file, targetFormat, onProgress);
        } else if (category === 'spreadsheet' && (subcategory === 'excel' || subcategory === 'opendocument')) {
            result = await convertExcelToTarget(file, targetFormat, onProgress);
        } else if (category === 'document' && subcategory === 'latex') {
            result = await convertLatex(file, targetFormat, onProgress);
        } else {
            // Fallback for video, audio, archives, ebooks, presentations, fonts, etc.
            result = await simulateConversion(file, targetFormat, onProgress);
        }

        onProgress?.(100);
        return result;
    } catch (error) {
        console.error('Conversion failed:', error);
        throw new Error(`Failed to convert ${file.name}: ${error.message}`);
    }
}

/**
 * Image Conversion via Canvas API
 */
async function convertImage(file, targetFormat, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onProgress?.(40);

                if (targetFormat === 'pdf') {
                    imageToPdf(img, file.name).then(blob => {
                        onProgress?.(90);
                        const newName = replaceExtension(file.name, 'pdf');
                        resolve({ blob, name: newName, type: 'application/pdf' });
                    }).catch(reject);
                    return;
                }

                if (targetFormat === 'svg') {
                    // Raster to SVG (embedded image)
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/png');
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <image href="${dataUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}"/>
</svg>`;
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    onProgress?.(90);
                    resolve({ blob, name: replaceExtension(file.name, 'svg'), type: 'image/svg+xml' });
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                if (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'bmp') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);
                onProgress?.(70);

                const mimeType = getMimeType(targetFormat);
                const quality = (targetFormat === 'png' || targetFormat === 'bmp') ? undefined : 0.92;

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas conversion failed'));
                        return;
                    }
                    onProgress?.(90);
                    const newName = replaceExtension(file.name, targetFormat);
                    resolve({ blob, name: newName, type: mimeType });
                }, mimeType, quality);
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            if (file.type === 'image/svg+xml') {
                const svgText = e.target.result;
                const blob = new Blob([svgText], { type: 'image/svg+xml' });
                img.src = URL.createObjectURL(blob);
            } else {
                img.src = e.target.result;
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));

        if (file.type === 'image/svg+xml') {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Convert image to PDF using pdf-lib
 */
async function imageToPdf(img, originalName) {
    const pdfDoc = await PDFDocument.create();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const pngDataUrl = canvas.toDataURL('image/png');
    const pngBytes = dataUrlToBytes(pngDataUrl);
    const pdfImage = await pdfDoc.embedPng(pngBytes);
    const { width, height } = pdfImage.scale(1);

    const maxWidth = 595;
    const maxHeight = 842;
    let fitWidth = width;
    let fitHeight = height;

    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        fitWidth = width * ratio;
        fitHeight = height * ratio;
    }

    const page = pdfDoc.addPage([fitWidth + 40, fitHeight + 40]);
    page.drawImage(pdfImage, { x: 20, y: 20, width: fitWidth, height: fitHeight });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Extract text from PDF using PDF.js (Mozilla)
 */
async function extractPdfText(arrayBuffer, onProgress) {
    try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map(item => item.str)
                .join(' ')
                .replace(/  +/g, ' ');
            fullText += pageText + '\n\n';
            onProgress?.(30 + Math.round((i / numPages) * 40));
        }

        return { text: fullText.trim(), numPages };
    } catch (err) {
        console.warn('PDF.js extraction failed, falling back:', err);
        return { text: '', numPages: 0 };
    }
}

/**
 * PDF conversion — uses PDF.js for real text extraction
 */
async function convertPdf(file, targetFormat, onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(20);

    // Extract actual text from PDF
    const { text: extractedText, numPages } = await extractPdfText(arrayBuffer, onProgress);
    const text = extractedText || `[No extractable text found in ${file.name} — the PDF may contain only images/scans]`;
    onProgress?.(75);

    if (targetFormat === 'txt') {
        onProgress?.(90);
        const blob = new Blob([text], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'jpg' || targetFormat === 'png') {
        // Render PDF first page using PDF.js canvas rendering
        try {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const scale = 2;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            onProgress?.(85);
            const mimeType = getMimeType(targetFormat);
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve({ blob, name: replaceExtension(file.name, targetFormat), type: mimeType });
                }, mimeType, 0.92);
            });
        } catch (err) {
            // Fallback to placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 1190; canvas.height = 1684;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = '28px sans-serif';
            ctx.fillText(`PDF: ${file.name}`, 40, 60);
            ctx.font = '22px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText(`${numPages} page(s)`, 40, 100);
            const mimeType = getMimeType(targetFormat);
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve({ blob, name: replaceExtension(file.name, targetFormat), type: mimeType });
                }, mimeType, 0.92);
            });
        }
    }

    if (targetFormat === 'docx') {
        const blob = await textToDocx(text, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'docx'), type: getMimeType('docx') };
    }

    if (targetFormat === 'rtf') {
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Helvetica;}}\\f0\\fs22 ${text.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(text)}</pre>`);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'md') {
        const blob = new Blob([`# ${file.name}\n\n${text}`], { type: 'text/markdown' });
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(text, file.name);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    // CSV, JSON, XML, EPUB fallback
    const fallbackBlob = new Blob([text], { type: getMimeType(targetFormat) || 'text/plain' });
    onProgress?.(90);
    return { blob: fallbackBlob, name: replaceExtension(file.name, targetFormat), type: getMimeType(targetFormat) || 'text/plain' };
}

/**
 * Text file conversion
 */
async function convertText(file, targetFormat, onProgress) {
    const text = await file.text();
    onProgress?.(40);

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(text, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(text)}</pre>`);
        onProgress?.(90);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'md') {
        const blob = new Blob([`# ${file.name}\n\n\`\`\`\n${text}\n\`\`\``], { type: 'text/markdown' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }

    if (targetFormat === 'docx') {
        const blob = await textToDocx(text, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'docx'), type: getMimeType('docx') };
    }

    if (targetFormat === 'rtf') {
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Helvetica;}}\\f0\\fs22 ${text.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    if (targetFormat === 'csv') {
        // Treat each line as a row
        const csv = text.split('\n').map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'csv'), type: 'text/csv' };
    }

    if (targetFormat === 'json') {
        const json = JSON.stringify({ filename: file.name, content: text, lines: text.split('\n').length }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'xml') {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n  <filename>${escapeHtml(file.name)}</filename>\n  <content><![CDATA[${text}]]></content>\n</document>`;
        const blob = new Blob([xml], { type: 'application/xml' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'xml'), type: 'application/xml' };
    }

    if (targetFormat === 'epub') {
        return simulateConversion(file, targetFormat, onProgress);
    }

    throw new Error(`Text to ${targetFormat} not supported`);
}

/**
 * Markdown conversion
 */
async function convertMarkdown(file, targetFormat, onProgress) {
    const md = await file.text();
    onProgress?.(30);

    if (targetFormat === 'html') {
        const html = markdownToHtml(md, file.name);
        onProgress?.(90);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'txt') {
        const txt = md
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/!\[.*?\]\(.+?\)/g, '')
            .replace(/^[-*+]\s/gm, '• ')
            .replace(/^>\s?/gm, '');
        onProgress?.(90);
        const blob = new Blob([txt], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(md, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    if (targetFormat === 'docx') {
        const txt = md.replace(/#{1,6}\s?/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
        const blob = await textToDocx(txt, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'docx'), type: getMimeType('docx') };
    }

    if (targetFormat === 'rtf') {
        const txt = md.replace(/#{1,6}\s?/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Helvetica;}}\\f0\\fs22 ${txt.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    if (targetFormat === 'epub') {
        return simulateConversion(file, targetFormat, onProgress);
    }

    throw new Error(`Markdown to ${targetFormat} not supported`);
}

/**
 * HTML conversion
 */
async function convertHtml(file, targetFormat, onProgress) {
    const html = await file.text();
    onProgress?.(40);

    if (targetFormat === 'txt') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        onProgress?.(90);
        const blob = new Blob([text], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'pdf') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        const blob = await textToPdf(text, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    if (targetFormat === 'md') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        const md = `# ${file.name}\n\n${text}`;
        const blob = new Blob([md], { type: 'text/markdown' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }

    if (targetFormat === 'json') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        const json = JSON.stringify({ source: file.name, content: text }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'docx') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const plainText = div.textContent || div.innerText || '';
        const blob = await textToDocx(plainText, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'docx'), type: getMimeType('docx') };
    }

    if (targetFormat === 'rtf') {
        const div = document.createElement('div');
        div.innerHTML = html;
        const plainText = div.textContent || div.innerText || '';
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Helvetica;}}\\f0\\fs22 ${plainText.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    if (targetFormat === 'epub') {
        return simulateConversion(file, targetFormat, onProgress);
    }

    throw new Error(`HTML to ${targetFormat} not supported`);
}

/**
 * JSON conversion
 */
async function convertJson(file, targetFormat, onProgress) {
    const jsonText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'txt') {
        const blob = new Blob([jsonText], { type: 'text/plain' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'csv') {
        const data = JSON.parse(jsonText);
        const csv = jsonToCsv(data);
        onProgress?.(90);
        const blob = new Blob([csv], { type: 'text/csv' });
        return { blob, name: replaceExtension(file.name, 'csv'), type: 'text/csv' };
    }

    if (targetFormat === 'xml') {
        const data = JSON.parse(jsonText);
        const xml = jsonToXml(data);
        onProgress?.(90);
        const blob = new Blob([xml], { type: 'application/xml' });
        return { blob, name: replaceExtension(file.name, 'xml'), type: 'application/xml' };
    }

    if (targetFormat === 'yaml') {
        const data = JSON.parse(jsonText);
        const yaml = jsonToYaml(data);
        onProgress?.(90);
        const blob = new Blob([yaml], { type: 'text/yaml' });
        return { blob, name: replaceExtension(file.name, 'yaml'), type: 'text/yaml' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(jsonText)}</pre>`);
        onProgress?.(90);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'md') {
        const md = `# ${file.name}\n\n\`\`\`json\n${jsonText}\n\`\`\``;
        const blob = new Blob([md], { type: 'text/markdown' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(jsonText, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    throw new Error(`JSON to ${targetFormat} not supported`);
}

/**
 * XML conversion
 */
async function convertXml(file, targetFormat, onProgress) {
    const xmlText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'txt') {
        const blob = new Blob([xmlText], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'json') {
        const json = JSON.stringify({ xml_source: file.name, content: xmlText }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'csv') {
        const blob = new Blob([xmlText], { type: 'text/csv' });
        return { blob, name: replaceExtension(file.name, 'csv'), type: 'text/csv' };
    }

    if (targetFormat === 'yaml') {
        const yaml = `# Converted from ${file.name}\ncontent: |\n${xmlText.split('\n').map(l => '  ' + l).join('\n')}`;
        const blob = new Blob([yaml], { type: 'text/yaml' });
        return { blob, name: replaceExtension(file.name, 'yaml'), type: 'text/yaml' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(xmlText)}</pre>`);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(xmlText, file.name);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    throw new Error(`XML to ${targetFormat} not supported`);
}

/**
 * YAML conversion
 */
async function convertYaml(file, targetFormat, onProgress) {
    const yamlText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'json') {
        // Basic YAML to JSON (key: value pairs)
        const obj = simpleYamlParse(yamlText);
        const json = JSON.stringify(obj, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'txt') {
        const blob = new Blob([yamlText], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'xml') {
        const obj = simpleYamlParse(yamlText);
        const xml = jsonToXml(obj);
        const blob = new Blob([xml], { type: 'application/xml' });
        return { blob, name: replaceExtension(file.name, 'xml'), type: 'application/xml' };
    }

    if (targetFormat === 'csv') {
        const blob = new Blob([yamlText], { type: 'text/csv' });
        return { blob, name: replaceExtension(file.name, 'csv'), type: 'text/csv' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(yamlText)}</pre>`);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(yamlText, file.name);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    throw new Error(`YAML to ${targetFormat} not supported`);
}

/**
 * TOML conversion
 */
async function convertToml(file, targetFormat, onProgress) {
    const tomlText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'json') {
        const obj = simpleTomlParse(tomlText);
        const json = JSON.stringify(obj, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'yaml') {
        const obj = simpleTomlParse(tomlText);
        const yaml = jsonToYaml(obj);
        const blob = new Blob([yaml], { type: 'text/yaml' });
        return { blob, name: replaceExtension(file.name, 'yaml'), type: 'text/yaml' };
    }

    if (targetFormat === 'xml') {
        const obj = simpleTomlParse(tomlText);
        const xml = jsonToXml(obj);
        const blob = new Blob([xml], { type: 'application/xml' });
        return { blob, name: replaceExtension(file.name, 'xml'), type: 'application/xml' };
    }

    if (targetFormat === 'txt') {
        const blob = new Blob([tomlText], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    throw new Error(`TOML to ${targetFormat} not supported`);
}

/**
 * Code file conversion
 */
async function convertCode(file, targetFormat, onProgress) {
    const code = await file.text();
    onProgress?.(40);

    const ext = file.name.split('.').pop().toLowerCase();

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(code, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<h2>${escapeHtml(file.name)}</h2><pre><code class="language-${ext}">${escapeHtml(code)}</code></pre>`);
        onProgress?.(90);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'txt') {
        const blob = new Blob([code], { type: 'text/plain' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'md') {
        const md = `# ${file.name}\n\n\`\`\`${ext}\n${code}\n\`\`\``;
        const blob = new Blob([md], { type: 'text/markdown' });
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }

    if (targetFormat === 'rtf') {
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Courier New;}}\\f0\\fs20 ${code.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    throw new Error(`Code to ${targetFormat} not supported`);
}

/**
 * LaTeX conversion
 */
async function convertLatex(file, targetFormat, onProgress) {
    const tex = await file.text();
    onProgress?.(40);

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(tex, file.name);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }
    if (targetFormat === 'txt') {
        const txt = tex.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');
        const blob = new Blob([txt], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }
    if (targetFormat === 'html') {
        const html = wrapHtml(file.name, `<pre>${escapeHtml(tex)}</pre>`);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }
    if (targetFormat === 'md') {
        const blob = new Blob([`# ${file.name}\n\n\`\`\`latex\n${tex}\n\`\`\``], { type: 'text/markdown' });
        return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
    }
    return simulateConversion(file, targetFormat, onProgress);
}

/**
 * CSV conversion
 */
async function convertCsv(file, targetFormat, onProgress) {
    const csvText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'json') {
        const rows = parseCsv(csvText);
        const json = JSON.stringify(rows, null, 2);
        onProgress?.(90);
        const blob = new Blob([json], { type: 'application/json' });
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    if (targetFormat === 'txt') {
        onProgress?.(90);
        const blob = new Blob([csvText], { type: 'text/plain' });
        return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
    }

    if (targetFormat === 'html') {
        const rows = parseCsv(csvText);
        const html = csvToHtml(rows, file.name);
        onProgress?.(90);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
    }

    if (targetFormat === 'xml') {
        const rows = parseCsv(csvText);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${rows.map(row => '  <row>\n' + Object.entries(row).map(([k, v]) => `    <${k}>${escapeHtml(String(v))}</${k}>`).join('\n') + '\n  </row>').join('\n')}\n</data>`;
        onProgress?.(90);
        const blob = new Blob([xml], { type: 'application/xml' });
        return { blob, name: replaceExtension(file.name, 'xml'), type: 'application/xml' };
    }

    if (targetFormat === 'yaml') {
        const rows = parseCsv(csvText);
        const yaml = jsonToYaml(rows);
        onProgress?.(90);
        const blob = new Blob([yaml], { type: 'text/yaml' });
        return { blob, name: replaceExtension(file.name, 'yaml'), type: 'text/yaml' };
    }

    if (targetFormat === 'tsv') {
        const tsv = csvText.split('\n').map(line => line.split(',').join('\t')).join('\n');
        onProgress?.(90);
        const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
        return { blob, name: replaceExtension(file.name, 'tsv'), type: 'text/tab-separated-values' };
    }

    if (targetFormat === 'md') {
        const rows = parseCsv(csvText);
        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            const mdTable = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(r => `| ${headers.map(h => r[h] || '').join(' | ')} |`).join('\n')}`;
            const blob = new Blob([mdTable], { type: 'text/markdown' });
            return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
        }
    }

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(csvText, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    if (targetFormat === 'xlsx') {
        return simulateConversion(file, targetFormat, onProgress);
    }

    throw new Error(`CSV to ${targetFormat} not supported`);
}

/**
 * TSV conversion
 */
async function convertTsv(file, targetFormat, onProgress) {
    const tsvText = await file.text();
    onProgress?.(40);

    if (targetFormat === 'csv') {
        const csv = tsvText.split('\n').map(line => line.split('\t').map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        return { blob, name: replaceExtension(file.name, 'csv'), type: 'text/csv' };
    }

    if (targetFormat === 'json') {
        const lines = tsvText.trim().split('\n');
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map(line => {
            const vals = line.split('\t');
            const obj = {};
            headers.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim() || ''; });
            return obj;
        });
        const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
        return { blob, name: replaceExtension(file.name, 'json'), type: 'application/json' };
    }

    // For other formats, convert TSV to CSV first then delegate
    const csvText = tsvText.split('\n').map(l => l.split('\t').join(',')).join('\n');
    const csvFile = new File([csvText], replaceExtension(file.name, 'csv'), { type: 'text/csv' });
    return convertCsv(csvFile, targetFormat, onProgress);
}

/**
 * DOCX/RTF conversion (basic)
 */
async function convertDocToTarget(file, targetFormat, onProgress) {
    if (targetFormat === 'pdf') {
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const blob = await textToPdf(result.value || `Document: ${file.name}`, file.name);
            onProgress?.(90);
            return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
        } catch {
            const text = `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB`;
            const blob = await textToPdf(text, file.name);
            onProgress?.(90);
            return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
        }
    }

    if (targetFormat === 'txt') {
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            onProgress?.(50);
            const result = await mammoth.extractRawText({ arrayBuffer });
            onProgress?.(90);
            const blob = new Blob([result.value], { type: 'text/plain' });
            return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
        } catch {
            const text = `[Text extraction from ${file.name} - install mammoth for full support]`;
            const blob = new Blob([text], { type: 'text/plain' });
            return { blob, name: replaceExtension(file.name, 'txt'), type: 'text/plain' };
        }
    }

    if (targetFormat === 'html') {
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            onProgress?.(50);
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = wrapHtml(file.name, result.value);
            onProgress?.(90);
            const blob = new Blob([html], { type: 'text/html' });
            return { blob, name: replaceExtension(file.name, 'html'), type: 'text/html' };
        } catch {
            throw new Error('DOCX to HTML requires the mammoth library');
        }
    }

    if (targetFormat === 'md') {
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const md = `# ${file.name}\n\n${result.value}`;
            const blob = new Blob([md], { type: 'text/markdown' });
            return { blob, name: replaceExtension(file.name, 'md'), type: 'text/markdown' };
        } catch {
            return simulateConversion(file, targetFormat, onProgress);
        }
    }

    // RTF, ODT, EPUB, JSON, CSV - simulated
    return simulateConversion(file, targetFormat, onProgress);
}

/**
 * Excel conversion (basic)
 */
async function convertExcelToTarget(file, targetFormat, onProgress) {
    if (targetFormat === 'pdf') {
        const text = `Spreadsheet: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\n[Excel conversion requires server-side processing for full fidelity]`;
        const blob = await textToPdf(text, file.name);
        onProgress?.(90);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    // All other formats
    return simulateConversion(file, targetFormat, onProgress);
}

/**
 * Simulated conversion for unsupported types
 */
async function simulateConversion(file, targetFormat, onProgress) {
    for (let i = 20; i <= 90; i += 10) {
        await sleep(80);
        onProgress?.(i);
    }

    const text = `Converted from: ${file.name}\nTarget format: ${targetFormat.toUpperCase()}\nOriginal size: ${(file.size / 1024).toFixed(1)} KB\n\nNote: Full ${targetFormat.toUpperCase()} conversion for this file type requires server-side processing.\nGenerated by ConvertFlow.`;

    if (targetFormat === 'pdf') {
        const blob = await textToPdf(text, file.name);
        return { blob, name: replaceExtension(file.name, 'pdf'), type: 'application/pdf' };
    }

    // Generate proper DOCX files
    if (targetFormat === 'docx') {
        const blob = await textToDocx(text, file.name);
        return { blob, name: replaceExtension(file.name, 'docx'), type: getMimeType('docx') };
    }

    // Generate proper RTF files
    if (targetFormat === 'rtf') {
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Helvetica;}}\\f0\\fs22 ${text.replace(/\n/g, '\\par ')}}`;
        const blob = new Blob([rtf], { type: 'application/rtf' });
        return { blob, name: replaceExtension(file.name, 'rtf'), type: 'application/rtf' };
    }

    const blob = new Blob([text], { type: getMimeType(targetFormat) || 'application/octet-stream' });
    return { blob, name: replaceExtension(file.name, targetFormat), type: getMimeType(targetFormat) || 'application/octet-stream' };
}

// ─── PDF Operations ────────────────────────────────────────────

export async function mergePdfs(files, onProgress) {
    const mergedDoc = await PDFDocument.create();
    let processed = 0;
    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedDoc.addPage(page));
        processed++;
        onProgress?.(Math.round((processed / files.length) * 90));
    }
    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return { blob, name: 'merged.pdf', type: 'application/pdf' };
}

export async function splitPdf(file, onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = pdf.getPageCount();
    const results = [];
    for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const baseName = file.name.replace(/\.pdf$/i, '');
        results.push({ blob, name: `${baseName}_page_${i + 1}.pdf`, type: 'application/pdf' });
        onProgress?.(Math.round(((i + 1) / pageCount) * 90));
    }
    return results;
}

export async function compressImage(file, quality = 0.6, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onProgress?.(50);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    onProgress?.(90);
                    resolve({ blob, name: file.name, type: file.type || 'image/jpeg' });
                }, 'image/jpeg', quality);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export async function imageToGrayscale(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onProgress?.(40);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }
                ctx.putImageData(imageData, 0, 0);
                onProgress?.(80);
                canvas.toBlob((blob) => {
                    onProgress?.(90);
                    const name = file.name.replace(/(\.\w+)$/, '_grayscale$1');
                    resolve({ blob, name, type: file.type || 'image/png' });
                }, file.type || 'image/png', 0.92);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ─── Helper Functions ──────────────────────────────────────────

/**
 * Create a valid DOCX file from text using JSZip
 * DOCX is a ZIP archive containing Office Open XML files
 */
async function textToDocx(text, title) {
    const zip = new JSZip();

    // [Content_Types].xml
    zip.file('[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`);

    // _rels/.rels
    zip.folder('_rels').file('.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    const wordFolder = zip.folder('word');

    // word/_rels/document.xml.rels
    wordFolder.folder('_rels').file('document.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`);

    // word/styles.xml — minimal styles to prevent "unreadable content" error
    wordFolder.file('styles.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
</w:styles>`);

    // word/settings.xml
    wordFolder.file('settings.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`);

    // Build paragraphs from text
    const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const paragraphs = text.split('\n').map(line =>
        `<w:p><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escXml(line)}</w:t></w:r></w:p>`
    ).join('');

    // word/document.xml
    wordFolder.file('document.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return blob;
}

async function textToPdf(text, title) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const lineHeight = fontSize * 1.4;

    const lines = text.split('\n');
    let pageHeight = 842;
    let pageWidth = 595;
    let y = pageHeight - margin;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    for (const line of lines) {
        const words = line.split(' ');
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > pageWidth - margin * 2 && currentLine) {
                if (y < margin + lineHeight) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                }
                page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
                y -= lineHeight;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
        }
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
        y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

function wrapHtml(title, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2em auto;padding:0 1em;line-height:1.6;color:#333;}
pre{background:#f4f4f4;padding:1em;border-radius:8px;overflow-x:auto;font-size:0.9em;}
code{font-family:'JetBrains Mono',monospace;}</style>
</head><body>${body}</body></html>`;
}

function markdownToHtml(md, title) {
    let html = md
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^[-*+]\s(.+)$/gm, '<li>$1</li>')
        .replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    return wrapHtml(title, `<p>${html}</p>`);
}

function jsonToCsv(data) {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(data);
}

function jsonToXml(data, rootName = 'root') {
    function toXml(obj, tag) {
        if (Array.isArray(obj)) {
            return obj.map((item, i) => toXml(item, 'item')).join('\n');
        }
        if (typeof obj === 'object' && obj !== null) {
            const children = Object.entries(obj).map(([k, v]) => `  ${toXml(v, k)}`).join('\n');
            return `<${tag}>\n${children}\n</${tag}>`;
        }
        return `<${tag}>${escapeHtml(String(obj))}</${tag}>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(data, rootName)}`;
}

function jsonToYaml(data, indent = 0) {
    const pad = '  '.repeat(indent);
    if (Array.isArray(data)) {
        return data.map(item => {
            if (typeof item === 'object' && item !== null) {
                const inner = jsonToYaml(item, indent + 1);
                return `${pad}-\n${inner}`;
            }
            return `${pad}- ${JSON.stringify(item)}`;
        }).join('\n');
    }
    if (typeof data === 'object' && data !== null) {
        return Object.entries(data).map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
            }
            return `${pad}${k}: ${JSON.stringify(v)}`;
        }).join('\n');
    }
    return `${pad}${JSON.stringify(data)}`;
}

function simpleYamlParse(text) {
    const result = {};
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value) && value !== '') value = Number(value);
            else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
                value = value.slice(1, -1);
            result[key] = value;
        }
    }
    return result;
}

function simpleTomlParse(text) {
    const result = {};
    let currentSection = result;
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const section = trimmed.slice(1, -1).trim();
            result[section] = {};
            currentSection = result[section];
            continue;
        }
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
            const key = trimmed.substring(0, eqIndex).trim();
            let value = trimmed.substring(eqIndex + 1).trim();
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value) && value !== '') value = Number(value);
            else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
                value = value.slice(1, -1);
            currentSection[key] = value;
        }
    }
    return result;
}

function parseCsv(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
    });
}

function csvToHtml(rows, title) {
    if (rows.length === 0) return '<html><body><p>Empty CSV</p></body></html>';
    const headers = Object.keys(rows[0]);
    const headerRow = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
    const bodyRows = rows.map(row =>
        '<tr>' + headers.map(h => `<td>${escapeHtml(String(row[h] || ''))}</td>`).join('') + '</tr>'
    ).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:system-ui;padding:2em}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#6366F1;color:white}
tr:nth-child(even){background:#f9f9f9}</style>
</head><body><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
}

function getMimeType(format) {
    const map = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
        svg: 'image/svg+xml', tiff: 'image/tiff', ico: 'image/x-icon',
        avif: 'image/avif',
        pdf: 'application/pdf', txt: 'text/plain', html: 'text/html',
        md: 'text/markdown', rtf: 'application/rtf',
        csv: 'text/csv', tsv: 'text/tab-separated-values',
        json: 'application/json', xml: 'application/xml',
        yaml: 'text/yaml', toml: 'text/plain',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook',
        mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo',
        mov: 'video/quicktime', mkv: 'video/x-matroska',
        mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
        aac: 'audio/aac', flac: 'audio/flac', m4a: 'audio/mp4',
        zip: 'application/zip', tar: 'application/x-tar',
        gz: 'application/gzip', '7z': 'application/x-7z-compressed',
    };
    return map[format] || 'application/octet-stream';
}

function replaceExtension(filename, newExt) {
    const dotIndex = filename.lastIndexOf('.');
    const baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
    return `${baseName}.${newExt}`;
}

function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
