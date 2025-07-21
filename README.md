# Academic Web Clipper

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0-orange.svg)](manifest.json)

A powerful web (Firefox, Chrome) extension that extracts academic web content and converts it to clean Markdown format with proper LaTeX equation support. Perfect for researchers, students, and academics who need to clip web content for note-taking apps like Obsidian, Notion, or any Markdown-compatible editor.

## ✨ Features

### 🔬 **Academic-Focused Content Extraction**
- **MathML to LaTeX Conversion**: Automatically converts mathematical expressions to LaTeX format
- **Smart Equation Detection**: Recognizes and preserves both inline and block equations
- **Superscript/Subscript Handling**: Converts HTML formatting to proper LaTeX notation (e.g., `q^{S}`, `x_{1}`)

### 📝 **Clean Markdown Output**
- **Structured Content**: Proper heading hierarchy, paragraphs, lists, and blockquotes
- **Table Support**: Converts HTML tables to Markdown table format
- **Link Preservation**: Maintains absolute URLs for images and links
- **Code Block Detection**: Preserves syntax highlighting information

### 🎯 **Notion Integration**
- **Notion Mode**: Special toggle that removes LaTeX delimiters for direct Notion compatibility
- **Proper Spacing**: Handles block equations with appropriate line breaks
- **Optimized Formatting**: Ensures equations render correctly in Notion

### 🧹 **Smart Content Filtering**
- **Navigation Removal**: Automatically excludes headers, footers, navigation menus
- **Content Focus**: Targets main article content using intelligent selectors
- **Noise Reduction**: Filters out advertisements, sidebars, and irrelevant elements

## 🚀 Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be published to the Chrome Web Store*

### Manual Installation for Chrome (Developer Mode)
1. **Download** or clone this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Manual Installation for Firefox (Developer Mode)
1. **Download** or clone this repository
2. **Open Firefox** and navigate to `about:debugging#/runtime/this-firefox`
3. **Click "Load Temporary Add-on..."** and select the extension folder
4. **Pin the extension** to your toolbar for easy access

   
## 💡 How to Use

### Basic Usage
1. **Navigate** to any academic webpage (research papers, articles, documentation)
2. **Click** the Academic Web Clipper icon in your browser toolbar
3. **Choose your mode**:
   - ✅ **Copy for Notion**: Check this for better Notion compatibility (still need some manual curation but the equations will be there!)
   - ⬜ **Standard Mode**: Leave unchecked for other Markdown apps
4. **Click "Clip Page as Markdown"**
5. **Paste** the content into your note-taking app

### Supported Content Types
- 📄 **Research Papers** (arXiv, PubMed, IEEE, ACM, etc.)
- 📚 **Academic Articles** and blog posts
- 📖 **Documentation** with mathematical content
- 🔬 **Technical Specifications** and standards
- 📊 **Reports** with tables and equations

### Example Output

**Input HTML:**
```html
<h1>Quantum Computing Basics</h1>
<p>The probability amplitude is represented as <math><mi>ψ</mi></math></p>
<p>where the state can be written as <math><mi>α</mi><mo>|</mo><mn>0</mn><mo>⟩</mo></math></p>
```

**Standard Mode Output:**
```markdown
# Quantum Computing Basics

The probability amplitude is represented as $ψ$

where the state can be written as $α|0⟩$
```

**Notion Mode Output:**
```markdown
# Quantum Computing Basics

The probability amplitude is represented as ψ

where the state can be written as α|0⟩
```

## ⚙️ Technical Details

### Supported Mathematical Elements
- **MathML Elements**: `<math>`, `<mi>`, `<mo>`, `<mn>`, `<msub>`, `<msup>`, `<mfrac>`, `<msqrt>`, `<mrow>`
- **LaTeX Commands**: Fractions, roots, superscripts, subscripts, Greek letters
- **Mathematical Operators**: ∑, ∫, ≤, ≥, ∈, ∅, ∞, ±, and more
- **Special Formatting**: Overlines, hats, complex expressions

### Content Selectors
The extension intelligently targets main content using these selectors (in order of preference):
1. `<article>`
2. `<main>`
3. `.content`, `#content`
4. `.post`, `.entry-content`, `.post-content`
5. `.article-content`
6. `[role="main"]`
7. `<body>` (fallback)

### Browser Compatibility
- ✅ **Chrome 88+** (Manifest V3 support)
- ✅ **Edge 88+** (Chromium-based)
- ❓ **Firefox** (requires Manifest V2 adaptation)

## 🛠️ For Developers

### Project Structure
```
academic-web-clipper/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup logic and UI handling
├── content.js             # Main content extraction logic
├── images/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

### Key Components

#### Content Script (`content.js`)
- **MathML Parser**: Converts mathematical markup to LaTeX
- **DOM Processor**: Traverses and converts HTML to Markdown
- **Content Filter**: Removes navigation and irrelevant elements
- **Text Cleaner**: Post-processes output for clean formatting

#### Popup Interface (`popup.js`)
- **Mode Selection**: Handles Notion vs. standard mode toggle
- **Message Passing**: Communicates with content script
- **Clipboard API**: Copies extracted content to clipboard

### Development Setup
```bash
# Clone the repository
git clone https://github.com/your-username/academic-web-clipper.git
cd academic-web-clipper

# Load in Chrome for testing
# 1. Open chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked" and select this folder
```

### Contributing
We welcome contributions! Please see our areas for improvement below.

## 🚧 Future Improvements

### High Priority
- [ ] **Enhanced MathML Support**
  - Support for `<mtable>` (mathematical tables)
  - Better handling of complex nested expressions
  - Integration with MathJax/KaTeX libraries

- [ ] **Citation Extraction**
  - Automatic detection and formatting of citations
  - DOI and ISBN recognition
  - Bibliography generation

- [ ] **PDF Support**
  - Direct PDF content extraction
  - OCR integration for scanned documents

### Medium Priority
- [ ] **Enhanced Content Detection**
  - Machine learning-based content area detection
  - Better handling of single-page applications (SPAs)
  - Support for dynamically loaded content

- [ ] **Export Options**
  - Multiple output formats (LaTeX, HTML, Plain text)
  - Custom template support
  - Batch processing capabilities

- [ ] **Integration Features**
  - Direct API integration with note-taking apps
  - Cloud storage sync (Google Drive, Dropbox)
  - Web-based processing service

### Low Priority
- [ ] **UI Improvements**
  - Preview functionality before clipping
  - Custom selector tools
  - Bulk processing interface

- [ ] **Advanced Features**
  - Image OCR for embedded text
  - Multi-language support
  - Accessibility improvements

## 🐛 Known Issues

- Some dynamically loaded mathematical content may not be captured
- Very complex nested tables might not format perfectly
- Some specialized MathML elements are not yet supported
- More generally, you can expect a few formatting errors but there are quick to fix.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/feldaher/academic-web-clipper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/feldaher/academic-web-clipper/discussions)

## 🙏 Acknowledgments

- Thanks to the Obsidian web clipper for inspiration (and frustation-based motivation)
- Built with ❤️ for researchers and students worldwide

---

**Made for academics, by academics. Happy clipping! 📚✨**
