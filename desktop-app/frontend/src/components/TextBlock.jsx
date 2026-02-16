function TextBlock({ children, className = "" }) {
    if (!children) return null;
    return (
        <p className={`text-zinc-300 leading-relaxed whitespace-pre-wrap ${className}`}>
            {children}
        </p>
    )
}

export default TextBlock
