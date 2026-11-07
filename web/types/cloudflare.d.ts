declare module "cloudflare:workers" {
  export const env: {
    EGC_SUBMISSIONS?: {
      put(key: string, value: string): Promise<void>;
    };
  };
}
