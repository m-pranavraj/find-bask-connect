import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: object;
}

const SEO = ({ 
  title = "Lost and Found - Reunite with Your Belongings in India",
  description = "Lost and Found helps reunite people with their lost belongings across India. Post found items or search for your lost items through our secure verification platform.",
  keywords = "lost and found india, found items, lost items, reunite belongings, secure verification, lost property, found property",
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  structuredData
}: SEOProps) => {
  const location = useLocation();
  const canonicalUrl = `https://yoursite.lovable.app${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const metaTags: Record<string, string> = {
      'description': description,
      'keywords': keywords,
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:image': ogImage,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage,
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      let element = document.querySelector(`meta[name="${name}"]`) || 
                    document.querySelector(`meta[property="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    });

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Add structured data if provided
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, structuredData]);

  return null;
};

export default SEO;