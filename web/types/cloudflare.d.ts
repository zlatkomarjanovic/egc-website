declare module "cloudflare:workers" {
  export const env: {
    EGC_SUBMISSIONS?: {
      prepare(sql: string): {
        bind(...values: string[]): {
          run(): Promise<{ success: boolean }>;
        };
      };
    };
  };
}
