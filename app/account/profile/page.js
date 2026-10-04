"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Bell,
  Trash2,
  Edit3,
  Camera,
  Plus,
  MapPin,
  PawPrint,
  ChevronRight,
  Check,
  X,
  Eye,
  EyeOff,
  MoreHorizontal,
  Save,
  Loader2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Calendar,
  UserCheck,
  Home,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/lib/services";
import { CustomDropdown, FormField } from "@/components/FormComponents";
import { INDIA_STATES, CITIES_BY_STATE } from "@/components/IndiaLocationData";

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
          <p className="text-xs text-[#142653]/50 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  /* ── Change password state ── */

  /* ─────────────────────────────────────
     Personal Information
  ───────────────────────────────────── */

  const [profileOpen, setProfileOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);

  /* ─────────────────────────────────────
     Address
  ───────────────────────────────────── */

  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const [addressForm, setAddressForm] = useState({
    type: "Home",
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  /* ─────────────────────────────────────
     Pet
  ───────────────────────────────────── */

  const [petOpen, setPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petLoading, setPetLoading] = useState(false);

  const [petForm, setPetForm] = useState({
    name: "",
    type: "Dog",
    breed: "",
    dateOfBirth: "",
    gender: "Male",
    weight: "",
    weightUnit: "kg",
  });

  /* ─────────────────────────────────────
     Change password state
  ───────────────────────────────────── */
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });
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
  /* ── Addresses from logged-in user ── */
  const addresses = user?.addresses || [];

  /* ── Pets from logged-in user ── */
  const pets = user?.pets || [];

  /* ── Member since ── */
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  /* ─────────────────────────────────────
   Personal Information
───────────────────────────────────── */

  const handleOpenProfile = () => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
    });

    setProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);

      await authService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      });

      await refreshUser();

      setProfileOpen(false);
    } catch (error) {
      alert(error?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

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
      setPwMsg({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    try {
      setPwLoading(true);
      await authService.changePassword(pw.current, pw.newPw, pw.confirm);
      setPwMsg({ type: "success", text: "Password updated successfully!" });
      setPw({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwOpen(false), 1500);
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err?.message || "Failed to update password.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  /* ─────────────────────────────────────
   Pets
───────────────────────────────────── */

  const handleAddPet = () => {
    if (pets.length >= 2) {
      alert("You can add maximum 2 pets.");
      return;
    }

    setEditingPet(null);

    setPetForm({
      name: "",
      type: "Dog",
      breed: "",
      dateOfBirth: "",
      gender: "Male",
      weight: "",
      weightUnit: "kg",
    });

    setPetOpen(true);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);

    setPetForm({
      name: pet.name || "",
      type: pet.type || "Dog",
      breed: pet.breed || "",
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.substring(0, 10) : "",
      gender: pet.gender || "Other",
      weight: pet.weight || "",
      weightUnit: pet.weightUnit || "kg",
    });

    setPetOpen(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();

    try {
      setPetLoading(true);

      const data = {
        ...petForm,
        weight: petForm.weight ? Number(petForm.weight) : null,
      };

      if (editingPet) {
        await authService.updatePet(editingPet._id, data);
      } else {
        await authService.addPet(data);
      }

      await refreshUser();

      setPetOpen(false);
      setEditingPet(null);
    } catch (error) {
      alert(error?.message || "Failed to save pet");
    } finally {
      setPetLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Delete this pet?")) {
      return;
    }

    try {
      await authService.deletePet(petId);

      await refreshUser();
    } catch (error) {
      alert(error?.message || "Failed to delete pet");
    }
  };
  /* ─────────────────────────────────────
   Address
───────────────────────────────────── */

  const handleAddAddress = () => {
    if (addresses.length >= 2) {
      alert("You can save maximum 2 addresses.");
      return;
    }

    setEditingAddress(null);

    setAddressForm({
      type: "Home",
      name: user?.name || "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      phone: user?.phone || "",
      isDefault: addresses.length === 0,
    });

    setAddressOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);

    setAddressForm({
      type: address.type || "Home",
      name: address.name || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      phone: address.phone || "",
      isDefault: Boolean(address.isDefault),
    });

    setAddressOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      setAddressLoading(true);

      if (editingAddress) {
        await authService.updateAddress(editingAddress._id, addressForm);
      } else {
        await authService.addAddress(addressForm);
      }

      await refreshUser();

      setAddressOpen(false);
      setEditingAddress(null);
    } catch (error) {
      alert(error?.message || "Failed to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) {
      return;
    }

    try {
      await authService.deleteAddress(addressId);

      await refreshUser();
    } catch (error) {
      alert(error?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await authService.setDefaultAddress(addressId);

      await refreshUser();
    } catch (error) {
      alert(error?.message || "Failed to set default address");
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
            Good Pets
            <br />
            Brighter Days! ☀️
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
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#142653] border-2 border-gray-100 px-4 py-2 rounded-xl hover:border-coral hover:text-coral transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              }
            />

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 self-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral to-orange-300 flex items-center justify-center text-3xl font-black text-white shadow-lg ring-4 ring-white">
                  {initials}
                </div>
              </div>

              {/* Info grid */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-black text-[#142653]">
                    {user?.name || "—"}
                  </h2>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    🐾 Pet Parent
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Email */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <Mail className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-bold text-[#142653] truncate">
                        {user?.email || "—"}
                      </p>
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
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">
                        Phone
                      </p>
                      <p className="text-sm font-bold text-[#142653]">
                        {user?.phone || "Not added"}
                      </p>
                    </div>
                  </div>

                  {/* Member since */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <UserCheck className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">
                        Member Since
                      </p>
                      <p className="text-sm font-bold text-[#142653]">
                        {memberSince}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <ShieldCheck className="w-4 h-4 text-[#142653]/40 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#142653]/30 mb-0.5">
                        Account Type
                      </p>
                      <p className="text-sm font-bold text-[#142653]">
                        {user?.role === "ADMIN"
                          ? "Administrator"
                          : "Standard User"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── My Pets ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
            <SectionHeader
              icon={<PawPrint className="w-5 h-5 text-coral" />}
              title="My Pets"
              subtitle="Manage your pet profiles for personalized recommendations."
              action={
                <button
                  type="button"
                  onClick={handleAddPet}
                  disabled={pets.length >= 2}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#142653] bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl hover:bg-[#FFF0E8] hover:border-coral/30 transition-all disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />

                  {pets.length >= 2 ? "Maximum 2 Pets" : "Add Pet"}
                </button>
              }
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet._id}
                  className="border-2 border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors group"
                >
                  {/* Pet Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Pet Icon */}
                      <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] flex items-center justify-center text-2xl flex-shrink-0">
                        {pet.type === "Dog"
                          ? "🐶"
                          : pet.type === "Cat"
                            ? "🐱"
                            : pet.type === "Bird"
                              ? "🐦"
                              : "🐾"}
                      </div>

                      {/* Pet Name */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-[#142653]">
                            {pet.name}
                          </p>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleEditPet(pet)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FFF0E8] transition-colors"
                            title="Edit pet"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#142653]/50 hover:text-coral" />
                          </button>
                        </div>

                        <p className="text-xs text-[#142653]/50 font-medium">
                          {pet.type}
                          {pet.breed ? ` · ${pet.breed}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeletePet(pet._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Delete pet"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                    </button>
                  </div>

                  {/* Pet Details */}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                    {pet.dateOfBirth && (
                      <div className="text-[11px] font-bold text-[#142653]/60">
                        🎂{" "}
                        {new Date(pet.dateOfBirth).toLocaleDateString("en-IN")}
                      </div>
                    )}

                    {pet.gender && (
                      <div className="text-[11px] font-bold text-[#142653]/60">
                        {pet.gender === "Male" ? "♂️" : "♀️"} {pet.gender}
                      </div>
                    )}

                    {pet.weight && (
                      <div className="text-[11px] font-bold text-[#142653]/60">
                        ⚖️ {pet.weight} {pet.weightUnit || "kg"}
                      </div>
                    )}
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
                onClick: () => {
                  setPwOpen((v) => !v);
                  setPwMsg(null);
                },
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
            ].map((item) => (
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
                    <p className="text-sm font-bold text-[#142653]">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#142653]/40 font-medium">
                      {item.sub}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-[#142653]/30 group-hover:text-coral transition-all ${pwOpen && item.title === "Change Password" ? "rotate-90 text-coral" : ""}`}
                />
              </button>
            ))}

            {/* Change Password Form */}
            {pwOpen && (
              <div className="mt-3 pt-4 border-t border-gray-100">
                {pwMsg && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl mb-3 text-xs font-semibold ${
                      pwMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {pwMsg.type === "success" ? (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    )}
                    {pwMsg.text}
                  </div>
                )}
                <form onSubmit={handleChangePw} className="space-y-3">
                  {[
                    {
                      key: "current",
                      label: "Current Password",
                      placeholder: "••••••••",
                    },
                    {
                      key: "newPw",
                      label: "New Password",
                      placeholder: "Min 8 characters",
                    },
                    {
                      key: "confirm",
                      label: "Confirm Password",
                      placeholder: "Repeat new password",
                    },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-black text-[#142653]/50 uppercase tracking-wider mb-1">
                        {f.label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw[f.key] ? "text" : "password"}
                          value={pw[f.key]}
                          onChange={(e) =>
                            setPw((p) => ({ ...p, [f.key]: e.target.value }))
                          }
                          placeholder={f.placeholder}
                          className="w-full pr-9 pl-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 transition-all font-medium text-[#142653] bg-gray-50"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() =>
                            setShowPw((p) => ({ ...p, [f.key]: !p[f.key] }))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#142653]/30 hover:text-[#142653] transition-colors"
                        >
                          {showPw[f.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full bg-[#142653] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#142653]/90 transition-all disabled:opacity-60"
                  >
                    {pwLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>



          {/* ── Delete Account ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-[#142653] text-base">
                  Delete Account
                </h3>
                <p className="text-xs text-[#142653]/50 font-medium">
                  Permanently delete your account and all data.
                </p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-all">
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          </div>

          {/* ═══════════════════════════════════════
    PROFILE EDIT MODAL
═══════════════════════════════════════ */}

          {profileOpen && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-[#142653]">
                      Edit Personal Information
                    </h2>

                    <p className="text-xs text-[#142653]/50 mt-1">
                      Update your personal details
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Name */}

                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#142653]"
                      required
                    />
                  </div>

                  {/* Phone */}

                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#142653]"
                    />
                  </div>

                  {/* Email - read only */}

                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Email
                    </label>

                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400"
                    />

                    <p className="text-[10px] text-gray-400 mt-1">
                      Email cannot be changed here.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full bg-[#142653] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
    ADDRESS MODAL
═══════════════════════════════════════ */}

          {addressOpen && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-[#142653]">
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </h2>

                    <p className="text-xs text-[#142653]/50 mt-1">
                      {editingAddress
                        ? "Update your delivery address"
                        : "Add a new delivery address"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddressOpen(false)}
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Address Type
                    </label>
                    <CustomDropdown
                      options={["Home", "Office", "Other"]}
                      value={addressForm.type}
                      searchable={false}
                      accentColor="blue"
                      onChange={(val) =>
                        setAddressForm((prev) => ({ ...prev, type: val }))
                      }
                    />
                  </div>

                  {/* Name */}
                  <FormField
                    label="Name"
                    required
                    accentColor="blue"
                    value={addressForm.name}
                    placeholder="Full name"
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />

                  {/* Street */}
                  <FormField
                    label="Street / Address"
                    required
                    accentColor="blue"
                    value={addressForm.street}
                    placeholder="House no, building, street"
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                    }
                  />

                  {/* State + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDropdown
                      label="State"
                      required
                      accentColor="blue"
                      options={INDIA_STATES}
                      value={addressForm.state}
                      placeholder="Select State"
                      onChange={(val) =>
                        setAddressForm((prev) => ({ ...prev, state: val, city: "" }))
                      }
                    />
                    <CustomDropdown
                      label="City"
                      required
                      accentColor="blue"
                      options={addressForm.state ? (CITIES_BY_STATE[addressForm.state] || []) : []}
                      value={addressForm.city}
                      placeholder={addressForm.state ? "Select City" : "Select state first"}
                      disabled={!addressForm.state}
                      onChange={(val) =>
                        setAddressForm((prev) => ({ ...prev, city: val }))
                      }
                    />
                  </div>

                  {/* Pincode + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="Pincode"
                      required
                      accentColor="blue"
                      value={addressForm.pincode}
                      placeholder="560001"
                      maxLength={6}
                      inputMode="numeric"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setAddressForm((prev) => ({ ...prev, pincode: val }));
                      }}
                    />
                    <FormField
                      label="Phone"
                      accentColor="blue"
                      type="tel"
                      value={addressForm.phone}
                      placeholder="+91 98765 43210"
                      maxLength={15}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </div>

                  {/* Default */}

                  <label className="flex items-center gap-2 text-sm font-bold text-[#142653]">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                    />
                    Make this my default address
                  </label>

                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="w-full bg-[#142653] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {addressLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingAddress ? "Update Address" : "Save Address"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
    PET MODAL
═══════════════════════════════════════ */}

          {petOpen && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-[#142653]">
                      {editingPet ? "Edit Pet" : "Add Pet"}
                    </h2>

                    <p className="text-xs text-[#142653]/50 mt-1">
                      {editingPet
                        ? "Update your pet information"
                        : "Add your pet information"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPetOpen(false);
                      setEditingPet(null);
                    }}
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePet} className="space-y-4">
                  {/* Pet Name */}
                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Pet Name
                    </label>

                    <input
                      type="text"
                      required
                      value={petForm.name}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter pet name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                    />
                  </div>

                  {/* Pet Type */}
                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Pet Type
                    </label>

                    <select
                      value={petForm.type}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Breed
                    </label>

                    <input
                      type="text"
                      value={petForm.breed}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      placeholder="Golden Retriever"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      value={petForm.dateOfBirth}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                    />
                  </div>

                  {/* Gender + Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                        Gender
                      </label>

                      <select
                        value={petForm.gender}
                        onChange={(e) =>
                          setPetForm((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#142653]/50 mb-1.5">
                        Weight
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={petForm.weight}
                          onChange={(e) =>
                            setPetForm((prev) => ({
                              ...prev,
                              weight: e.target.value,
                            }))
                          }
                          placeholder="10"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-coral"
                        />

                        <select
                          value={petForm.weightUnit}
                          onChange={(e) =>
                            setPetForm((prev) => ({
                              ...prev,
                              weightUnit: e.target.value,
                            }))
                          }
                          className="px-3 border border-gray-200 rounded-xl outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={petLoading}
                    className="w-full bg-[#142653] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#142653]/90 disabled:opacity-50"
                  >
                    {petLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />

                        {editingPet ? "Update Pet" : "Add Pet"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
