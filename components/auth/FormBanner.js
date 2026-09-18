export default function FormBanner({ tone = 'error', children }) {
  const styles = tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest/10 text-forest';
  return (
    <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${styles}`} role="status">
      {children}
    </div>
  );
}
