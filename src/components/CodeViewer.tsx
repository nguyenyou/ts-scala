import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function CodeViewer({ code }: { code: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    codeToHtml(code, {
      lang: 'scala',
      theme: 'github-light'
    }).then((html) => {
      setHtml(html);
    });
  }, [code]);

  return (
    <pre
      className="text-sm"
      dangerouslySetInnerHTML={{
        __html: html || code,
      }}
    />
  );
}