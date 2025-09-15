"use client";

import { useState, useEffect } from "react";

interface Event {
  id: number;
  name: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("");
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const API_URL = "/api/events";

  // Fetch semua events
  const fetchEvents = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Tambah / Update event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      // Update via query parameter lebih stabil
      await fetch(`${API_URL}?id=${editingEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setEditingEventId(null);
    } else {
      // Tambah event baru
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    setName("");
    fetchEvents();
  };

  // Edit button
  const handleEdit = (event: Event) => {
    setEditingEventId(event.id);
    setName(event.name);
  };

  // Delete button
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure want to delete this event?")) return;
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

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
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              editingEventId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {editingEventId ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>

      {/* List Events */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Event List</h2>
        {events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="border px-4 py-2">{e.name}</td>
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
        )}
      </div>
    </div>
  );
}
