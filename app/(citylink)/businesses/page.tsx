'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { BottomNav } from '@/components/citylink-bottom-nav';
import { mockBusinesses, mockUsers } from '@/lib/mockData';

export default function BusinessPage() {
  const store = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize store
  if (store.businesses.length === 0) {
    store.businesses = mockBusinesses;
    store.users = mockUsers;
    store.setCurrentUser(mockUsers[0]);
  }

  const categories = [
    { id: 'alimentacao', label: '🍔 Alimentação' },
    { id: 'saude', label: '⚕️ Saúde' },
    { id: 'mercado', label: '🛒 Mercado' },
    { id: 'educacao', label: '📚 Educação' },
    { id: 'servicos', label: '🔧 Serviços' },
    { id: 'religioso', label: '⛪ Religioso' },
  ];

  const filteredBusinesses = selectedCategory
    ? store.businesses.filter((b) => b.category === selectedCategory)
    : store.businesses;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-900">
            🏪 Negócios & Serviços
          </h1>
          <p className="text-sm text-gray-600">Empresas recomendadas pela comunidade</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === null
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business List */}
        <div className="space-y-4">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business) => {
              const recommendedBy = business.communityRecommendations
                .slice(0, 3)
                .map((userId) => mockUsers.find((u) => u.id === userId))
                .filter(Boolean);

              return (
                <div
                  key={business.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  {/* Business Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600">{business.address}</p>
                    </div>
                    {business.rating && (
                      <div className="text-right">
                        <p className="text-2xl">⭐</p>
                        <p className="text-sm font-semibold text-amber-600">
                          {business.rating.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className="text-gray-700 mb-4">{business.description}</p>
                  )}

                  {/* Contact */}
                  {business.phone && (
                    <p className="text-sm text-gray-600 mb-4">
                      📞 {business.phone}
                    </p>
                  )}

                  {/* Trust Seal - IRMÃO INDICA IRMÃO */}
                  <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500 mb-4">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">
                      ✅ Irmão Indica Irmão
                    </p>
                    <p className="text-lg font-bold text-emerald-700 mb-3">
                      {business.communityRecommendations.length}{' '}
                      {business.communityRecommendations.length === 1
                        ? 'membro da comunidade recomenda'
                        : 'membros da comunidade recomendam'}
                    </p>

                    {recommendedBy.length > 0 && (
                      <div className="space-y-2">
                        {recommendedBy.map((person) => (
                          <div
                            key={person?.id}
                            className="text-sm text-emerald-800"
                          >
                            <p className="font-medium">
                              ✓ {person?.name}
                              {person?.profession && (
                                <span className="text-emerald-700">
                                  {' '}
                                  ({person.profession})
                                </span>
                              )}
                            </p>
                            {person?.helpOffer && (
                              <p className="text-xs text-emerald-600 ml-4">
                                💪 {person.helpOffer}
                              </p>
                            )}
                          </div>
                        ))}

                        {business.communityRecommendations.length > 3 && (
                          <p className="text-sm text-emerald-600 font-medium">
                            +{business.communityRecommendations.length - 3} mais
                            {business.communityRecommendations.length - 3 === 1
                              ? ' membro'
                              : ' membros'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition">
                    Ver Detalhes
                  </button>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <p className="text-3xl mb-2">😕</p>
              <p className="text-gray-600 font-medium">
                Nenhum negócio nesta categoria
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
