import React from "react";

type ButtonVariant = "white" | "gray";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
}

export default function Button({
    variant = "white",
    children,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles =
        "px-4  py-1.5 md:py-2 rounded-full cursor-pointer text-base md:text-base md:font-semibold transition duration-200 focus:outline-none";

    const variants: Record<ButtonVariant, string> = {
        white: "bg-white text-black hover:bg-gray-100 border border-gray-300",
        gray: "bg-[#ffffff26] text-white hover:bg-[#131313] border-[0.3px] border-white/30 ",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}