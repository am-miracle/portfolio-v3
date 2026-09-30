export type ProjectCategory = 'product' | 'experiment';

interface ProjectBase {
  title: string;
  summary: string;
  image: string;
  stack: string[];
  category: ProjectCategory;
  featured?: boolean;
  year?: string;
}

export type Project = ProjectBase & ({ live: string; source?: string } | { live?: string; source: string });

export const projects: Project[] = [
  {
    title: 'AIMS',
    summary:
      'A telehealth weight-loss platform that helps patients access doctor-guided GLP-1 treatment online, from consultation and scheduling to prescription fulfilment and ongoing support.',
    image: '/images/aims.webp',
    stack: ['React', 'Express', 'TypeScript'],
    category: 'product',
    live: 'https://joinaims.com/',
    featured: true,
  },
  {
    title: 'Greenore',
    summary:
      'B2B platform for sourcing and tracking raw ore with ESG compliance, supply-chain transparency and regulatory audit trails for major industry stakeholders.',
    image: '/images/greenore.webp',
    stack: ['Next.js', 'Tailwind', 'TypeScript', 'Shadcn UI'],
    category: 'product',
    live: 'https://www.greenore.ai/',
    featured: true,
  },
  {
    title: 'Adsloty',
    summary:
      'A self-service marketplace that lets newsletter writers sell ad space like inventory and lets sponsors book it instantly, without emails or negotiation.',
    image: '/images/adsloty.webp',
    stack: ['Rust', 'Axum', 'Next.js', 'TypeScript'],
    category: 'product',
    live: 'https://adsloty.vercel.app/',
    featured: true,
  },
  {
    title: 'Settle',
    summary:
      'A PWA for tracking money owed to you or by you. It uses AI to send automated reminders so you get paid back without the awkward conversation.',
    image: '/images/settle.webp',
    stack: ['Express', 'PostgreSQL', 'Sequelize', 'Next.js'],
    category: 'product',
    live: 'https://micro-debt-settler.vercel.app/',
    featured: true,
  },
  {
    title: 'Kreatoors',
    summary: 'AI-powered employee content creation platform. Built the AI generation workflows from idea to launch.',
    image: '/images/kreatoors.webp',
    stack: ['Next.js', 'Shadcn UI', 'TypeScript', 'Redux'],
    category: 'product',
    live: 'https://kreatoors.ai/platform',
  },
  {
    title: 'MeatVault',
    summary: 'An e-commerce store for buying every kind of meat, based in Canada.',
    image: '/images/meatvault.webp',
    stack: ['React', 'Chakra UI', 'Redux Toolkit', 'Headless CMS'],
    category: 'product',
    live: 'https://themeatvault.ca/',
  },
  {
    title: 'Portfolio V2',
    summary: 'My portfolio project reflects my dedication to accessibility and performance, integrating inclusive design principles to create a seamless user experience.',
    image: '/images/my-portfolio.webp',
    stack: ['HTML5', 'CSS', 'JavaScript'],
    category: 'experiment',
    source: 'https://github.com/am-miracle/Portfolio-V2',
  },
  {
    title: 'DrumKit',
    summary: 'A keyboard-only drum machine.',
    image: '/images/drumkit.webp',
    stack: ['HTML', 'CSS', 'JavaScript'],
    category: 'experiment',
    live: 'https://drumplaykit.netlify.app/',
    source: 'https://github.com/am-miracle/JavaScript-Projects/tree/master/Drum%20Kit%20Player',
  },
];

export const categories: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'product', label: 'Products' },
  { id: 'experiment', label: 'Experiments' },
];

export const pens = [
  { title: 'Analog & Digital Clock', href: 'https://codepen.io/JudeIV/pen/VwWZVJZ' },
  { title: 'Recipes Layout', href: 'https://codepen.io/JudeIV/pen/abJPdBW' },
  { title: "Don't Quit Text Animation", href: 'https://codepen.io/JudeIV/pen/eYvpBzw' },
];

export interface BackendSystem {
  title: string;
  summary: string;
  language: string;
  href: string;
}

export const backendSystems: BackendSystem[] = [
  {
    title: 'ferrum-proxy',
    summary:
      'HTTP reverse proxy that sits in front of your backend services, matches a request to a route, picks a healthy backend, forwards the request and sends the response back to the client.',
    language: 'Rust',
    href: 'https://github.com/am-miracle/ferrum-proxy',
  },
  {
    title: 'tunl',
    summary:
      'Command-line tool that reads a config file with your service dependencies and opens all the tunnels you need with a single command: one process, one config, every port forwarded.',
    language: 'Rust',
    href: 'https://github.com/am-miracle/tunl',
  },
  {
    title: 'scaledjob-operator',
    summary:
      'Kubernetes operator that watches a custom ScaledJob resource and automatically creates Kubernetes Jobs in response to Redis queue depth.',
    language: 'Go',
    href: 'https://github.com/am-miracle/scaledjob-operator',
  },
  {
    title: 'Ambagrid',
    summary: 'Real-time control room for monitoring solar mini-grid sites, equipment, telemetry and alerts.',
    language: 'Go / Rust / TypeScript',
    href: 'https://github.com/am-miracle/ambagrid',
  },
  {
    title: 'Evictor',
    summary: 'Observability and control layer for AI inference workloads running on serverless GPU providers.',
    language: 'Go / TypeScript',
    href: 'https://github.com/am-miracle/evictor',
  },
];

export const openSource = [
  {
    title: 'HelixDB',
    role: 'Open Source Contributor',
    year: '2025',
    location: 'Remote',
    href: 'https://github.com/HelixDB/helix-db',
    summary:
      'Contributed to a graph and vector database written in Rust. Worked on BM25 search optimization that improved query throughput by 35% and reduced memory allocation pressure through arena allocator improvements.',
  },
  {
    title: 'Blinc',
    role: 'Open Source Contributor',
    year: '2026',
    location: 'Remote',
    href: 'https://github.com/project-blinc/Blinc',
    summary:
      'Developed custom components for a declarative, reactive UI system written in Rust, with first-class state machines, spring physics animations and GPU-accelerated rendering.',
  },
];
