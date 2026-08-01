export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Chặn "</script>" injection khi serialize nội dung vào HTML.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
