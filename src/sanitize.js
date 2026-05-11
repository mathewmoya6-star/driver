import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm';

// Configure DOMPurify for safe HTML rendering
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    // Allow only safe attributes
    if (node.hasAttribute('onclick') || 
        node.hasAttribute('onerror') || 
        node.hasAttribute('onload') ||
        node.hasAttribute('onmouseover')) {
        node.removeAttribute('onclick');
        node.removeAttribute('onerror');
        node.removeAttribute('onload');
        node.removeAttribute('onmouseover');
    }
});

// Allowed tags for educational content
const ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'div', 'span', 'a', 'img', 'iframe', 'table',
    'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'pre', 'code'
];

// Allowed attributes
const ALLOWED_ATTR = [
    'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
    'width', 'height', 'frameborder', 'allow', 'allowfullscreen'
];

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['http', 'https', 'mailto'];

// Allowed domains for images and iframes
const ALLOWED_DOMAINS = [
    'youtube.com', 'youtu.be', 'vimeo.com',
    'images.unsplash.com', 'supabase.co', 
    'fktjmkmzlixlapeyhhyl.supabase.co',
    'img.youtube.com', 'i.ytimg.com'
];

export function sanitizeHtml(html) {
    if (!html) return '';
    if (typeof html !== 'string') html = String(html);
    
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTR,
        ALLOWED_PROTOCOLS: ALLOWED_PROTOCOLS,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
        USE_PROFILES: { html: true }
    });
}

export function sanitizeText(text) {
    if (!text) return '';
    if (typeof text !== 'string') text = String(text);
    
    // Escape HTML entities but preserve paragraphs and formatting
    return text
        .replace(/[&<>]/g, (char) => {
            if (char === '&') return '&amp;';
            if (char === '<') return '&lt;';
            if (char === '>') return '&gt;';
            return char;
        })
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (char) => char); // Preserve emojis
}

export function validateUrl(url, type = 'image') {
    if (!url) return null;
    if (typeof url !== 'string') return null;
    
    try {
        const urlObj = new URL(url);
        const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
            urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
        );
        const isSecureProtocol = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        
        if (type === 'youtube') {
            const isYouTube = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
            if (isYouTube && isSecureProtocol) {
                // Convert to embed URL
                const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)?.[1];
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
            return null;
        }
        
        if (isAllowedDomain && isSecureProtocol) return url;
        return null;
    } catch {
        return null;
    }
}

export function sanitizeMaterial(material) {
    if (!material) return null;
    
    return {
        ...material,
        title: sanitizeText(material.title),
        description: sanitizeText(material.description),
        content: material.content ? (
            typeof material.content === 'string' ? sanitizeHtml(material.content) : material.content
        ) : null,
        image_url: validateUrl(material.image_url, 'image'),
        video_url: validateUrl(material.video_url, 'youtube'),
        thumbnail_url: validateUrl(material.thumbnail_url, 'image')
    };
}
