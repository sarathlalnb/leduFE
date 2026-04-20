import React from 'react';

export default function StatsCard({ title, value, icon = "📊", gradient = "gradient-bg" }) {
  return (
    <div className={`group ${gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <p className="text-3xl sm:text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-30">{icon}</div>
      </div>
    </div>
  );
}
