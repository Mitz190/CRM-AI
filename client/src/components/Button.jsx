const styles = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  danger: 'bg-peach-100 text-peach-500 hover:bg-peach-500 hover:text-white',
};

export default function Button({ children, variant = 'primary', loading = false, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}