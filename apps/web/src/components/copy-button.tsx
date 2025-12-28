"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
          <span className="text-xs">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Copy JSON</span>
        </>
      )}
    </Button>
  );
}
