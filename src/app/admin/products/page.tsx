"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";

interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_URL = "/api/products";

  // Fetch semua product
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tambah / Update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !price) {
      setError("Name and price required");
      return;
    }

    // Generate slug otomatis dari name
    const slug = slugify(name, { lower: true, strict: true });

    try {
      if (editingProductId) {
        // Update
        await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProductId,
            name,
            price: Number(price),
            slug, // kirim slug
          }),
        });
        setEditingProductId(null);
      } else {
        // Tambah
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price: Number(price), slug }),
        });
      }

      setName("");
      setPrice("");
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to submit product");
    }
  };

  // Edit button
  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
  };

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this product?")) return;

    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Form Add/Edit */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingProductId ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Product Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              editingProductId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingProductId ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>

      {/* List Products */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        {products.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Price</th>
                <th className="border px-4 py-2 text-left">Slug</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.price}</td>
                  <td className="border px-4 py-2">{p.slug}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(p.id)}
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
