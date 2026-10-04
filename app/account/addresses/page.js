"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  MoreHorizontal,
  Check,
  Edit3,
  Trash2,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/lib/services";
import { CustomDropdown, FormField } from "@/components/FormComponents";
import { INDIA_STATES, CITIES_BY_STATE } from "@/components/IndiaLocationData";

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

export default function AddressesPage() {
  const { user, refreshUser } = useAuth();
  const addresses = user?.addresses || [];

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

  const handleAddAddress = () => {
    if (addresses.length >= 3) {
      alert("You can save maximum 3 addresses.");
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
    if (!window.confirm("Delete this address?")) return;
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
      <div className="relative bg-gradient-to-r from-blue-50 via-[#FFF0E8] to-emerald-50 rounded-3xl overflow-hidden border border-orange-50 shadow-sm">
        <div className="p-6 pr-48">
          <h1 className="text-3xl font-black text-[#142653] flex items-center gap-2 mb-1">
            My Addresses <span className="text-coral">📍</span>
          </h1>
          <p className="text-[#142653]/60 font-medium text-sm">
            Manage your delivery addresses for a faster checkout.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <SectionHeader
          icon={<MapPin className="w-5 h-5 text-coral" />}
          title="Saved Addresses"
          subtitle="Manage your delivery addresses (max 3)."
          action={
            <button
              type="button"
              onClick={handleAddAddress}
              disabled={addresses.length >= 3}
              className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                addresses.length >= 3
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-[#142653] bg-gray-50 border border-gray-100 hover:bg-[#FFF0E8]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {addresses.length >= 3 ? "Maximum 3 Addresses" : "Add New Address"}
            </button>
          }
        />

        {addresses.length === 0 ? (
          <div className="text-center py-10">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
             </div>
             <p className="text-[#142653]/60 font-medium">You haven't saved any addresses yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border-2 border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFF0E8] flex items-center justify-center">
                      {addr.type === "Home" ? (
                        <Home className="w-3.5 h-3.5 text-coral" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5 text-coral" />
                      )}
                    </div>
                    <span className="font-black text-[#142653] text-sm">{addr.type}</span>
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-[#142653]/40" />
                  </button>
                </div>
                <p className="font-bold text-[#142653] text-sm">{addr.name}</p>
                <p className="text-xs text-[#142653]/60 font-medium mt-1">{addr.street}</p>
                <p className="text-xs text-[#142653]/60 font-medium">
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                {addr.phone && (
                  <p className="text-xs text-[#142653]/60 font-medium">{addr.phone}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  {addr.isDefault ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Default Address
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr._id)}
                      className="text-[10px] font-bold text-[#142653]/50 hover:text-coral transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(addr)}
                      className="text-xs font-bold text-[#142653]/60 flex items-center gap-1 hover:text-[#142653] transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-xs font-bold text-red-400 flex items-center gap-1 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {addressOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[#142653]">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <p className="text-xs text-[#142653]/50 mt-1">
                  {editingAddress ? "Update your delivery address" : "Add a new delivery address"}
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
              <div>
                <label className="block text-xs font-black text-[#142653]/50 mb-1.5">Address Type</label>
                <CustomDropdown
                  options={["Home", "Office", "Other"]}
                  value={addressForm.type}
                  searchable={false}
                  accentColor="blue"
                  onChange={(val) => setAddressForm((prev) => ({ ...prev, type: val }))}
                />
              </div>

              <FormField
                label="Name"
                required
                accentColor="blue"
                value={addressForm.name}
                placeholder="Full name"
                onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))}
              />

              <FormField
                label="Street / Address"
                required
                accentColor="blue"
                value={addressForm.street}
                placeholder="House no, building, street"
                onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomDropdown
                  label="State"
                  required
                  accentColor="blue"
                  options={INDIA_STATES}
                  value={addressForm.state}
                  placeholder="Select State"
                  onChange={(val) => setAddressForm((prev) => ({ ...prev, state: val, city: "" }))}
                />
                <CustomDropdown
                  label="City"
                  required
                  accentColor="blue"
                  options={addressForm.state ? (CITIES_BY_STATE[addressForm.state] || []) : []}
                  value={addressForm.city}
                  placeholder={addressForm.state ? "Select City" : "Select state first"}
                  disabled={!addressForm.state}
                  onChange={(val) => setAddressForm((prev) => ({ ...prev, city: val }))}
                />
              </div>

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
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-bold text-[#142653]">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                />
                Make this my default address
              </label>

              <button
                type="submit"
                disabled={addressLoading}
                className="w-full bg-[#142653] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addressLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> {editingAddress ? "Update Address" : "Save Address"}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
