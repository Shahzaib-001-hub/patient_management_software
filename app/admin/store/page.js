"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, ExternalLink } from "lucide-react";

export default function AdminStorePage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("products");
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "therapeutic_oil",
    volumeOrSize: "100 ml",
    price: "",
    stockQuantity: 20,
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

  async function handleCreateProduct(e) {
    e.preventDefault();
    const res = await fetch("/api/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModalOpen(false);
      setForm({
        name: "",
        sku: "",
        category: "therapeutic_oil",
        volumeOrSize: "100 ml",
        price: "",
        stockQuantity: 20,
        description: "",
        usageInstructions: "",
      });
      load();
    }
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
        subtitle="Manage therapeutic oils, pain relief products, stock levels, and patient orders"
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
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product / Oil</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
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
                      {p.currency} {p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {p.stockQuantity}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => updateStock(p._id, p.stockQuantity + 10)}
                        className="px-2.5 py-1 rounded bg-[#EEF2FF] text-[#283983] font-semibold"
                      >
                        +10 Stock
                      </button>
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
                            {i.quantity}x {i.name}
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
              <option value="therapeutic_oil">Therapeutic Oil</option>
              <option value="pain_relief_gel">Pain Relief Gel</option>
              <option value="braces_supports">Braces &amp; Supports</option>
              <option value="rehab_equipment">Rehab Equipment</option>
              <option value="supplements">Supplements</option>
            </select>
            <input
              type="text"
              placeholder="Volume / Size (e.g., 100 ml)"
              value={form.volumeOrSize}
              onChange={(e) =>
                setForm({ ...form, volumeOrSize: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
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
