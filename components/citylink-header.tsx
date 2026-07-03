'use client';

import { Bell } from 'lucide-react';

export function CityLinkHeader() {
  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">CL</span>
        </div>
        <span className="font-bold text-lg tracking-tight">CityLink</span>
      </div>
      <button className="relative p-2 rounded-full hover:bg-blue-700 transition-colors">
        <Bell size={22} />
      </button>
    </header>
  );
}
