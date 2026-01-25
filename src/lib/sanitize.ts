/**
 * HTML Sanitization Utility
 * Uses DOMPurify to prevent XSS attacks when rendering HTML content
 */

import DOMPurify from 'dompurify';

// Allowed tags for contract HTML content
const ALLOWED_TAGS = [
  'p', 'strong', 'em', 'b', 'i', 'u', 'br', 'div', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'ul', 'ol', 'li',
  'hr', 'blockquote', 'pre', 'code',
  'header', 'footer', 'section', 'article',
  'center', 'font', 'sub', 'sup',
];

// Allowed attributes for styling contracts
const ALLOWED_ATTR = [
  'style', 'class', 'id',
  'align', 'valign', 'width', 'height',
  'colspan', 'rowspan', 'border', 'cellpadding', 'cellspacing',
  'color', 'size', 'face',
];

/**
 * Sanitize HTML content for safe rendering
 * Prevents XSS attacks while preserving formatting for contracts/documents
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize and return HTML for use with dangerouslySetInnerHTML
 */
export function sanitizeForReact(dirty: string): { __html: string } {
  return { __html: sanitizeHtml(dirty) };
}
