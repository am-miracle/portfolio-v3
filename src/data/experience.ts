export interface Role {
  title: string;
  company: string;
  href?: string;
  period: string;
  points: string[];
}

export const experience: Role[] = [
  {
    title: 'Software Engineer',
    company: 'Khoomi',
    href: 'https://www.linkedin.com/company/khoomi/posts/',
    period: 'Feb 2026 - Present',
    points: [
      'Build and maintain product systems for Khoomi, an African marketplace for handmade goods, working across frontend and backend.',
      'Engineer Go backend services for multi-vendor orders, inventory, shipping, seller wallets, payouts, notifications and moderation.',
      'Ship frontend flows for sellers, buyers and marketplace operators, translating marketplace requirements into reliable production features.',
    ],
  },
  {
    title: 'Senior Technical Writer',
    company: 'Decodo',
    href: 'https://decodo.com/',
    period: 'Mar 2025 - Present',
    points: [
      'Write deep-dive guides on scraping infrastructure, proxy management and browser automation, each built on a working demo environment rather than surface-level research.',
      'Authored guides on Apache Nutch and Python, Playwright and BeautifulSoup scraping that ranked on page one of Google within 30 days of publishing.',
      'Maintained zero editorial revision requests across 8 published pieces by catching technical inaccuracies before submission.',
    ],
  },
  {
    title: 'Technical Content Lead',
    company: 'LTV Protocol',
    href: 'https://ltv.finance/',
    period: 'Aug 2025 - Oct 2025',
    points: [
      'Led developer documentation, integration guides and smart-contract references for a DeFi protocol used by 500+ developers.',
      'Translated liquidity provisioning, yield optimisation and tokenomics into clear technical material for developers and protocol users.',
      'Documented protocol upgrades within 48 hours of deployment, keeping integration guidance aligned with shipped contracts.',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Kreatoors.ai',
    href: 'https://kreatoors.ai/',
    period: 'Feb 2025 - May 2025',
    points: [
      'Built frontend product experiences for an AI-enhanced employee advocacy, personal branding and corporate influencing platform.',
      'Developed React interfaces and Zustand state flows for content generation, campaign workflows and user-facing product surfaces.',
      'Worked closely with product requirements to ship fast iterations while keeping state management predictable and interface behavior consistent.',
    ],
  },
  {
    title: 'Frontend Developer',
    company: 'ICOWEB Agency',
    href: 'https://icowebagency.com/',
    period: 'Sep 2023 - Feb 2024',
    points: [
      'Built, styled and shipped production interfaces across multiple agency projects in e-commerce, SaaS and health.',
      'Collaborated with backend and design teams to deliver responsive, cross-browser product experiences under active client timelines.',
      'Integrated frontend applications with Rust and Express backends while maintaining consistent UI behavior across product surfaces.',
    ],
  },
  {
    title: 'Frontend Engineer',
    company: 'Khoomi',
    href: 'https://www.linkedin.com/company/khoomi/posts/',
    period: 'May 2023 - Feb 2024',
    points: [
      'Built frontend experiences for Khoomi, an African marketplace for handmade goods, across seller and buyer workflows.',
      'Implemented secure authentication with NextAuth and optimised product data fetching with SWR.',
      'Collaborated with backend and design teams to ship responsive marketplace interfaces for real user workflows.',
    ],
  },
  {
    title: 'Contributing Technical Writer',
    company: 'LogRocket Blog',
    href: 'https://logrocket.com/',
    period: 'Nov 2022 - Present',
    points: [
      'Published and update 20+ tutorials on AI,CSS, React, Next.js, TypeScript, browser APIs, Rust and related frontend topics, reaching 10,000+ developers monthly.',
      'Maintained a 95% article acceptance rate by pitching topics based on content gap analysis.',
      'Delivered zero failed code samples across published articles by building, testing and verifying every demo before submission.',
    ],
  },
  {
    title: 'Contributing Technical Writer',
    company: 'OpenReplay Blog',
    href: 'https://openreplay.com/',
    period: 'Nov 2022 - Present',
    points: [
      'Published 15+ articles on frontend performance, accessibility and emerging JavaScript frameworks, reaching 10,000+ developers monthly.',
      'Delivered every article on deadline with zero revision requests.',
      'Validated demos, examples and technical claims before submission to keep articles practical and implementation-ready.',
    ],
  },
  {
    title: 'Frontend Engineer',
    company: 'Daabo Inc',
    href: 'https://www.getdaabo.com.ng/',
    period: 'Jul 2022 - Jun 2023',
    points: [
      'Built frontend systems with Next.js and Redux Toolkit for Daabo, an AI-powered device lifecycle management platform.',
      'Shipped interfaces for device verification, real-time monitoring, fraud prevention, smart claims handling and end-of-life service workflows.',
      'Improved frontend performance through code splitting, lazy loading and offline-capable PWA patterns across operational dashboards.',
    ],
  },
];

export const skills = {
  Frontend: ['React', 'Next.js', 'Astro', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Zustand'],
  Backend: ['Go', 'Rust', 'Node.js', 'Express', 'Axum', 'REST APIs', 'Authentication'],
  Mobile: ['Swift', 'iOS development', 'Mobile UI', 'App architecture'],
  Data: ['PostgreSQL', 'MongoDB', 'Sequelize', 'Caching', 'Background sync', 'Service workers'],
  Tools: ['Git', 'Docusaurus', 'Hygraph', 'Netlify', 'Vercel', 'Technical writing'],
} as const;
