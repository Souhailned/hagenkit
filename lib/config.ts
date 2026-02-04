export const siteConfig = {
  name: "DataRAG",
  title: "DataRAG – AI-Powered Data Intelligence Platform",
  description:
    "DataRAG is an AI-powered data intelligence platform for modern teams, combining RAG technology with enterprise-grade security.",
  url: "https://datarag.io",
  ogImage: "/og.png",
  upgrade: {
    label: "Upgrade to DataRAG Pro",
    href: "https://datarag.io/pro",
  },
  links: {
    twitter: "https://x.com/datarag",
    linkedin: "https://www.linkedin.com/company/datarag",
  },
  keywords: [
    "RAG platform",
    "AI data intelligence",
    "DataRAG",
    "enterprise AI",
    "vector search",
    "document intelligence",
    "AI infrastructure",
    "data platform",
    "knowledge retrieval",
  ],
  authors: [
    {
      name: "DataRAG",
      url: "https://datarag.io",
    },
  ],
  creator: "DataRAG",
  publisher: "DataRAG",
  twitterHandle: "@datarag",
  locale: "en_US",
  category: "Software",
  // Email branding configuration
  email: {
    brandName: "DataRAG",
    tagline:
      "AI-powered data intelligence platform with RAG technology and enterprise security.",
    supportEmail: "support@datarag.io",
    fromEmail: "noreply@datarag.io",
    fromName: "DataRAG",
  },
};

export type SiteConfig = typeof siteConfig;
