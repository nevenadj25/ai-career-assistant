import { Code2, Mail, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-600 md:flex-row">
        <div>
          © 2026{" "}
          <span className="font-semibold text-indigo-600">
            AI Career Assistant
          </span>
          . Sva prava zadržana.
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 transition hover:text-indigo-600">
            <Mail size={18} />
            Kontakt
          </button>

          <button className="flex items-center gap-2 transition hover:text-indigo-600">
            <Code2 size={18} />
            GitHub
          </button>

          <div className="flex items-center gap-2 text-pink-500">
            <Heart size={18} fill="currentColor" />
            Made with AI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
