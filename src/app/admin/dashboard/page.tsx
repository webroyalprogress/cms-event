import { prisma } from "@/lib/prisma";
import { ProductType, EventType } from "@/lib/types";

export default async function DashboardPage() {
  // ambil data
  const [productCount, eventCount, productEventCount, recentProducts, recentEvents] =
    await Promise.all([
      prisma.product.count(),
      prisma.event.count(),
      prisma.productEvent.count(),
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-500 text-white rounded shadow">
          <h2 className="text-lg font-bold">Products</h2>
          <p className="text-2xl">{productCount}</p>
        </div>
        <div className="p-4 bg-green-500 text-white rounded shadow">
          <h2 className="text-lg font-bold">Events</h2>
          <p className="text-2xl">{eventCount}</p>
        </div>
        <div className="p-4 bg-purple-500 text-white rounded shadow">
          <h2 className="text-lg font-bold">Product Events</h2>
          <p className="text-2xl">{productEventCount}</p>
        </div>
      </div>

      {/* Recent products & events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-bold mb-2">Recent Products</h3>
          <ul className="space-y-1">
            {recentProducts.map((p: ProductType) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-bold mb-2">Recent Events</h3>
          <ul className="space-y-1">
            {recentEvents.map((e: EventType) => (
              <li key={e.id}>{e.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
