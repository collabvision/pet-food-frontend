"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Minus, Plus, Heart, Share2, Check, Shield, ArrowLeft } from "lucide-react";
import { productService } from "@/lib/services";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        if (res && res.success) {
          setProduct(res.data);
          if (res.data.unit) setSelectedSize(res.data.unit);
          if (res.data.images?.length > 0) setSelectedImage(res.data.images[0].url);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Placeholder sizes if product doesn't have multiple variations
  const sizes = product.unit ? [product.unit, "10 kg", "15 kg"] : ["3 kg", "10 kg", "15 kg"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8 items-center">
        <button onClick={() => router.back()} className="flex items-center hover:text-gray-900 mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gray-900">Dog Food</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="lg:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 flex items-center justify-center p-8 border border-gray-100">
            <img 
              src={selectedImage || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"} 
              alt={product.name} 
              className="object-contain w-full h-full drop-shadow-xl"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {(product.images?.length > 0 ? product.images : [{url: selectedImage}]).map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedImage(img.url)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === img.url ? 'border-blue-600' : 'border-gray-200'} bg-gray-50 p-2`}
              >
                <img src={img.url} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          
          {/* Trust Badges */}
          <div className="flex justify-between items-center mt-8 py-4 border-t border-b border-gray-100">
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                <Check className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">Vet<br/>Recommended</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="bg-green-50 p-3 rounded-full text-green-600">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">100%<br/>Original</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">Easy<br/>Returns</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
            <div className="flex gap-3">
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="text-gray-400 hover:text-blue-500 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">4.8 (1,234 reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-400 line-through mb-1">₹{product.compareAtPrice}</span>
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded mb-1">
                  {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description || "Complete and balanced nutrition for large breeds. Supports bone & joint health, digestive health and ideal weight."}
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">Size <span className="ml-2 text-gray-400 text-xs">(Clear)</span></h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2 rounded-lg border font-medium transition-all ${
                    selectedSize === size
                      ? "border-blue-900 bg-blue-900 text-white shadow-md"
                      : "border-gray-200 text-gray-700 hover:border-blue-900 hover:text-blue-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white overflow-hidden shadow-sm">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button 
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`flex-1 font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-95 ${addedToCart ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-900 hover:bg-blue-800 text-white'}`}
            >
              {addingToCart ? "Adding..." : addedToCart ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Buy Now
            </button>
          </div>
          
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center justify-center text-sm text-orange-800 font-medium gap-2">
             <span className="text-lg">⚡</span> Fast checkout process with FurNest. Free Delivery.
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 border-t border-gray-200 pt-8">
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          {["Description", "Ingredients", "Feeding Guide", "Reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "text-blue-900 border-b-2 border-blue-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="py-4 text-gray-600 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2 space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div> Supports bone & joint health</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div> Promotes ideal weight</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div> Highly digestible proteins</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div> Enriched with Omega fatty acids</li>
            </ul>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
             <div className="text-3xl md:text-5xl font-bold text-blue-900 transform -rotate-6 text-center italic drop-shadow-md z-10 absolute bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                Stronger<br/>Happier<br/>Together <span className="text-red-500">♥</span>
             </div>
             <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1" alt="Happy Dog" className="w-full max-w-sm rounded-3xl opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
