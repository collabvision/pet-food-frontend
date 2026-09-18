export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto flex max-w-7xl justify-center px-6 py-14">
      <div className="w-full max-w-md rounded-3xl border border-navy/8 bg-white p-8 shadow-sm">
        <p className="mb-6 text-center font-display text-2xl font-semibold text-navy">🐾 FurNest</p>
        <h1 className="text-center text-xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-navy/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
