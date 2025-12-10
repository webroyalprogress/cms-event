"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  excerpt: string | null;
  slug: string;
  image: string | null;
  categoryId: number | null;
  category: Category | null;
}

interface ProductPayload {
  id?: number;
  name: string;
  price: number;
  description: string;
  slug: string;
  image: string | null;
  categorySlug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(""); // slug
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const API_URL = "/api/products";
  const CATEGORY_API = "/api/categories";

  const getToken = () => localStorage.getItem("access_token") || "";

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = getToken();

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      const data: Product[] = Array.isArray(json) ? json : json.data || [];
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getToken();

      const res = await fetch(CATEGORY_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      const data: Category[] = Array.isArray(json) ? json : json.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Add / Update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !description || !category) return;

    const token = getToken();
    const slug = slugify(name, { lower: true, strict: true });

    const payload: ProductPayload = {
      name,
      price: Number(price),
      description,
      slug,
      image: image || null,
      categorySlug: category,
    };

    try {
      if (editingProductId) {
        await fetch(API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingProductId, ...payload }),
        });
        setEditingProductId(null);
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImage("");
      setCategory("");

      fetchProducts();
    } catch (err) {
      console.error("Submit product error:", err);
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
    setImage(product.image || "");
    setCategory(product.category?.slug || "");
  };

  // Delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this product?")) return;

    try {
      const token = getToken();

      await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Form */}
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
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
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

      {/* Table */}
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
                <th className="border px-4 py-2 text-center">Category</th>
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
                    {p.category?.name || "-"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {p.image ? (
                      <div className="relative h-12 w-12 mx-auto">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded"
                        />
                      </div>
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
