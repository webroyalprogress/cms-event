"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";

interface Event {
  id: number;
  name: string;
  slug: string;
  startDate?: string; // ISO string dari backend
  endDate?: string;
}

interface ApiError {
  error: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/events";

  // Fetch semua events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const data: Event[] | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Tambah / Update event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !startDate || !endDate) {
      setError("All fields are required");
      return;
    }

    // Generate slug otomatis dari name
    const slug = slugify(name, { lower: true, strict: true });

    try {
      let method: "POST" | "PUT" = "POST";
      let payload: any = { name, slug, startDate, endDate };

      if (editingEventId) {
        method = "PUT";
        payload.id = editingEventId; // 🔥 ID dikirim di body
      }

      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data: Event | ApiError = await res.json();
      if ("error" in data) {
        setError(data.error);
      } else {
        setName("");
        setStartDate("");
        setEndDate("");
        setEditingEventId(null);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit event");
    }
  };

  // Edit button
  const handleEdit = (event: Event) => {
    setEditingEventId(event.id);
    setName(event.name);
    setStartDate(event.startDate ? event.startDate.slice(0, 16) : "");
    setEndDate(event.endDate ? event.endDate.slice(0, 16) : "");
  };

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this event?")) return;
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // 🔥 kirim id di body
        credentials: "include",
      });
      const data: { message?: string; error?: string } = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete event");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Form Add/Edit */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingEventId ? "Edit Event" : "Add Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Event Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">End Date</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              editingEventId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {editingEventId ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>

      {/* List Events */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Event List</h2>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events yet.</p>
        ) : Array.isArray(events) ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Slug</th>
                <th className="border px-4 py-2 text-left">Start</th>
                <th className="border px-4 py-2 text-left">End</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="border px-4 py-2">{e.name}</td>
                  <td className="border px-4 py-2">{e.slug}</td>
                  <td className="border px-4 py-2">
                    {e.startDate
                      ? new Date(e.startDate).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    {e.endDate ? new Date(e.endDate).toLocaleString() : "-"}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(e)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Failed to load events.</p>
        )}
      </div>
    </div>
  );
}
