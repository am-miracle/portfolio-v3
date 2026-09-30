export interface ExternalArticle {
  title: string;
  summary: string;
  publication: string;
  href: string;
  image: string;
}

/** Pieces published on other platforms. Hygraph posts are fetched separately in `lib/hygraph.ts`. */
export const externalArticles: ExternalArticle[] = [
  {
    title: 'Dynamically managing state with Legend-State',
    summary:
      'Using Legend-State for state management in a React application: its features, fine-grained reactivity and implementation.',
    publication: 'LogRocket',
    href: 'https://blog.logrocket.com/react-state-management-legend-state/',
    image: '/images/legent-state.avif',
  },
  {
    title: 'Comparing Blockchains: Ethereum vs Tezos',
    summary:
      'An in-depth comparison of Ethereum and Tezos for building decentralised applications, covering fundamentals and key differences.',
    publication: 'OpenReplay',
    href: 'https://blog.openreplay.com/comparing-blockchains-ethereum-vs-tezos/',
    image: '/images/blockchain.webp',
  },
  {
    title: 'Building an Event App with Astro & Prismic',
    summary:
      'How to use Prismic with Astro, from setup and data sourcing to shipping an event app.',
    publication: 'Pieces',
    href: 'https://pieces.app/blog/building-an-event-app-with-astro-prismic',
    image: '/images/astro-prismic.webp',
  },
];

export const publications = ['LogRocket', 'OpenReplay', 'Decodo', 'Cyfrin', 'Pieces', 'ButterCMS', 'LTV Protocol'];
