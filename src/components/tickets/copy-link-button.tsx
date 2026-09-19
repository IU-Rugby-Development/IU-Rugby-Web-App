"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  return (
    <span><Button
      type="button"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setError(false);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch { setError(true); }
      }}
    >
      {copied ? "Copied!" : "Copy Link"}
    </Button><span role="status" className="ml-2 text-sm">{error ? "Copy unavailable. Select the link text to copy it." : copied ? "Link copied." : ""}</span></span>
  );
}
