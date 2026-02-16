/**
 * Button.jsx
 * Reusable button component.
 */
const variants = {
    primary: "bg-zinc-100 text-zinc-950 border border-zinc-100 hover:bg-white active:bg-zinc-200",
    secondary: "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-900",
    outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-700",
    danger: "bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-950/40 active:bg-red-950/50",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
    none: ""
}

function Button({ children, onClick, disabled = false, className = '', variant = 'primary', ...rest }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                px-3 py-1.5 text-xs font-semibold rounded-md 
                cursor-pointer transition-colors duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                outline-none focus:ring-2 focus:ring-zinc-500/20
                ${variants[variant] || variants.none}
                ${className}
            `}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button
