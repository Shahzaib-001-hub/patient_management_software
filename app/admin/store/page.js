"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, ExternalLink, Trash2, Upload, Image as ImageIcon } from "lucide-react";

export default function AdminStorePage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("products");
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "therapeutic_oil",
    volumeOrSize: "20 ml / 30 ml",
    price: "",
    stockQuantity: 20,
    price20ml: "1200",
    stock20ml: "25",
    price30ml: "1650",
    stock30ml: "20",
    imageUrl: "",
    description: "",
    usageInstructions: "",
  });

  const load = useCallback(async () => {
    const [pRes, oRes] = await Promise.all([
      fetch("/api/store/products?includeInactive=true"),
      fetch("/api/store/orders"),
    ]);
    if (pRes.ok) setProducts((await pRes.json()).products || []);
    if (oRes.ok) setOrders((await oRes.json()).orders || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/store/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingImg(false);
    if (res.ok && data.imageUrl) {
      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    setError("");
    const isOil = form.category === "therapeutic_oil";
    const variants = isOil
      ? [
          {
            label: "20 ml",
            price: Number(form.price20ml || 0),
            stockQuantity: Number(form.stock20ml || 0),
          },
          {
            label: "30 ml",
            price: Number(form.price30ml || 0),
            stockQuantity: Number(form.stock30ml || 0),
          },
        ]
      : [];

    const payload = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      volumeOrSize: isOil ? "20 ml / 30 ml" : form.volumeOrSize,
      price: isOil ? Number(form.price20ml || 0) : Number(form.price || 0),
      stockQuantity: isOil
        ? Number(form.stock20ml || 0) + Number(form.stock30ml || 0)
        : Number(form.stockQuantity || 0),
      variants,
      imageUrl: form.imageUrl,
      description: form.description,
      usageInstructions: form.usageInstructions,
    };

    const res = await fetch("/api/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create product");
      return;
    }

    setModalOpen(false);
    setForm({
      name: "",
      sku: "",
      category: "therapeutic_oil",
      volumeOrSize: "20 ml / 30 ml",
      price: "",
      stockQuantity: 20,
      price20ml: "1200",
      stock20ml: "25",
      price30ml: "1650",
      stock30ml: "20",
      imageUrl: "",
      description: "",
      usageInstructions: "",
    });
    load();
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" from the storefront?`)) return;
    await fetch(`/api/store/products/${product._id}`, { method: "DELETE" });
    load();
  }

  async function updateStock(id, nextStock) {
    await fetch(`/api/store/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: Math.max(0, nextStock) }),
    });
    load();
  }

  async function updateOrder(id, updates) {
    await fetch(`/api/store/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    load();
  }

  return (
    <AppShell>
      <PageHeader
        title="Clinic Storefront & Inventory"
        subtitle="Admin and Doctors can add products, upload product images, delete items, and manage orders"
        actions={
          <>
            <Link
              href="/store"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Public Store
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Product / Oil
            </button>
          </>
        }
      />

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold ${
            tab === "products"
              ? "bg-[#283983] text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Products &amp; Oils ({products.length})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold ${
            tab === "orders"
              ? "bg-[#283983] text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Store Orders ({orders.length})
        </button>
      </div>

      {tab === "products" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product / Oil</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 bg-[#F5F8FC]"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg border border-slate-200 bg-[#F5F8FC] flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#283983] font-semibold">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {p.volumeOrSize}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">
                        {p.category.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {p.variants?.length > 0
                        ? p.variants
                            .map((v) => `${v.label}: ${v.price}`)
                            .join(" | ")
                        : `${p.currency} ${p.price.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {p.stockQuantity}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => updateStock(p._id, p.stockQuantity + 10)}
                          className="px-2.5 py-1 rounded bg-[#EEF2FF] text-[#283983] font-semibold"
                        >
                          +10 Stock
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded bg-[#FEF2F2] text-[#BA2820] hover:bg-[#BA2820] hover:text-white transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No store orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold text-[#283983]">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {o.customerName}
                        </span>
                        <span className="text-slate-500">{o.customerPhone}</span>
                      </td>
                      <td className="py-3 px-4">
                        {o.items.map((i, idx) => (
                          <span key={idx} className="block">
                            {i.quantity}x {i.name}{" "}
                            {i.variantLabel ? `(${i.variantLabel})` : ""}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {o.currency} {o.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.paymentStatus}
                          onChange={(e) =>
                            updateOrder(o._id, { paymentStatus: e.target.value })
                          }
                          className="px-2 py-1 rounded border border-slate-200 bg-white"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.orderStatus}
                          onChange={(e) =>
                            updateOrder(o._id, { orderStatus: e.target.value })
                          }
                          className="px-2 py-1 rounded border border-slate-200 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Store Product / Therapeutic Oil"
      >
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-[#FEF2F2] text-xs text-[#BA2820]">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateProduct} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Product / Oil Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              required
              placeholder="SKU (e.g., PRWC-OIL-004) *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="therapeutic_oil">Therapeutic Oil (20ml / 30ml)</option>
              <option value="pain_relief_gel">Pain Relief Gel</option>
              <option value="braces_supports">Braces &amp; Supports</option>
              <option value="rehab_equipment">Rehab Equipment</option>
              <option value="supplements">Supplements</option>
            </select>
            {form.category !== "therapeutic_oil" && (
              <input
                type="text"
                placeholder="Volume / Size (e.g., 75 g)"
                value={form.volumeOrSize}
                onChange={(e) =>
                  setForm({ ...form, volumeOrSize: e.target.value })
                }
                className="px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            )}
          </div>

          {form.category === "therapeutic_oil" ? (
            <div className="p-3 rounded-xl bg-[#F5F8FC] border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Bottle Sizes (20 ml &amp; 30 ml)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="number"
                  required
                  placeholder="20 ml Price *"
                  value={form.price20ml}
                  onChange={(e) =>
                    setForm({ ...form, price20ml: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  required
                  placeholder="20 ml Stock *"
                  value={form.stock20ml}
                  onChange={(e) =>
                    setForm({ ...form, stock20ml: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  required
                  placeholder="30 ml Price *"
                  value={form.price30ml}
                  onChange={(e) =>
                    setForm({ ...form, price30ml: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  required
                  placeholder="30 ml Stock *"
                  value={form.stock30ml}
                  onChange={(e) =>
                    setForm({ ...form, stock30ml: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                required
                placeholder="Price (PKR) *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
              <input
                type="number"
                required
                placeholder="Initial Stock *"
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm({ ...form, stockQuantity: Number(e.target.value) })
                }
                className="px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
          )}

          {/* Product Image Upload or URL */}
          <div className="p-3 rounded-xl bg-[#F5F8FC] border border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#283983]" />
              Product Image (Upload or Paste URL)
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs flex-1"
              />
              <input
                type="text"
                placeholder="Or paste image URL (/images/store/...)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white flex-1"
              />
            </div>
            {uploadingImg && (
              <p className="text-[11px] text-[#283983]">Uploading image...</p>
            )}
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-20 w-24 object-cover rounded-lg border border-slate-200 bg-white"
              />
            )}
          </div>

          <textarea
            rows={2}
            placeholder="Product Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Usage Instructions"
            value={form.usageInstructions}
            onChange={(e) =>
              setForm({ ...form, usageInstructions: e.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
