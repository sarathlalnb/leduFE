const Button = ({ children, variant = "primary", ...props }) => {
  const baseClasses = "py-2 rounded-lg text-white font-medium transition";

  const variants = {
    primary: "gradient-bg hover:opacity-90",
    secondary: "bg-gray-500 hover:bg-gray-600",
    danger: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${props.className || ""}`}
    >
      {children}
    </button>
  );
};

export default Button;