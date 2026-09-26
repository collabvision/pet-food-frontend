"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Lock, ArrowLeft, Trash2, Minus, Plus, CreditCard, Wallet, Banknote, ShieldCheck, Truck, Headphones, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cartService, orderService, paymentService } from "@/lib/services";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");

  const [contact, setContact] = useState({
    email: "",
    phone: ""
  });

  const [address, setAddress] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    state: "",
    country: "India"
  });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await cartService.get();
      setCart(res?.data || null);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    
    if (user) {
      setContact(prev => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
      setAddress(prev => ({
        ...prev,
        name: user.name || prev.name
      }));
    }
  }, [fetchCart, user]);

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      if (newQuantity < 1) {
        await cartService.removeItem(productId);
      } else {
        await cartService.updateItem(productId, newQuantity);
      }
      await fetchCart();
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
    } catch (err) {
      console.error("Cart remove error:", err);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !contact.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      alert("Please fill in all required delivery and contact details.");
      return;
    }

    try {
      setIsProcessing(true);

      // Create Order
      const shippingAddress = {
        name: address.name,
        phone: contact.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country
      };

      const apiPaymentMethod = paymentMethod === "RAZORPAY" ? "ONLINE" : "COD";
      
      const orderRes = await orderService.create(shippingAddress, apiPaymentMethod);
      const order = orderRes.data?.order || orderRes.data;

      if (!order || !order._id) throw new Error("Failed to create order");

      if (paymentMethod === "RAZORPAY") {
        const res = await loadRazorpay();
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
        }

        const paymentRes = await paymentService.createOrder(order._id);
        const { razorpayOrderId, amount, currency, keyId } = paymentRes.data;

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "FurNest",
          description: "Purchase from FurNest",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await paymentService.verify(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              router.push(`/order/success/${order._id}`);
            } catch (err) {
              console.error(err);
              alert("Payment verification failed.");
            }
          },
          prefill: {
            name: address.name,
            email: contact.email,
            contact: contact.phone
          },
          theme: {
            color: "#ff6f4d"
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on("payment.failed", function (response) {
          alert("Payment failed! Please try again.");
          setIsProcessing(false);
        });

      } else {
        router.push(`/order/success/${order._id}`);
      }

    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || error?.message || "Failed to place order.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F5]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-navy"></div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 0 ? 0 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-navy mb-4">Your cart is empty</h2>
        <Link href="/products" className="bg-coral text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] pb-20 font-sans">
      <header className="bg-white/50 backdrop-blur-md sticky top-0 z-40 border-b border-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-coral rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm rotate-3">
                F
              </div>
              <div>
                <span className="block text-xl font-black text-navy leading-none">FurNest</span>
                <span className="text-[9px] font-bold text-navy/50">Happy Pets. Happier Humans.</span>
              </div>
            </Link>
            
            <Link href="/cart" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-navy hover:text-coral transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </div>
          
          <div className="flex items-center gap-2 text-navy">
            <Lock className="w-5 h-5 text-navy/80" />
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold leading-none">Secure Checkout</span>
              <span className="text-[10px] text-navy/50">Your information is safe with us</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-navy mb-2 flex items-center gap-3">
              Checkout <Heart className="w-8 h-8 text-coral fill-coral" />
            </h1>
            <p className="text-navy/70 font-medium">Almost there! Complete your order for a happier, healthier pet.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center justify-center gap-4 text-xs font-bold text-navy/50">
            <div className="flex items-center gap-2 text-coral">
              <div className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center">1</div>
              Delivery<br/>Address
            </div>
            <div className="w-12 h-px bg-coral/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center">2</div>
              Payment<br/>Method
            </div>
            <div className="w-12 h-px bg-navy/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center">3</div>
              Review<br/>& Place Order
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-coral/20"></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">Contact Information</h2>
                  <p className="text-sm text-navy/50">We'll use this information to keep you updated about your order.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                <div>
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={contact.email}
                    onChange={(e) => setContact({...contact, email: e.target.value})}
                    placeholder="riya.sharma@gmail.com"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={contact.phone}
                    onChange={(e) => setContact({...contact, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-coral"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Delivery Address</h2>
                    <p className="text-sm text-navy/50">We'll deliver your order to this address.</p>
                  </div>
                </div>
                <label className="hidden sm:flex items-center gap-2 cursor-pointer text-sm font-medium text-navy/70">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy" defaultChecked />
                  Save this address for future orders
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={address.name}
                    onChange={(e) => setAddress({...address, name: e.target.value})}
                    placeholder="Riya Sharma"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Address *</label>
                  <input 
                    type="text" 
                    value={address.addressLine1}
                    onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                    placeholder="123 Green Park, Near City Mall"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Apartment, Suite, etc. (Optional)</label>
                  <input 
                    type="text" 
                    value={address.addressLine2}
                    onChange={(e) => setAddress({...address, addressLine2: e.target.value})}
                    placeholder="A-101, Sunshine Apartments"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">Pincode *</label>
                  <input 
                    type="text" 
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    placeholder="560001"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">City *</label>
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      placeholder="Bangalore"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy/70 mb-1.5 ml-1">State *</label>
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      placeholder="Karnataka"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-navy/10"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">Payment Method</h2>
                  <p className="text-sm text-navy/50">Choose your preferred payment method.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-coral bg-coral/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="w-5 h-5 text-coral focus:ring-coral" 
                    />
                    <div>
                      <div className="font-bold text-navy flex items-center gap-2">
                        Razorpay <span className="text-[10px] font-bold bg-navy text-white px-2 py-0.5 rounded-full uppercase">Secure</span>
                      </div>
                      <div className="text-xs text-navy/60">Pay securely using UPI, Cards, Net Banking or Wallets</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-coral bg-coral/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-5 h-5 text-coral focus:ring-coral" 
                    />
                    <div>
                      <div className="font-bold text-navy flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-green-600" /> Cash on Delivery
                      </div>
                      <div className="text-xs text-navy/60">Pay when your order is delivered</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
              <div className="flex justify-between items-end pb-4 border-b border-gray-100 mb-4">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                  <svg className="w-6 h-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Order Summary
                </h2>
                <span className="text-sm font-bold text-navy/50">{cart?.totalItems || 0} items</span>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 border border-gray-100 flex-shrink-0 flex items-center justify-center relative group">
                      <img 
                        src={item.product.images?.[0]?.url || item.product.image || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"} 
                        alt={item.product.name} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-navy leading-tight line-clamp-2">{item.product.name}</h4>
                          <p className="text-[10px] text-navy/50 mt-0.5">{item.product.unit || "Unit"}</p>
                        </div>
                        <button onClick={() => handleRemoveItem(item.product._id)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm hover:text-coral transition-colors"
                          ><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold text-navy w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm hover:text-coral transition-colors"
                          ><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-sm font-black text-navy">₹{Number(item.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#FFF8F5] rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-coral mb-2 flex items-center gap-1"><span className="bg-coral text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">%</span> Apply Coupon Code</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-coral transition-colors"
                  />
                  <button className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-navy/90 transition-colors">Apply</button>
                </div>
              </div>

              <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-sm font-medium text-navy/70">
                  <span>Subtotal ({cart?.totalItems || 0} items)</span>
                  <span className="font-bold text-navy">₹{Number(subtotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-navy/70">
                  <span>Discount</span>
                  <span className="font-bold text-green-600">- ₹{discount}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-navy/70">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-lg font-extrabold text-navy">Total Amount</span>
                <span className="text-2xl font-black text-navy">₹{Number(total).toLocaleString("en-IN")}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-coral text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-coral/30 hover:bg-orange-500 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {isProcessing ? "Processing..." : (
                  <>
                    <Lock className="w-5 h-5" /> Place Order <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-navy/50 mt-3 font-medium">By placing this order, you agree to our Terms of Service and Privacy Policy.</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 grid grid-cols-4 gap-2 text-center divide-x divide-gray-100">
              <div className="flex flex-col items-center justify-center px-1">
                <Truck className="w-5 h-5 text-navy mb-1" />
                <span className="text-[9px] font-bold text-navy/80 leading-tight">Free Shipping<br/><span className="font-normal opacity-70">on orders above ₹999</span></span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <ShieldCheck className="w-5 h-5 text-navy mb-1" />
                <span className="text-[9px] font-bold text-navy/80 leading-tight">Secure<br/>Payments</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <svg className="w-5 h-5 text-navy mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span className="text-[9px] font-bold text-navy/80 leading-tight">Vet Approved<br/>Products</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <Headphones className="w-5 h-5 text-navy mb-1" />
                <span className="text-[9px] font-bold text-navy/80 leading-tight">24/7<br/>Support</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
      `}</style>
    </div>
  );
}
