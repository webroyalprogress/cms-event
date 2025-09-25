"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string; // full
  excerpt: string | null; // potongan
  slug: string;
  image: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const API_URL = "/api/products";

  const fetchProducts = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(name, { lower: true, strict: true });

    if (editingProductId) {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProductId,
          name,
          price: Number(price),
          description,
          slug,
          image,
        }),
      });
      setEditingProductId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          slug,
          image,
        }),
      });
    }

    setName("");
    setPrice("");
    setDescription("");
    setImage("");
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
    setImage(product.image || "");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this product?")) return;
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Form Section */}
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
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Image (URL)</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              rows={2}
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

      {/* Table Section */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        {products.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-right">Price</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-center">Image</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2 text-right">
                    Rp {p.price.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 max-w-xs truncate">
                    {p.excerpt || p.description}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 object-cover rounded mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center space-x-2">
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
