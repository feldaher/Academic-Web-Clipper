// content.js
// This script runs in the context of the webpage.
// It listens for messages from the popup and performs the content extraction.

/**
 * Listens for a message from the popup script to begin extraction.
 * @param {object} request - The message sent from the popup.
 * @param {object} sender - Information about the sender.
 * @param {function} sendResponse - Function to call to send a response back to the popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractContent") {
        const markdown = extractPageContent(request.notionMode || false);
        sendResponse({ data: markdown });
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
});


/**
 * This function extracts the main content, converts MathML to LaTeX, and returns the Markdown.
 * @param {boolean} notionMode - Whether to format for Notion (removes LaTeX delimiters)
 */
function extractPageContent(notionMode = false) {
    // --- LaTeX Detection Helper ---
    function containsLaTeX(text) {
        // Simple detection of common LaTeX patterns
        const latexPatterns = [
            /\\\w+\{[^}]*\}/,     // Commands like \frac{}, \sqrt{}
            /\w+_\{[^}]*\}/,      // Subscripts like x_{1}
            /\w+\^\{[^}]*\}/,     // Superscripts like x^{2}
            /\w+_\w/,             // Simple subscripts like x_1
            /\w+\^\w/,            // Simple superscripts like x^2
            /\\\w+/,              // Commands like \alpha, \beta
            /\$[^$]+\$/,          // Inline LaTeX delimiters
            /\$\$[^$]+\$\$/       // Block LaTeX delimiters
        ];
        return latexPatterns.some(pattern => pattern.test(text));
    }

    // --- LaTeX Pattern Protection ---
    function protectLaTeX(text) {
        // Protect common LaTeX patterns from markdown formatting interference
        return text
            .replace(/(\w+)\*\*([A-Z]+)/g, '$1^{$2}')      // Fix q**S -> q^{S}
            .replace(/(\w+)\*\*(\w+)/g, '$1^{$2}')         // Fix x**2 -> x^{2}
            .replace(/(\w+)__(\w+)/g, '$1_{$2}')           // Fix x__1 -> x_{1}
            .replace(/\*\*([A-Z]+)\*\*/g, '^{$1}')         // Fix **S** -> ^{S}
            .replace(/__([^_]+)__/g, '_{$1}');             // Fix __text__ -> _{text}
    }

    // --- MathML to LaTeX Conversion Logic ---
    // This is a simplified converter. A real extension would use a robust library.
    function mathMLToLaTeX(mathMLNode) {
        let latex = '';
        const tagName = mathMLNode.tagName.toLowerCase();

        switch (tagName) {
            case 'mi': // Identifier (variable)
                latex = mathMLNode.textContent.trim();
                break;
            case 'mn': // Number
                latex = mathMLNode.textContent.trim();
                break;
            case 'mo': // Operator
                const operator = mathMLNode.textContent.trim();
                // Simple replacements for common symbols
                if (operator === '\u2212') latex = '-';
                else if (operator === '\u00B1') latex = '\\pm';
                else if (operator === '\u2211') latex = '\\sum';
                else if (operator === '\u222B') latex = '\\int';
                else if (operator === '\u221E') latex = '\\infty';
                else if (operator === '\u03B1') latex = '\\alpha';
                else if (operator === '\u03B2') latex = '\\beta';
                else if (operator === '\u03B3') latex = '\\gamma';
                else if (operator === '\u03B4') latex = '\\delta';
                else if (operator === '\u03B5') latex = '\\epsilon';
                else if (operator === '\u03C0') latex = '\\pi';
                else if (operator === '\u03C3') latex = '\\sigma';
                else if (operator === '\u03B8') latex = '\\theta';
                else if (operator === '\u03BB') latex = '\\lambda';
                else if (operator === '\u03BC') latex = '\\mu';
                else if (operator === '\u2264') latex = '\\leq';
                else if (operator === '\u2265') latex = '\\geq';
                else if (operator === '\u2260') latex = '\\neq';
                else if (operator === '\u2208') latex = '\\in';
                else if (operator === '\u2205') latex = '\\emptyset';
                else latex = operator;
                break;
            case 'msup': // Superscript (e.g., x^2)
                const base = mathMLToLaTeX(mathMLNode.children[0]);
                const exponent = mathMLToLaTeX(mathMLNode.children[1]);
                latex = `${base}^{${exponent}}`;
                break;
            case 'msub': // Subscript
                 const subBase = mathMLToLaTeX(mathMLNode.children[0]);
                 const subIndex = mathMLToLaTeX(mathMLNode.children[1]);
                 latex = `${subBase}_{${subIndex}}`;
                 break;
            case 'mfrac': // Fraction
                const numerator = mathMLToLaTeX(mathMLNode.children[0]);
                const denominator = mathMLToLaTeX(mathMLNode.children[1]);
                latex = `\\frac{${numerator}}{${denominator}}`;
                break;
            case 'msqrt': // Square root
                const radicand = mathMLToLaTeX(mathMLNode.children[0]);
                latex = `\\sqrt{${radicand}}`;
                break;
            case 'mroot': // nth root
                if (mathMLNode.children.length >= 2) {
                    const radicandRoot = mathMLToLaTeX(mathMLNode.children[0]);
                    const index = mathMLToLaTeX(mathMLNode.children[1]);
                    latex = `\\sqrt[${index}]{${radicandRoot}}`;
                } else {
                    latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                }
                break;
            case 'mrow': // Group of elements
                latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                break;
            case 'msubsup': // Both subscript and superscript
                if (mathMLNode.children.length >= 3) {
                    const baseSubsup = mathMLToLaTeX(mathMLNode.children[0]);
                    const subscript = mathMLToLaTeX(mathMLNode.children[1]);
                    const superscript = mathMLToLaTeX(mathMLNode.children[2]);
                    latex = `${baseSubsup}_{${subscript}}^{${superscript}}`;
                } else {
                    latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                }
                break;
            case 'mover': // Over (like hat, bar)
                if (mathMLNode.children.length >= 2) {
                    const baseOver = mathMLToLaTeX(mathMLNode.children[0]);
                    const over = mathMLToLaTeX(mathMLNode.children[1]);
                    // Simple handling for common cases
                    if (over === '¯' || over === '\u00AF') {
                        latex = `\\overline{${baseOver}}`;
                    } else if (over === '^' || over === '\u02C6') {
                        latex = `\\hat{${baseOver}}`;
                    } else {
                        latex = `\\overset{${over}}{${baseOver}}`;
                    }
                } else {
                    latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                }
                break;
            case 'munder': // Under (like underline)
                if (mathMLNode.children.length >= 2) {
                    const baseUnder = mathMLToLaTeX(mathMLNode.children[0]);
                    const under = mathMLToLaTeX(mathMLNode.children[1]);
                    latex = `\\underset{${under}}{${baseUnder}}`;
                } else {
                    latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                }
                break;
            case 'math': // Top-level math element
                const content = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
                // Check if it's a block or inline equation
                if (mathMLNode.getAttribute('display') === 'block') {
                    latex = notionMode ? `\n\n${content}\n\n` : `$$${content}$$`;
                } else {
                    latex = notionMode ? `${content}` : `$${content}$`;
                }
                break;
            default:
                // For other tags, just process children
                latex = Array.from(mathMLNode.children).map(mathMLToLaTeX).join(' ');
        }
        return latex;
    }

    // --- Main Content Processing Logic ---
    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let textContent = node.textContent.replace(/\s+/g, ' ');
            
            // Protect LaTeX patterns from markdown formatting interference
            textContent = protectLaTeX(textContent);
            
            // If the text contains LaTeX expressions, preserve them
            if (containsLaTeX(textContent)) {
                // In Notion mode, remove $ delimiters but keep LaTeX
                if (notionMode) {
                    textContent = textContent
                        .replace(/\$\$([^$]+)\$\$/g, '\n\n$1\n\n')  // Block equations
                        .replace(/\$([^$]+)\$/g, '$1');             // Inline equations
                }
            }
            
            return textContent;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        let markdown = '';
        const tagName = node.tagName.toLowerCase();

        // Check if we're inside a math element
        const isInsideMath = node.closest('math') !== null;

        // Recursively process child nodes
        const childrenMarkdown = Array.from(node.childNodes).map(processNode).join('');

        switch (tagName) {
            case 'h1': 
                const h1Content = childrenMarkdown.trim();
                if (h1Content) {
                    markdown = `# ${h1Content}\n\n`;
                }
                break;
            case 'h2': 
                const h2Content = childrenMarkdown.trim();
                if (h2Content) {
                    markdown = `## ${h2Content}\n\n`;
                }
                break;
            case 'h3': 
                const h3Content = childrenMarkdown.trim();
                if (h3Content) {
                    markdown = `### ${h3Content}\n\n`;
                }
                break;
            case 'h4': 
                const h4Content = childrenMarkdown.trim();
                if (h4Content) {
                    markdown = `#### ${h4Content}\n\n`;
                }
                break;
            case 'h5': 
                const h5Content = childrenMarkdown.trim();
                if (h5Content) {
                    markdown = `##### ${h5Content}\n\n`;
                }
                break;
            case 'h6': 
                const h6Content = childrenMarkdown.trim();
                if (h6Content) {
                    markdown = `###### ${h6Content}\n\n`;
                }
                break;
            case 'p': 
                const trimmedP = childrenMarkdown.trim();
                if (trimmedP) {
                    markdown = `${trimmedP}\n\n`;
                }
                break;
            case 'br': markdown = '\n'; break;
            case 'strong': case 'b': 
                const content = childrenMarkdown.trim();
                // Check if this might be a mathematical superscript/subscript
                const prevText = node.previousSibling?.textContent || '';
                const nextText = node.nextSibling?.textContent || '';
                const isLikelyMathNotation = 
                    isInsideMath || 
                    containsLaTeX(childrenMarkdown) || 
                    /^\w+$/.test(content) || // Single variable/letter
                    (/\w$/.test(prevText) && /^[A-Z]+$/.test(content)) || // Variable followed by capital letters (like q**S)
                    (/\w$/.test(prevText) && /^\d+$/.test(content)); // Variable followed by numbers (like x**2)
                
                if (isLikelyMathNotation) {
                    // If previous text ends with a variable, treat this as a superscript
                    if (/\w$/.test(prevText)) {
                        markdown = `^{${content}}`;
                    } else {
                        markdown = content;
                    }
                } else {
                    markdown = `**${content}**`;
                }
                break;
            case 'em': case 'i': 
                const emContent = childrenMarkdown.trim();
                const isLikelyMathNotationEm = 
                    isInsideMath || 
                    containsLaTeX(childrenMarkdown) || 
                    /^\w+$/.test(emContent);
                
                if (isLikelyMathNotationEm) {
                    markdown = emContent;
                } else {
                    markdown = `*${emContent}*`;
                }
                break;
            case 'code': 
                // Only add backticks for inline code, not if it's already in a pre block
                if (node.parentElement && node.parentElement.tagName.toLowerCase() !== 'pre') {
                    markdown = `\`${childrenMarkdown.trim()}\``;
                } else {
                    markdown = childrenMarkdown;
                }
                break;
            case 'pre':
                // Handle code blocks properly - check if it contains a code element
                const codeElement = node.querySelector('code');
                if (codeElement) {
                    const codeContent = codeElement.textContent.trim();
                    const language = codeElement.className.match(/language-(\w+)/)?.[1] || '';
                    markdown = `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
                } else {
                    markdown = `\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
                }
                break;
            case 'blockquote': markdown = `> ${childrenMarkdown.trim()}\n\n`; break;
            case 'ul': markdown = `${childrenMarkdown}\n`; break;
            case 'ol': markdown = `${childrenMarkdown}\n`; break;
            case 'li':
                const trimmedLi = childrenMarkdown.trim();
                if (trimmedLi) {
                    // Check if parent is an ordered list
                    if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'ol') {
                         markdown = `1. ${trimmedLi}\n`;
                    } else {
                         markdown = `- ${trimmedLi}\n`;
                    }
                }
                break;
            case 'a':
                const href = node.getAttribute('href');
                const linkText = childrenMarkdown.trim();
                if (href && linkText && href !== linkText) {
                    // Make the URL absolute if it's relative
                    const absoluteUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;
                    markdown = `[${linkText}](${absoluteUrl})`;
                } else if (linkText) {
                    // If no href or href same as text, just use the text
                    markdown = linkText;
                }
                break;
            case 'img':
                const alt = node.getAttribute('alt') || 'image';
                const src = node.getAttribute('src');
                if (src) {
                    // Make the URL absolute if it's relative
                    const absoluteSrc = src.startsWith('http') ? src : new URL(src, window.location.href).href;
                    markdown = `![${alt}](${absoluteSrc})\n\n`;
                }
                break;
            case 'math':
                markdown = mathMLToLaTeX(node);
                // The mathMLToLaTeX function handles newlines for Notion mode internally
                if (node.getAttribute('display') === 'block' && !notionMode) {
                    markdown += '\n\n';
                }
                break;
            case 'table':
                // Process table and add proper markdown table formatting
                const tableContent = childrenMarkdown.trim();
                if (tableContent) {
                    // Split into rows and process
                    const rows = tableContent.split('\n').filter(row => row.trim());
                    if (rows.length > 0) {
                        let tableMarkdown = '';
                        let isFirstRow = true;
                        
                        for (const row of rows) {
                            // Clean up the row and ensure it ends with |
                            let cleanRow = row.trim();
                            if (!cleanRow.startsWith('|')) {
                                cleanRow = '| ' + cleanRow;
                            }
                            if (!cleanRow.endsWith('|')) {
                                cleanRow += ' |';
                            }
                            tableMarkdown += cleanRow + '\n';
                            
                            // Add separator row after first row (header)
                            if (isFirstRow) {
                                const cellCount = (cleanRow.match(/\|/g) || []).length - 1;
                                const separator = '| ' + '--- | '.repeat(cellCount);
                                tableMarkdown += separator + '\n';
                                isFirstRow = false;
                            }
                        }
                        markdown = tableMarkdown + '\n';
                    }
                } else {
                    markdown = '';
                }
                break;
            case 'tr':
                markdown = `${childrenMarkdown}|\n`;
                break;
            case 'td': case 'th':
                const cellContent = childrenMarkdown.trim().replace(/\|/g, '\\|'); // Escape pipes in content
                markdown = ` ${cellContent} |`;
                break;
            case 'span': 
                // Check if this span contains math (some sites use spans for math rendering)
                if (node.classList.contains('math') || 
                    node.classList.contains('katex') || 
                    node.classList.contains('mathjax') ||
                    containsLaTeX(childrenMarkdown)) {
                    // Treat as math content
                    if (notionMode) {
                        markdown = childrenMarkdown.replace(/\$+/g, ''); // Remove $ delimiters
                    } else {
                        markdown = childrenMarkdown;
                    }
                } else {
                    markdown = childrenMarkdown;
                }
                break;
            case 'div': case 'section': case 'article': case 'main': case 'aside': case 'header': case 'footer':
                // Skip navigation and other non-content elements
                if (node.classList.contains('nav') || 
                    node.classList.contains('navigation') ||
                    node.classList.contains('menu') ||
                    node.classList.contains('header') ||
                    node.classList.contains('footer') ||
                    node.classList.contains('sidebar') ||
                    node.id === 'nav' ||
                    node.id === 'navigation' ||
                    node.id === 'menu' ||
                    node.id === 'header' ||
                    node.id === 'footer') {
                    return '';
                }
                markdown = childrenMarkdown; // Pass through content from containers
                break;
            // Ignore script/style tags and other unwanted elements completely
            case 'script': case 'style': case 'noscript': case 'head': case 'meta': case 'link': case 'title':
            case 'nav': case 'menu': case 'button': case 'form': case 'input': case 'textarea': case 'select':
                return '';
            default:
                markdown = childrenMarkdown;
        }
        return markdown;
    }

    // Try to find the main content area of the page.
    // This is a heuristic and might need adjustment for specific sites.
    const mainContent = document.querySelector('article') || 
                       document.querySelector('main') || 
                       document.querySelector('.content') ||
                       document.querySelector('#content') ||
                       document.querySelector('.post') ||
                       document.querySelector('.entry-content') ||
                       document.querySelector('.post-content') ||
                       document.querySelector('.article-content') ||
                       document.querySelector('[role="main"]') ||
                       document.body;
    
    let result = processNode(mainContent);
    
    // Clean up the markdown output
    result = result
        .replace(/\n{3,}/g, '\n\n')           // Replace multiple newlines with double newlines
        .replace(/\|\s*\n/g, '|\n')           // Clean up table row endings
        .replace(/\n\n\n/g, '\n\n')           // Ensure no triple newlines
        .replace(/^\s+|\s+$/g, '')             // Trim whitespace from start and end
        .replace(/\n\s*\n\s*\n/g, '\n\n')     // Clean up any remaining multiple newlines
        .replace(/\[([^\]]*)\]\(\)/g, '$1')   // Remove empty links [text]()
        .replace(/\[\]\([^)]*\)/g, '')        // Remove links with no text []()
        .replace(/\s+\n/g, '\n')              // Remove trailing spaces before newlines
        .replace(/\n\s+/g, '\n')              // Remove leading spaces after newlines
        .replace(/\|\s*\|\s*\n/g, '|\n')      // Clean up empty table cells
        // Fix mathematical notation that got converted to markdown formatting
        .replace(/(\w+)\*\*([A-Z]+)\*\*/g, '$1^{$2}')  // Fix q**S** -> q^{S}
        .replace(/(\w+)\*\*(\w+)\*\*/g, '$1^{$2}')     // Fix x**2** -> x^{2}
        .replace(/(\w+)\*\*([A-Z]+)/g, '$1^{$2}')      // Fix q**S -> q^{S}
        .replace(/(\w+)\*\*(\w+)/g, '$1^{$2}')         // Fix x**2 -> x^{2}
        .replace(/\*\*([A-Z]+)\*\*/g, '^{$1}')         // Fix **S** -> ^{S}
        .replace(/\*\*(\w+)\*\*/g, '^{$1}');           // Fix **text** -> ^{text} in math context
    
    // Additional cleanup for Notion mode to handle equation spacing
    if (notionMode) {
        result = result
            .replace(/\n\n\n\n/g, '\n\n')     // Clean up excessive newlines around block equations
            .replace(/\n{4,}/g, '\n\n');       // Limit maximum consecutive newlines
    }
    
    return result;
}
