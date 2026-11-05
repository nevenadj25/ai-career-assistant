import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="relative w-full">
      <input
        {...props}
        className="
          peer
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          w-full
          pt-5
          pb-2
          text-gray-900
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
        placeholder=" "
      />

      <label
        className="
          absolute
          left-4
          top-2
          text-sm
          text-gray-500
          transition-all
          peer-placeholder-shown:top-4
          peer-placeholder-shown:text-base
          peer-focus:top-2
          peer-focus:text-sm
          peer-focus:text-blue-500
        "
      >
        {label}
      </label>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
