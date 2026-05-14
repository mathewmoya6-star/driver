// Google Analytics (if configured)
export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

export function trackEvent(category, action, label = null, value = null) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

export function trackPageView(pageTitle, pageLocation) {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_title: pageTitle,
      page_location: pageLocation
    });
  }
}

// Track user engagement
export function trackCourseEnroll(courseName, price) {
  trackEvent('Enrollment', 'course_enrolled', courseName, price);
}

export function trackQuizComplete(score, total) {
  trackEvent('Quiz', 'quiz_completed', `${score}/${total}`, Math.round((score/total)*100));
}

export function trackCertificateDownload(courseName) {
  trackEvent('Certificate', 'certificate_downloaded', courseName);
}
