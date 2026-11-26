const styles = {
  error: 'bg-peach-100 text-peach-500',
  success: 'bg-mint-100 text-mint-500',
  info: 'bg-violet-50 text-violet-700',
};

export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  return <div className={`rounded-xl px-4 py-3 text-sm font-medium ${styles[type]}`}>{children}</div>;
}