"use client";

import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
}

interface Event {
  id: number;
  name: string;
}

interface ProductEvent {
  id: number;
  product: Product;
  event: Event;
}

export default function ProductEventsPage() {
  const [productEvents, setProductEvents] = useState<ProductEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  const API_URL = "/api/product-events";
  const API_PRODUCTS = "/api/products";
  const API_EVENTS = "/api/events";

  // -----------------------------------------
  // Reusable fetch with Authorization support
  // -----------------------------------------
  const fetchAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          // kalau pernah punya token tinggal masukin di sini
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("[fetchAuth] Error:", error);
      return null;
    }
  };

  // -----------------------------------------
  // Fetch all initial data
  // -----------------------------------------
  const fetchData = async () => {
    const [peData, pData, eData] = await Promise.all([
      fetchAuth(API_URL),
      fetchAuth(API_PRODUCTS),
      fetchAuth(API_EVENTS),
    ]);

    // Guard agar tidak error kalau API return error object
    setProductEvents(Array.isArray(peData) ? peData : []);
    setProducts(Array.isArray(pData) ? pData : []);
    setEvents(Array.isArray(eData) ? eData : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -----------------------------------------
  // Handle multi-submit
  // -----------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || selectedEvents.length === 0) return;

    for (const eventId of selectedEvents) {
      await fetchAuth(API_URL, {
        method: "POST",
        body: JSON.stringify({
          productId: selectedProduct,
          eventId,
        }),
      });
    }

    // reset form
    setSelectedProduct(null);
    setSelectedEvents([]);

    // refresh list
    fetchData();
  };

  // -----------------------------------------
  // Delete Relationship
  // -----------------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to remove this relation?")) return;

    await fetchAuth(`${API_URL}?id=${id}`, {
      method: "DELETE",
    });

    setProductEvents((prev) => prev.filter((pe) => pe.id !== id));
  };

  // -----------------------------------------
  // Render UI
  // -----------------------------------------
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Product Events (Multi-Assign)</h1>

      {/* Form Multi-Select */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Assign Product to Multiple Events</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Product</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedProduct ?? ""}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              required
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Events Multi Select */}
          <div>
            <label className="block mb-1 font-medium">Events (Multi-Select)</label>
            <select
              className="w-full border rounded px-3 py-2"
              multiple
              value={selectedEvents.map(String)}
              onChange={(e) =>
                setSelectedEvents(
                  Array.from(e.target.selectedOptions, (o) => Number(o.value))
                )
              }
              required
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Assign
          </button>
        </form>
      </div>

      {/* Table List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Relations List</h2>

        {productEvents.length === 0 ? (
          <p>No relations yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Product</th>
                <th className="border px-4 py-2 text-left">Event</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {productEvents.map((pe) => (
                <tr key={pe.id}>
                  <td className="border px-4 py-2">{pe.product?.name}</td>
                  <td className="border px-4 py-2">{pe.event?.name}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(pe.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
