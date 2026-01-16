import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DossierStatus } from '../types';

const COLORS_STATUS = {
  [DossierStatus.NOUVEAU]: '#3b82f6', // Blue-500
  [DossierStatus.TRANSMIS]: '#f97316', // Orange-500
  [DossierStatus.RDV]: '#a855f7', // Purple-500
  [DossierStatus.CLOTURE]: '#22c55e', // Green-500
};

const COLORS_SERVICE = [
  '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#84cc16'
];

export const Dashboard = ({ dossiers }) => {
  // Filter out archived for stats usually, but let's keep active ones + this week's closed
  const activeDossiers = dossiers.filter(d => !d.isArchived);

  // Prepare Data for Status Chart
  const statusData = Object.values(DossierStatus).map(status => ({
    name: status,
    value: activeDossiers.filter(d => d.status === status).length
  })).filter(d => d.value > 0);

  // Prepare Data for Service Chart (Dynamic aggregation since service is now free text)
  const serviceCounts = {};
  activeDossiers.forEach(d => {
    // Normalize string slightly (trim) to avoid duplicates like "Urbanisme " vs "Urbanisme"
    const s = d.service ? d.service.trim() : 'Non spécifié';
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });

  const serviceData = Object.entries(serviceCounts).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord - Vue d'ensemble</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart 1: Status */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Répartition par État d'avancement</h3>
          <div className="w-full h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Chart 2: Services */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Répartition par Service</h3>
          <div className="w-full h-64">
             {serviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_SERVICE[index % COLORS_SERVICE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Aucune donnée</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
          <p className="text-sm text-blue-600 font-medium">Nouveaux Dossiers</p>
          <p className="text-3xl font-bold text-blue-800">{activeDossiers.filter(d => d.status === DossierStatus.NOUVEAU).length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
          <p className="text-sm text-orange-600 font-medium">Transmis au Service</p>
          <p className="text-3xl font-bold text-orange-800">{activeDossiers.filter(d => d.status === DossierStatus.TRANSMIS).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500 shadow-sm">
          <p className="text-sm text-purple-600 font-medium">Attente RDV</p>
          <p className="text-3xl font-bold text-purple-800">{activeDossiers.filter(d => d.status === DossierStatus.RDV).length}</p>
        </div>
         <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-green-600 font-medium">Clôturés (Actifs)</p>
          <p className="text-3xl font-bold text-green-800">{activeDossiers.filter(d => d.status === DossierStatus.CLOTURE).length}</p>
        </div>
      </div>
    </div>
  );
};