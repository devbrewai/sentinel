import { Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-gray-500">
            &copy; {currentYear} Devbrew LLC. All rights reserved.
          </p>
          <a
            href="mailto:hello@devbrew.ai"
            className="flex items-center hover:text-gray-900 transition-colors"
          >
            Contact: hello@devbrew.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
