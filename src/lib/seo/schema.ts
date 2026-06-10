import { blogBreadcrumbRoot } from '~/data/blogArticleContract';
import { seoSchemaContract } from '~/data/seoSchemaContract';

export function resolveSiteOrigin(site: URL | string | undefined, fallbackOrigin: string): string {
  if (site instanceof URL) return site.origin;
  if (typeof site === 'string') return new URL(site).origin;
  return fallbackOrigin;
}

export function absoluteSiteUrl(origin: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, origin).href;
}

function organizationPublisher(origin: string) {
  return {
    '@type': 'Organization' as const,
    name: seoSchemaContract.siteName,
    url: origin,
    logo: {
      '@type': 'ImageObject' as const,
      url: absoluteSiteUrl(origin, seoSchemaContract.logoPath)
    }
  };
}

export function buildOrganizationSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoSchemaContract.siteName,
    url: origin,
    logo: absoluteSiteUrl(origin, seoSchemaContract.logoPath),
    email: seoSchemaContract.contactEmail,
    ...(seoSchemaContract.sameAs.length > 0 ? { sameAs: [...seoSchemaContract.sameAs] } : {})
  };
}

export function buildWebSiteSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoSchemaContract.siteName,
    url: origin,
    inLanguage: seoSchemaContract.inLanguage,
    publisher: organizationPublisher(origin)
  };
}

export type BlogPostingSchemaInput = {
  origin: string;
  articlePath: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  imagePath?: string;
};

export function buildBlogPostingSchema(input: BlogPostingSchemaInput) {
  const url = absoluteSiteUrl(input.origin, input.articlePath);
  const imageUrl = input.imagePath ? absoluteSiteUrl(input.origin, input.imagePath) : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      '@type': 'Organization',
      name: input.authorName
    },
    publisher: organizationPublisher(input.origin),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    url,
    inLanguage: seoSchemaContract.inLanguage,
    ...(imageUrl ? { image: [imageUrl] } : {})
  };
}

export type BlogBreadcrumbSchemaInput = {
  origin: string;
  articlePath: string;
  category: string;
  title: string;
};

/** Matches visible breadcrumb: Blog → category (label) → article title. */
export function buildBlogBreadcrumbSchema(input: BlogBreadcrumbSchemaInput) {
  const articleUrl = absoluteSiteUrl(input.origin, input.articlePath);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: blogBreadcrumbRoot.label,
        item: absoluteSiteUrl(input.origin, blogBreadcrumbRoot.href)
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: input.category
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: input.title,
        item: articleUrl
      }
    ]
  };
}
