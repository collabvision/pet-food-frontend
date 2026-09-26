"use client";

import { useState } from "react";
import {
  User, Mail, Phone, ShieldCheck, Lock, Bell, Trash2,
  Edit3, Camera, Plus, MapPin, PawPrint, ChevronRight,
  Check, X, Eye, EyeOff, MoreHorizontal, Save, Loader2,
  AlertTriangle, ToggleLeft, ToggleRight, Calendar, UserCheck,
  Home, Briefcase
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/lib/services";

/* ─── Toggle Switch Component ─── */
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center ${
        checked ? "bg-[#142653]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-black text-[#142653] text-base">{title}</h3>
          <p className="text-xs text-[#142653]/50 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  /* ── Change password state ── */
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  /* ── Notification prefs ── */
  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    offersPromos: true,
    petCareTips: true,
    prescriptionUpdates: false,
  });

  /* ── Sample addresses (no API yet) ── */
  const [addresses] = useState([
    {
      id: "1", type: "Home", name: user?.name || "Riya Sharma",
      line1: "A-101, Sunshine Apartments", line2: "123 Green Park, Near City Mall",
      city: "Bangalore", state: "Karnataka", pincode: "560001",
      isDefault: true,
    },
    {
      id: "2", type: "Office", name: user?.name || "Riya Sharma",
      line1: "2nd Floor, Tech Park Building", line2: "Outer Ring Road, Bellandur",
      city: "Bangalore", state: "Karnataka", pincode: "560103",
      isDefault: false,
    },
  ]);

  /* ── Sample pets (no API yet) ── */
  const [pets] = useState([
    { id: "1", name: "Bruno", type: "Dog", breed: "Golden Retriever", age: "2 Years", gender: "Male", weight: "28 kg", emoji: "🐶" },
    { id: "2", name: "Luna", type: "Cat", breed: "Domestic Short Hair", age: "1 Year", gender: "Female", weight: "4 kg", emoji: "🐱" },
  ]);

  /* ── Member since ── */
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ── Handle password change ── */
  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pw.current || !pw.newPw || !pw.confirm) {
      setPwMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pw.newPw.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    try {
      setPwLoading(true);
      await authService.changePassword(pw.current, pw.newPw, pw.confirm);
      setPwMsg({ type: "success", text: "Password updated successfully!" });
      setPw({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwOpen(false), 1500);
    } catch (err) {
      setPwMsg({ type: "error", text: err?.message || "Failed to update password." });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative bg-gradient-to-r from-blue-50 via-[#FFF0E8] to-emerald-50 rounded-3xl overflow-hidden border border-orange-50 shadow-sm">
        <div className="p-6 pr-48">
          <h1 className="text-3xl font-black text-[#142653] flex items-center gap-2 mb-1">
            My Profile <span className="text-coral">❤️</span>
          </h1>
          <p className="text-[#142653]/60 font-medium text-sm">
            Manage your personal information, addresses, pets and preferences.
          </p>
        </div>
        {/* decorative illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-48 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-7xl select-none">
            🐕🐈
          </div>
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-black text-[#142653] shadow-sm">
            Good Pets<br />Brighter Days! ☀️
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ════ LEFT 2/3 ════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Personal Information ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<User className="w-5 h-5 text-coral" />}
              title="Personal Information"
              subtitle="Keep your details updated for a seamless experience."
              action={
                <button className="flex items-center gap-1.5 text-sm font-bold text-[#142653] border-2 border-gray-100 px-4 py-2 rounded-xl hover:border-coral hover:text-coral transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              }
            />

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 self-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral to-orange-300 flex items-center justify-center text-3xl font-black text-white shadow-lg ring-4 ring-white">
                  {initials}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#142653] rounded-full flex items-center justify-center shadow-lg hover:bg-coral transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Info grid */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-black text-[#142653]">{user?.name || "—"}</h2>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    🐾 Pet Parent
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Email */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Mail className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">Email</p>
                      <p className="text-sm font-bold text-[#142653] truncate">{user?.email || "—"}</p>
                    </div>
                    {user?.isEmailVerified && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Phone className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">Phone</p>
                      <p className="text-sm font-bold text-[#142653]">{user?.phone || "Not added"}</p>
                    </div>
                  </div>

                  {/* Member since */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <UserCheck className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">Member Since</p>
                      <p className="text-sm font-bold text-[#142653]">{memberSince}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <ShieldCheck className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">Account Type</p>
                      <p className="text-sm font-bold text-[#142653]">{user?.role === "ADMIN" ? "Administrator" : "Standard User"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Saved Addresses ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<MapPin className="w-5 h-5 text-coral" />}
              title="Saved Addresses"
              subtitle="Manage your delivery addresses."
              action={
                <button className="flex items-center gap-1.5 text-sm font-bold text-[#142653] bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl hover:bg-[#FFF0E8] hover:border-coral/30 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              }
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF0E8] flex items-center justify-center">
                        {addr.type === "Home"
                          ? <Home className="w-3.5 h-3.5 text-coral" />
                          : <Briefcase className="w-3.5 h-3.5 text-coral" />}
                      </div>
                      <span className="font-black text-[#142653] text-sm">{addr.type}</span>
                    </div>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-[#142653]/40" />
                    </button>
                  </div>
                  <p className="font-bold text-[#142653] text-sm">{addr.name}</p>
                  <p className="text-xs text-[#142653]/60 font-medium mt-1">{addr.line1}</p>
                  <p className="text-xs text-[#142653]/60 font-medium">{addr.line2}</p>
                  <p className="text-xs text-[#142653]/60 font-medium">{addr.city}, {addr.state} – {addr.pincode}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    {addr.isDefault
                      ? <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Default Address
                        </span>
                      : <button className="text-[10px] font-bold text-[#142653]/50 hover:text-coral transition-colors">Set as Default</button>
                    }
                    <div className="flex gap-2">
                      <button className="text-xs font-bold text-[#142653]/60 flex items-center gap-1 hover:text-[#142653] transition-colors">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button className="text-xs font-bold text-red-400 flex items-center gap-1 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── My Pets ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<PawPrint className="w-5 h-5 text-coral" />}
              title="My Pets"
              subtitle="Manage your pet profiles for personalized recommendations."
              action={
                <button className="flex items-center gap-1.5 text-sm font-bold text-[#142653] bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl hover:bg-[#FFF0E8] hover:border-coral/30 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Pet
                </button>
              }
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {pets.map(pet => (
                <div key={pet.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] flex items-center justify-center text-2xl flex-shrink-0">
                        {pet.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-[#142653]">{pet.name}</p>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit3 className="w-3 h-3 text-[#142653]/40" />
                          </button>
                        </div>
                        <p className="text-xs text-[#142653]/50 font-medium">{pet.type} · {pet.breed}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#142653]/20 group-hover:text-coral transition-colors" />
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                    {[
                      { icon: "🎂", label: pet.age },
                      { icon: pet.gender === "Male" ? "♂️" : "♀️", label: pet.gender },
                      { icon: "⚖️", label: pet.weight },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-1 text-[11px] font-bold text-[#142653]/60">
                        <span>{d.icon}</span> {d.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT 1/3 ════ */}
        <div className="space-y-6">

          {/* ── Account Security ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<Lock className="w-5 h-5 text-coral" />}
              title="Account Security"
              subtitle="Manage your password and security settings."
            />

            {[
              {
                icon: <Lock className="w-4 h-4 text-[#142653]/60" />,
                title: "Change Password",
                sub: "Update your password regularly",
                onClick: () => { setPwOpen(v => !v); setPwMsg(null); },
              },
              {
                icon: <ShieldCheck className="w-4 h-4 text-[#142653]/60" />,
                title: "Two-Factor Authentication",
                sub: "Add an extra layer of security",
                onClick: () => {},
              },
              {
                icon: <UserCheck className="w-4 h-4 text-[#142653]/60" />,
                title: "Login Activity",
                sub: "View your recent login activity",
                onClick: () => {},
              },
            ].map(item => (
              <button
                key={item.title}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF8F5] transition-colors group mb-1 last:mb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#FFF0E8] transition-colors">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#142653]">{item.title}</p>
                    <p className="text-[11px] text-[#142653]/40 font-medium">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-[#142653]/30 group-hover:text-coral transition-all ${pwOpen && item.title === "Change Password" ? "rotate-90 text-coral" : ""}`} />
              </button>
            ))}

            {/* Change Password Form */}
            {pwOpen && (
              <div className="mt-3 pt-4 border-t border-gray-100">
                {pwMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl mb-3 text-xs font-semibold ${
                    pwMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    {pwMsg.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}
                <form onSubmit={handleChangePw} className="space-y-3">
                  {[
                    { key: "current", label: "Current Password", placeholder: "••••••••" },
                    { key: "newPw",   label: "New Password",     placeholder: "Min 8 characters" },
                    { key: "confirm", label: "Confirm Password", placeholder: "Repeat new password" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-black text-[#142653]/50 uppercase tracking-wider mb-1">{f.label}</label>
                      <div className="relative">
                        <input
                          type={showPw[f.key] ? "text" : "password"}
                          value={pw[f.key]}
                          onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full pr-9 pl-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 transition-all font-medium text-[#142653] bg-gray-50"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#142653]/30 hover:text-[#142653] transition-colors"
                        >
                          {showPw[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full bg-[#142653] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#142653]/90 transition-all disabled:opacity-60"
                  >
                    {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Update Password</>}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Notification Preferences ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<Bell className="w-5 h-5 text-coral" />}
              title="Notification Preferences"
              subtitle="Choose what updates you want to receive."
            />

            <div className="space-y-3">
              {[
                { key: "orderUpdates",        icon: "📦", label: "Order Updates",        sub: "Get notified about your orders" },
                { key: "offersPromos",        icon: "🎁", label: "Offers & Promotions",  sub: "Receive exclusive deals and offers" },
                { key: "petCareTips",         icon: "🐾", label: "Pet Care Tips",        sub: "Get helpful pet care content" },
                { key: "prescriptionUpdates", icon: "💊", label: "Prescription Updates", sub: "Reminders and prescription status" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FFF0E8] rounded-xl flex items-center justify-center text-base">
                      {n.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#142653]">{n.label}</p>
                      <p className="text-[11px] text-[#142653]/40 font-medium">{n.sub}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={notifs[n.key]}
                    onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Delete Account ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-[#142653] text-base">Delete Account</h3>
                <p className="text-xs text-[#142653]/50 font-medium">Permanently delete your account and all data.</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-all">
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
