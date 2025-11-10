"use client";

import { useState, useEffect } from "react";

interface Event {
  id: number;
  name: string;
  slug: string;
}

interface Header {
  id: number;
  judul: string;
  deskripsi: string;
  deskripsi2: string;
  event: string; // slug event
  icon: string;
}

interface ApiError {
  error: string;
}

export default function HeadersPage() {
  const [headers, setHeaders] = useState<Header[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deskripsi2, setDeskripsi2] = useState("");
  const [event, setEvent] = useState("");
  const [icon, setIcon] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/headers";
  const EVENT_API_URL = "/api/events"; // Ambil event dari Neon DB

  // Fetch semua header
  const fetchHeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const data: Header[] | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
        setHeaders([]);
      } else {
        setHeaders(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch headers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch semua event
  const fetchEvents = async () => {
    try {
      const res = await fetch(EVENT_API_URL, { credentials: "include" });
      const data: Event[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  useEffect(() => {
    fetchHeaders();
    fetchEvents();
  }, []);

  // Tambah / Update header
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!judul || !deskripsi || !event || !icon) {
      setError("All fields are required");
      return;
    }

    const payload = { judul, deskripsi,deskripsi2, event, icon };
    const method: "POST" | "PUT" = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}?id=${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data: Header | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
      } else {
        setJudul("");
        setDeskripsi("");
        setDeskripsi2("");
        setEvent("");
        setIcon("");
        setEditingId(null);
        fetchHeaders();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit header");
    }
  };

  // Edit button
  const handleEdit = (header: Header) => {
    setEditingId(header.id);
    setJudul(header.judul);
    setDeskripsi(header.deskripsi);
    setDeskripsi2(header.deskripsi2);
    setEvent(header.event);
    setIcon(header.icon);
  };

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this header?")) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data: { message?: string; error?: string } = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setHeaders((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete header");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Headers</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Form Add/Edit */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Header" : "Add Header"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Judul</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Deskripsi</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Deskripsi 2</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={deskripsi2}
              onChange={(e) => setDeskripsi2(e.target.value)}
             
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Event</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              required
            >
              <option value="">-- Select Event --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.slug}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Icon</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {editingId ? "Update Header" : "Add Header"}
          </button>
        </form>
      </div>

      {/* List Headers */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Header List</h2>

        {loading ? (
          <p>Loading headers...</p>
        ) : headers.length === 0 ? (
          <p>No headers yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Judul</th>
                <th className="border px-4 py-2 text-left">Deskripsi</th>
                <th className="border px-4 py-2 text-left">Deskripsi2</th>
                <th className="border px-4 py-2 text-left">Event</th>
                <th className="border px-4 py-2 text-left">Icon</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((h) => (
                <tr key={h.id}>
                  <td className="border px-4 py-2">{h.judul}</td>
                  <td className="border px-4 py-2">{h.deskripsi}</td>
                  <td className="border px-4 py-2">{h.deskripsi2}</td>
                  <td className="border px-4 py-2">{h.event}</td>
                  <td className="border px-4 py-2">{h.icon}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(h)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(h.id)}
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
