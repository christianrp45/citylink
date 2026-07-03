import { useState } from "react";
import { useStore } from "@/lib/store";
import { mockUsers, mockSamaritanAlerts, mockBusinesses } from "@/lib/mockData";
import type { SamaritanAlert } from "@/lib/types";

export default function CommunityPage() {
  const store = useStore();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [formData, setFormData] = useState({
    type: "urgency" as const,
    description: "",
  });

  // Initialize store with mock data on first load
  if (store.users.length === 0) {
    store.users = mockUsers;
    store.businesses = mockBusinesses;
    store.samaritanAlerts = mockSamaritanAlerts;
    store.setCurrentUser(mockUsers[0]);
  }

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlert: SamaritanAlert = {
      id: `alert-${Date.now()}`,
      userId: store.currentUser?.id || "user-1",
      userName: store.currentUser?.name || "Usuário",
      type: formData.type,
      description: formData.description,
      location: store.currentUser?.location || { lat: -23.55, lng: -46.63 },
      createdAt: new Date().toISOString(),
      status: "active",
      responses: [],
    };

    store.addSamaritanAlert(newAlert);
    setFormData({ type: "urgency", description: "" });
    setShowCreateAlert(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-900">🤝 Comunidade</h1>
          <p className="text-sm text-gray-600">Ajuda mútua entre irmãos</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Active Alerts */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⏰ Pedidos Ativos
          </h2>
          <div className="space-y-3">
            {store.samaritanAlerts
              .filter((a) => a.status === "active")
              .map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg border-l-4 border-amber-500 p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {alert.type === "urgency" && "🚨 Urgência: "}
                        {alert.type === "prayer" && "🙏 Oração: "}
                        {alert.type === "practical_help" && "🤝 Ajuda Prática: "}
                        {alert.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Por {alert.userName}
                      </p>
                      {alert.responses && alert.responses.length > 0 && (
                        <p className="text-xs text-emerald-600 mt-2">
                          ✓ {alert.responses.length}{" "}
                          {alert.responses.length === 1
                            ? "pessoa respondeu"
                            : "pessoas responderam"}
                        </p>
                      )}
                    </div>
                    <button className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition">
                      Posso Ajudar!
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Talents Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💡 Talentos da Comunidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.profession}</p>
                    {user.helpOffer && (
                      <p className="text-sm text-indigo-600 mt-2 font-medium">
                        💪 {user.helpOffer}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.availabilityStatus === "mesa-posta"
                        ? "bg-emerald-500"
                        : user.availabilityStatus === "requer-aviso"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateAlert(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition transform hover:scale-110"
      >
        🤝
      </button>

      <BottomNav />

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Pedir Ajuda
              </h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ajuda
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="urgency">🚨 Urgência</option>
                  <option value="prayer">🙏 Oração</option>
                  <option value="practical_help">🤝 Ajuda Prática</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva sua necessidade..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition"
              >
                Enviar Pedido de Ajuda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
