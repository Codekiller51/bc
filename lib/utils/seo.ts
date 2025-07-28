import type { Metadata } from "next"

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article"
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/og-image.jpg",
    url = "https://brandconnect.co.tz",
    type = "website",
    author,
    publishedTime,
    modifiedTime,
  } = config

  const fullTitle = title.includes("Brand Connect") ? title : `${title} | Brand Connect`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Brand Connect",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@brandconnecttz",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  }
}

export const defaultSEO: SEOConfig = {
  title: "Brand Connect - Tanzania's Creative Marketplace",
  description: "Connect with verified creative professionals across Tanzania. Find graphic designers, photographers, videographers, and digital marketers in your region.",
  keywords: [
    "creative professionals",
    "Tanzania",
    "graphic design",
    "photography",
    "videography",
    "digital marketing",
    "freelancers",
    "creative services",
    "Dar es Salaam",
    "Arusha",
    "Mwanza",
  ],
}

export function generateBlogPostMetadata(post: {
  title: string
  excerpt: string
  author: string
  publishedAt: string
  updatedAt?: string
  image?: string
  slug: string
}): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    image: post.image,
    url: `https://brandconnect.co.tz/blog/${post.slug}`,
    type: "article",
    keywords: ["creative tips", "Tanzania", "business", "design", "photography"],
  })
}

export function generateProfileMetadata(profile: {
  name: string
  title: string
  location: string
  bio: string
  avatar?: string
}): Metadata {
  return generateMetadata({
    title: `${profile.name} - ${profile.title}`,
    description: `${profile.bio} Based in ${profile.location}. Connect with ${profile.name} on Brand Connect.`,
    image: profile.avatar,
    keywords: [profile.title.toLowerCase(), profile.location.toLowerCase(), "creative professional"],
  })
}