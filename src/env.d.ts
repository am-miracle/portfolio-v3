/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly HYGRAPH_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
