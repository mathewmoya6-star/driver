// Secure content renderer (no dangerouslySetInnerHTML)
class SecureContentRenderer {
  constructor() {
    this.allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  }

  // Sanitize text content
  sanitizeText(text) {
    if (!text) return '';
    return text
      .replace(/[&<>]/g, (char) => {
        if (char === '&') return '&amp;';
        if (char === '<') return '&lt;';
        if (char === '>') return '&gt;';
        return char;
      })
      .replace(/[\\]/g, '&#92;')
      .replace(/['"]/g, (char) => char === "'" ? '&#39;' : '&quot;');
  }

  // Validate and sanitize URL
  sanitizeUrl(url) {
    if (!url) return null;
    const allowedDomains = [
      'youtube.com', 'youtu.be', 'vimeo.com',
      'images.unsplash.com', 'supabase.co', 'drive.google.com'
    ];
    try {
      const urlObj = new URL(url);
      if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return url;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Render JSON content structure safely
  renderContent(contentJson) {
    if (!contentJson || !contentJson.sections) return '';
    
    return contentJson.sections.map(section => {
      switch (section.type) {
        case 'heading':
          return `<${section.level === 2 ? 'h2' : 'h3'} class="section-heading">${this.sanitizeText(section.text)}</${section.level === 2 ? 'h2' : 'h3'}>`;
        
        case 'paragraph':
          return `<p class="section-paragraph">${this.sanitizeText(section.text)}</p>`;
        
        case 'list':
          const tag = section.ordered ? 'ol' : 'ul';
          return `<${tag} class="section-list">${section.items.map(item => `<li>${this.sanitizeText(item)}</li>`).join('')}</${tag}>`;
        
        case 'callout':
          return `<div class="callout callout-${section.variant}"><i class="fas fa-${section.variant === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> ${this.sanitizeText(section.text)}</div>`;
        
        case 'embed':
          const validatedUrl = this.sanitizeUrl(section.url);
          if (!validatedUrl) return '<p class="error">Invalid video URL</p>';
          
          if (section.provider === 'youtube') {
            return `<div class="video-container"><iframe src="${validatedUrl}" title="${this.sanitizeText(section.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
          }
          return '';
        
        case 'image':
          const validatedImage = this.sanitizeUrl(section.url);
          if (!validatedImage) return '';
          return `<img src="${validatedImage}" alt="${this.sanitizeText(section.alt || '')}" loading="lazy" class="responsive-image" onerror="this.src='/images/fallback.jpg'">`;
        
        default:
          return '';
      }
    }).join('');
  }

  // Render material card safely
  renderMaterialCard(material) {
    return `
      <div class="card ${material.module_type === 'ev' ? 'card-ev' : ''}" data-id="${material.id}" data-slug="${material.slug}">
        ${material.thumbnail_url ? `<img src="${this.sanitizeUrl(material.thumbnail_url)}" alt="${this.sanitizeText(material.title)}" loading="lazy" class="card-image" onerror="this.src='/images/fallback-thumb.jpg'">` : ''}
        <div class="card-badge ${material.difficulty}">${material.difficulty}</div>
        <h3>${this.sanitizeText(material.title)}</h3>
        <p>${this.sanitizeText(material.description?.substring(0, 100))}...</p>
        <div class="progress-bar"><div class="progress-fill" style="width: ${material.user_progress?.[0]?.progress_percentage || 0}%"></div></div>
        <button class="btn-small" data-action="view">${material.user_progress?.[0]?.status === 'completed' ? 'Review →' : 'Start →'}</button>
      </div>
    `;
  }

  // Render question safely
  renderQuestion(question, index) {
    const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
    
    return `
      <div class="question-card" data-quiz-id="${question.quiz_id}" data-question-id="${question.id}">
        <div class="question-text">${index}. ${this.sanitizeText(question.question_text)}</div>
        <div class="options">
          ${options.map((opt, i) => `
            <label class="option">
              <input type="radio" name="q${question.id}" value="${i}" data-correct="${opt.is_correct}">
              <span>${String.fromCharCode(65 + i)}. ${this.sanitizeText(opt.text)}</span>
            </label>
          `).join('')}
        </div>
        <div class="question-explanation" style="display: none;">${this.sanitizeText(question.explanation)}</div>
      </div>
    `;
  }
}

export const contentRenderer = new SecureContentRenderer();
