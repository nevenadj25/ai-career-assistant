import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({
  children,
  loading = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={loading}
      className="
        flex
        w-full
        items-center
        justify-center
        rounded-xl
        bg-gradient-to-r
        from-blue-600
        to-purple-600
        px-6
        py-3
        font-semibold
        text-white
        shadow-lg
        transition
        hover:scale-[1.02]
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
