type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function prune(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(prune).filter((item) => item !== undefined);
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = prune(child);
      if (cleaned !== undefined) next[key] = cleaned;
    }
    return next;
  }
  return value === undefined ? undefined : value;
}

export default function JsonLd({ data }: JsonLdProps) {
  const cleaned = prune(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleaned) }}
    />
  );
}
