export const site = {
  name: 'Miracle Jude',
  short: 'Miracle',
  role: 'Software Engineer',
  url: 'https://judemiracle.com',
  location: 'Port harcourt, Nigeria',
  timezone: 'Africa/Lagos',
  cv: 'https://docs.google.com/document/d/1AwFGrXoryVv90ZqbgRxwgezyAW2ZDv_6Rkr-4yHijyM/edit?usp=sharing',
  description:
    'Miracle Jude is a software engineer who works across frontend and backend, with deeper knowledge in frontend engineering. He builds React, Next.js and TypeScript apps, and backend systems in Rust and Go.',
  gaId: 'G-F2R2VXW8ST',
  twitter: '@miraclejudeiv',
} as const;

export const nav = [
  { label: 'About', href: '/about', index: '01' },
  { label: 'Projects', href: '/projects', index: '02' },
  { label: 'Blog', href: '/blog', index: '03' },
] as const;

export const socials = [
  { label: 'GitHub', short: 'Gh', href: 'https://www.github.com/am-miracle' },
  { label: 'LinkedIn', short: 'In', href: 'https://www.linkedin.com/in/miracle-jude-4b7a4b179' },
  { label: 'X (Twitter)', short: 'X', href: 'https://www.x.com/miraclejudeiv' },
  { label: 'CodePen', short: 'Cp', href: 'https://codepen.io/judeiv' },
  { label: 'Medium', short: 'Md', href: 'https://medium.com/@judemiracle' },
] as const;

export const stack = [
  'React',
  'Next.js',
  'TypeScript',
  'Astro',
  'Tailwind CSS',
  'Rust',
  'Go',
  'PostgreSQL',
  'Node.js',
  'Zustand',
  'Solidity',
] as const;

export const capabilities = [
  {
    title: 'Frontend Engineering',
    body: 'I work across the stack, with deeper frontend engineering knowledge. I build React, Next.js and TypeScript apps that are responsive, accessible and easy to use.',
    tags: ['React', 'Next.js', 'TypeScript', 'PWA', 'a11y'],
  },
  {
    title: 'Backend Systems',
    body: 'I also like building the systems behind the UI. I work with Rust, Go, Node and Postgres when a product needs backend work too.',
    tags: ['Rust', 'Go', 'Node', 'Postgres'],
  },
  {
    title: 'Technical Writing',
    body: 'I write practical articles and docs about AI, JavaScript, frontend engineering, backend tools and developer workflows.',
    tags: ['Tutorials', 'Docs', 'DevRel', 'SEO'],
  },
] as const;
