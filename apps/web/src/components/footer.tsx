import type { SVGProps } from "react";

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <title>LinkedIn</title>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <title>X</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-2 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-gray-500">
            &copy; {currentYear} Devbrew LLC. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span>Built by</span>
            <a
              href="https://www.devbrew.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors underline decoration-dotted underline-offset-2"
            >
              Devbrew
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/devbrewco"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
              aria-label="Devbrew on LinkedIn"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/devbrewai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
              aria-label="Devbrew on X"
            >
              <XIcon className="h-4 w-4" />
            </a>
            {/* <a
              href="mailto:hello@devbrew.ai"
              className="hover:text-gray-900 transition-colors"
            >
              Contact: hello@devbrew.ai
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
