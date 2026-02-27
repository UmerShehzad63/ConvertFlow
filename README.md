# ConvertFlow ⚡

ConvertFlow is a high-performance, **privacy-first**, 100% client-side universal file conversion platform. It allows users to convert documents, images, and spreadsheets directly in their browser without ever uploading sensitive data to a server.

## ✨ Features

- **Privacy-First**: No files are uploaded to any server. All processing happens locally in the browser.
- **Universal Conversion**: Support for 100+ file formats including PDF, Word, Excel, Images, Markdown, JSON, YAML, and more.
- **Intelligent Detection**: Automatic file type detection using MIME types, extensions, and magic bytes.
- **Batch Processing**: Convert multiple files in parallel with progress tracking.
- **Smart Formatting**: 
  - **PDF to Word**: Real text extraction using PDF.js and valid Office Open XML (DOCX) structure generation.
  - **Structured Data**: Seamless conversion between JSON, XML, YAML, and CSV.
  - **Media**: High-quality image transcoding and rendering.
- **Modern UI**: Sleek, glassmorphism-inspired interface with fluid animations and responsive design.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **PDF Core**: [PDF.js](https://mozilla.github.io/pdf.js/) & [pdf-lib](https://pdf-lib.js.org/)
- **Document Generation**: [JSZip](https://stuk.github.io/jszip/) (for DOCX structure) & [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (for Word processing)
- **Styling**: Vanilla CSS with modern typography and fluid layouts.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd convertflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📋 Conversion Examples

- **PDF → Word**: Extract text into a valid, editable `.docx` file.
- **CSV → JSON/YAML**: Transform spreadsheet data into developer-friendly formats.
- **HTML → Markdown**: Convert web pages into clean markdown documentation.
- **Images**: Rapidly convert between JPG, PNG, WebP, SVG, and more.

## ❤️ Support

If you find this tool helpful, consider supporting the developer:
- [Buy Me a Coffee](https://buymeacoffee.com/umershehzad)

---
© 2026 ConvertFlow. Built with passion for privacy and performance.
