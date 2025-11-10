"use client";

import { useState, useEffect } from "react";

interface Logo {
  id: number;
  image_logo: string;
  event: string; // slug event
}

interface Event {
  id: number;
  name: string;
  slug: string;
}

interface ApiError {
  error: string;
}

export default function LogosPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [imageLogo, setImageLogo] = useState("");
  const [event, setEvent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/logos";
  const EVENTS_API_URL = "/api/events"; // ambil slug dari Neon DB

  // Fetch semua logos
  const fetchLogos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const data: Logo[] | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
        setLogos([]);
      } else {
        setLogos(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch logos");
    } finally {
      setLoading(false);
    }
  };

  // Fetch semua events
  const fetchEvents = async () => {
    try {
      const res = await fetch(EVENTS_API_URL, { credentials: "include" });
      const data: Event[] | ApiError = await res.json();
      if (!("error" in data)) setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogos();
    fetchEvents();
  }, []);

  // Tambah / Update logo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageLogo || !event) {
      setError("All fields are required");
      return;
    }

    const payload = { image_logo: imageLogo, event };
    const method: "POST" | "PUT" = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}?id=${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data: Logo | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
      } else {
        setImageLogo("");
        setEvent("");
        setEditingId(null);
        fetchLogos();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit logo");
    }
  };

  // Edit button
  const handleEdit = (logo: Logo) => {
    setEditingId(logo.id);
    setImageLogo(logo.image_logo);
    setEvent(logo.event);
  };

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this logo?")) return;
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
        setLogos((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete logo");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Logos</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Form Add/Edit */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Logo" : "Add Logo"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Image Logo</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={imageLogo}
              onChange={(e) => setImageLogo(e.target.value)}
              required
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

          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {editingId ? "Update Logo" : "Add Logo"}
          </button>
        </form>
      </div>

      {/* List Logos */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Logo List</h2>

        {loading ? (
          <p>Loading logos...</p>
        ) : logos.length === 0 ? (
          <p>No logos yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Image Logo</th>
                <th className="border px-4 py-2 text-left">Event</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logos.map((l) => (
                <tr key={l.id}>
                  <td className="border px-4 py-2">{l.image_logo}</td>
                  <td className="border px-4 py-2">{l.event}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(l)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(l.id)}
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
