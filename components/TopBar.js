import { IconTruck, IconShield, IconWhatsApp, IconHeart } from './Icons';

export default function TopBar() {
  return (
    <div className="hidden bg-navy text-white sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <IconTruck /> Free shipping on orders above ₹999
          </span>
          <span className="flex items-center gap-1.5">
            <IconShield /> Vet approved products
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <IconShield /> 100% authentic &amp; safe
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://wa.me/" className="flex items-center gap-1.5 hover:text-coral">
            Need help? <IconWhatsApp /> WhatsApp us
          </a>
          <IconHeart className="opacity-90" />
        </div>
      </div>
    </div>
  );
}
