"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HeartPulse,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Droplets,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "therapeutic_oil", label: "Therapeutic Oils (20ml / 30ml)" },
  { id: "pain_relief_gel", label: "Pain Relief Gels" },
  { id: "braces_supports", label: "Braces & Supports" },
  { id: "rehab_equipment", label: "Rehab Equipment" },
  { id: "supplements", label: "Supplements" },
];

function ProductCard({ product, onAddToCart }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.variants[0].label : product.volumeOrSize || ""
  );
  const [qty, setQty] = useState(1);

  const activeVariant = hasVariants
    ? product.variants.find((v) => v.label === selectedVariant) ||
      product.variants[0]
    : null;

  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayStock = activeVariant
    ? activeVariant.stockQuantity
    : product.stockQuantity;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-[#F5F8FC] border-b border-slate-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Droplets className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              variant={
                product.category === "therapeutic_oil" ? "accent" : "primary"
              }
            >
              {product.category.replace(/_/g, " ")}
            </Badge>
          </div>
          {product.volumeOrSize && !hasVariants && (
            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
              {product.volumeOrSize}
            </span>
          )}
        </div>

        {/* Name & Description */}
        <div className="p-5 space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.usageInstructions && (
            <p className="text-[11px] text-slate-500 bg-[#F5F8FC] p-2.5 rounded-lg border border-slate-100">
              <strong>Usage:</strong> {product.usageInstructions}
            </p>
          )}

          {/* 20 ml / 30 ml Size Selector for Oils */}
          {hasVariants && (
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Bottle Size
              </span>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const active = v.label === selectedVariant;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v.label);
                        setQty(1);
                      }}
                      className={`px-3 py-2 rounded-xl border text-left transition-all ${
                        active
                          ? "border-[#283983] bg-[#EEF2FF] text-[#283983] shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block font-mono text-xs font-bold">
                        {v.label}
                      </span>
                      <span className="block font-mono text-[11px] opacity-85">
                        {product.currency} {v.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price, Quantity & Add to Cart */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono font-bold text-lg text-[#283983]">
              {product.currency} {displayPrice.toLocaleString()}
            </span>
            <span className="block text-[11px] text-slate-500">
              {displayStock > 0 ? `${displayStock} available` : "Out of stock"}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-[#F5F8FC]">
            <button
              type="button"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-xs font-bold text-slate-900">
              {qty}
            </span>
            <button
              type="button"
              disabled={qty >= displayStock}
              onClick={() => setQty((q) => Math.min(displayStock, q + 1))}
              className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={displayStock <= 0}
          onClick={() =>
            onAddToCart({
              productId: product._id,
              name: product.name,
              variantLabel: activeVariant ? activeVariant.label : product.volumeOrSize || "",
              price: displayPrice,
              stockQuantity: displayStock,
              quantity: qty,
              imageUrl: product.imageUrl,
            })
          }
          className="w-full py-2.5 rounded-xl bg-[#283983] hover:bg-[#1d2a66] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors"
        >
          {displayStock > 0
            ? `Add to Cart${activeVariant ? ` (${activeVariant.label})` : ""}`
            : "Sold Out"}
        </button>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [checkout, setCheckout] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shippingAddress: "",
    paymentMethod: "cash_on_delivery",
    notes: "",
  });

  const loadProducts = useCallback(async () => {
    const res = await fetch(`/api/store/products?category=${category}`);
    if (res.ok) {
      const d = await res.json();
      setProducts(d.products || []);
    }
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setCheckout((prev) => ({
            ...prev,
            customerName: prev.customerName || d.user.name || "",
            customerPhone: prev.customerPhone || d.user.phone || "",
            customerEmail: prev.customerEmail || d.user.email || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId && i.variantLabel === item.variantLabel
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantLabel === item.variantLabel
            ? {
                ...i,
                quantity: Math.min(i.stockQuantity, i.quantity + item.quantity),
              }
            : i
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }

  function updateCartQty(productId, variantLabel, delta) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.variantLabel === variantLabel
            ? {
                ...i,
                quantity: Math.min(i.stockQuantity, Math.max(0, i.quantity + delta)),
              }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    cart.length === 0 || checkout.paymentMethod === "clinic_pickup" ? 0 : 250;
  const totalAmount = subtotal + shippingFee;

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/store/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...checkout,
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          variantLabel: c.variantLabel,
          quantity: c.quantity,
        })),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Could not place order");
      return;
    }
    setOrderSuccess(data.order);
    setCart([]);
    loadProducts();
  }

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <img
              src="/images/brand-logo.png"
              alt="Pain Relief & Wellness Center"
              className="h-9 w-40 object-cover object-center"
            />
            <span className="hidden md:inline-block text-xs font-semibold text-slate-500 border-l border-slate-200 pl-3">
              Wellness &amp; Therapy Store
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block px-3.5 py-2 text-xs font-semibold text-[#283983] hover:bg-[#EEF2FF] rounded-lg"
            >
              Patient / Staff Portal
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Hero Banner */}
        <div className="bg-[#283983] text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold">
              <Droplets className="w-3.5 h-3.5" />
              Clinic-Formulated Oils in 20 ml &amp; 30 ml Bottles
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Therapeutic Pain Relief Oils &amp; Rehabilitation Gear
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Choose 20 ml travel size or 30 ml clinical value bottles for our
              herbal joint oils, magnesium oils, and spine formulas, alongside
              orthopedic supports and rehab equipment.
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search oils, gels, supports..."
            className="w-full md:w-72 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                category === c.id
                  ? "bg-[#283983] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart & Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Your Wellness Cart
              </h2>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setOrderSuccess(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {orderSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    Order Confirmed!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Order Number:{" "}
                    <span className="font-mono font-bold">
                      {orderSuccess.orderNumber}
                    </span>
                  </p>
                  <p className="text-xs text-emerald-700">
                    Total: {orderSuccess.currency}{" "}
                    {orderSuccess.totalAmount.toLocaleString()} (
                    {orderSuccess.paymentMethod.replace(/_/g, " ")})
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">
                  Your cart is empty. Add oils or recovery products to begin.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantLabel}`}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {item.variantLabel ? `${item.variantLabel} • ` : ""}
                            PKR {item.price.toLocaleString()} &times;{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateCartQty(
                                item.productId,
                                item.variantLabel,
                                -1
                              )
                            }
                            className="p-1 rounded border border-slate-200 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.variantLabel, 1)
                            }
                            className="p-1 rounded border border-slate-200 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              updateCartQty(
                                item.productId,
                                item.variantLabel,
                                -item.quantity
                              )
                            }
                            className="p-1 rounded text-[#BA2820] hover:bg-[#FEF2F2]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-mono font-semibold">
                        PKR {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery Fee</span>
                      <span className="font-mono font-semibold">
                        PKR {shippingFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-bold text-[#283983]">
                      <span>Total</span>
                      <span className="font-mono">
                        PKR {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-[#FEF2F2] text-xs text-[#BA2820]">
                      {error}
                    </div>
                  )}

                  <form onSubmit={placeOrder} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Delivery &amp; Payment Details
                    </h3>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={checkout.customerName}
                      onChange={(e) =>
                        setCheckout({
                          ...checkout,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Phone Number *"
                      value={checkout.customerPhone}
                      onChange={(e) =>
                        setCheckout({
                          ...checkout,
                          customerPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Delivery Address *"
                      value={checkout.shippingAddress}
                      onChange={(e) =>
                        setCheckout({
                          ...checkout,
                          shippingAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                    <select
                      value={checkout.paymentMethod}
                      onChange={(e) =>
                        setCheckout({
                          ...checkout,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="cash_on_delivery">
                        Cash on Delivery (+PKR 250)
                      </option>
                      <option value="bank_transfer">
                        Bank Transfer (+PKR 250)
                      </option>
                      <option value="clinic_pickup">
                        Clinic Pickup (Free)
                      </option>
                    </select>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-lg bg-[#BA2820] hover:bg-[#991f18] text-white text-sm font-semibold"
                    >
                      {submitting
                        ? "Placing Order..."
                        : `Place Order (PKR ${totalAmount.toLocaleString()})`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
