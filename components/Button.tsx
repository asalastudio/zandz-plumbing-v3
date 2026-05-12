import { cn } from "@/lib/cn";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  external?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#F96302] text-white hover:bg-[#e05602]",
  secondary: "bg-black text-white hover:bg-[#1a1a1a]",
  ghost: "bg-transparent text-black border border-black hover:bg-black hover:text-white",
  inverse: "bg-white text-black hover:bg-[#F5F5F5]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm md:text-base",
  lg: "px-8 py-4 text-base",
  xl: "px-10 py-5 text-base md:text-lg",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-none transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F96302] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

export function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  children,
  icon,
  iconPosition = "left",
  className,
  disabled,
  type = "button",
  external,
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  const content = (
    <>
      {icon && iconPosition === "left" && <span aria-hidden="true">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span aria-hidden="true">{icon}</span>}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
