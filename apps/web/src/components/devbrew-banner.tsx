"use client";

import { useState } from "react";
import { X, ArrowUpRight } from "lucide-react";

const STORAGE_KEY = "devbrew-banner-dismissed";

function getInitialVisibility() {
  if (typeof window === "undefined") return false;
  return !sessionStorage.getItem(STORAGE_KEY);
}

export function DevbrewBanner() {
  const [isVisible, setIsVisible] = useState(getInitialVisibility);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <a
          href="https://cal.com/joekariuki/devbrew?utm_source=sentinel.devbrew.ai&utm_medium=demo&utm_campaign=sentinel&utm_content=banner_cta"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-xs sm:text-sm font-medium text-white text-center hover:opacity-80 transition-opacity inline-flex items-center justify-center gap-1.5 text-balance"
        >
          <span>
            Need custom AI for your payments platform?{" "}
            <strong>Book a call with Devbrew's founder</strong>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0" />
        </a>
        <button
          onClick={handleClose}
          className="text-white opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
