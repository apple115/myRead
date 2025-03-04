interface RoundedButtonProps {
  onClick: () => void;
  title: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const RoundedButton: React.FC<RoundedButtonProps> = ({
  onClick,
  title,
  variant = "primary",
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`m-4 max-w-xs rounded-xl border border-gray-200 p-6 text-left text-inherit transition-colors 
      ${
        variant === "primary" 
          ? "bg-blue-600 text-white hover:bg-blue-700" 
          : "bg-white text-gray-700 hover:bg-gray-100"
      }
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer rounded-full border border-solid border-black/[.08] dark:border-white/[.145] 
      transition-colors flex items-center justify-center hover:border-transparent 
      text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44`}
  >
    {title}
  </button>
);
