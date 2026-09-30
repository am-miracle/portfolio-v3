export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  excerpt?: string | null;
  tags: string[];
}

export interface Post extends PostSummary {
  coverImage?: { url: string } | null;
  content: { html: string; text: string };
}

const endpoint = import.meta.env.HYGRAPH_ENDPOINT;

async function query<T>(q: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, variables }),
    });
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors) {
      console.warn('[hygraph] query errors', json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.warn('[hygraph] request failed', err);
    return null;
  }
}

let cache: Promise<Post[]> | undefined;

// all posts, newest first. Returns [] when HYGRAPH_ENDPOINT is unset or unreachable
export function getPosts(): Promise<Post[]> {
  cache ??= query<{ posts: Post[] }>(`
    query AllPosts {
      posts(orderBy: date_DESC) {
        slug title date excerpt tags
        coverImage { url }
        content { html text }
      }
    }
  `).then((d) => d?.posts ?? []);
  return cache;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const readingTime = (text?: string) => {
  const words = text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return words ? Math.max(1, Math.round(words / 200)) : null;
};
