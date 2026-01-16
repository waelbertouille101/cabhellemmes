import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getDossiers, saveDossiers, isDateInCurrentWeek, isDateInPastWeek, exportDossiersToJSON, importDossiersFromJSON } from './services/storageService';
import { Dossier, DossierStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { DossierForm } from './components/DossierForm';
import { DossierCard } from './components/DossierCard';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Send, 
  CalendarClock, 
  CheckCircle, 
  History, 
  Archive,
  LogOut,
  Building2,
  Menu,
  Inbox,
  Settings,
  Download,
  Upload,
  Database
} from 'lucide-react';

// Login Component
const LoginScreen: React.FC<{onLogin: () => void}> = ({ onLogin }) => {
    const [id, setId] = useState('');
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id === "Cabinet du maire" && pwd === "jenesaispas") {
            onLogin();
        } else {
            setError("Identifiants incorrects");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-blue-700" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestionnaire de Dossier</h1>
                    <p className="text-gray-500">Portail Administration</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                        <input 
                            type="text" 
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Entrez votre ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input 
                            type="password" 
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Entrez votre mot de passe"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition shadow-lg">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    )
}

enum View {
    DASHBOARD = 'Dashboard',
    CREATE = 'Créer une demande', // Previously NEW
    INCOMING = 'Nouveaux Dossiers', // New View for list of new dossiers
    TRANSMITTED = 'Transmise',
    RDV = 'RDV',
    CLOSED = 'Clôturé',
    WEEKLY = 'Récap Hebdo',
    HISTORY = 'Historique',
    SETTINGS = 'Paramètres'
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    const loaded = getDossiers();
    const updated = loaded.map(d => {
        if (!d.isArchived && isDateInPastWeek(new Date(d.createdAt))) {
            return { ...d, isArchived: true };
        }
        return d;
    });
    if (JSON.stringify(updated) !== JSON.stringify(loaded)) {
        saveDossiers(updated);
    }
    setDossiers(updated);
  }, []);

  const handleUpdateDossier = (updatedDossier: Dossier) => {
    setDossiers(prevDossiers => {
        const newDossiers = prevDossiers.map(d => d.id === updatedDossier.id ? updatedDossier : d);
        saveDossiers(newDossiers);
        return newDossiers;
    });
  };

  const handleCreateDossier = (newDossier: Dossier) => {
    setDossiers(prevDossiers => {
        const newDossiers = [newDossier, ...prevDossiers];
        saveDossiers(newDossiers);
        return newDossiers;
    });
    setCurrentView(View.INCOMING); 
  };

  const handleDeleteDossier = (id: string) => {
      setTimeout(() => {
          if(window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier définitivement ?")) {
            setDossiers(prevDossiers => {
                const newDossiers = prevDossiers.filter(d => d.id !== id);
                saveDossiers(newDossiers);
                return newDossiers;
            });
          }
      }, 50);
  };

  // Export Data Logic
  const handleExportData = () => {
      const jsonString = exportDossiersToJSON();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sauvegarde_mairie_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Import Data Logic
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const content = event.target?.result as string;
              if (window.confirm("ATTENTION : Cette action va remplacer toutes les données actuelles par celles du fichier. Voulez-vous continuer ?")) {
                  const imported = importDossiersFromJSON(content);
                  if (imported) {
                      setDossiers(imported);
                      alert("Importation réussie !");
                  } else {
                      alert("Erreur : Le fichier est invalide ou corrompu.");
                  }
              }
          };
          reader.readAsText(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Views Logic
  const filteredDossiers = useMemo(() => {
    // Sort: Newest first
    const sorted = [...dossiers].sort((a, b) => b.createdAt - a.createdAt);

    switch (currentView) {
        case View.CREATE: 
             return []; 
        case View.INCOMING:
             return sorted.filter(d => d.status === DossierStatus.NOUVEAU && !d.isArchived);
        case View.TRANSMITTED:
            return sorted.filter(d => d.status === DossierStatus.TRANSMIS && !d.isArchived);
        case View.RDV:
            return sorted.filter(d => d.status === DossierStatus.RDV && !d.isArchived);
        case View.CLOSED:
            return sorted.filter(d => d.status === DossierStatus.CLOTURE && !d.isArchived);
        case View.WEEKLY:
            return sorted.filter(d => isDateInCurrentWeek(new Date(d.createdAt)) || isDateInCurrentWeek(new Date(d.updatedAt)));
        case View.HISTORY:
            return sorted.filter(d => d.isArchived);
        default:
            return sorted;
    }
  }, [dossiers, currentView]);


  const SidebarItem = ({ view, icon: Icon, label, colorClass }: any) => (
      <button 
        onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1
            ${currentView === view 
                ? `${colorClass} text-white shadow-md transform scale-105` 
                : 'text-gray-600 hover:bg-gray-100'
            }
        `}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
  );

  if (!isLoggedIn) {
      return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">Gestionnaire<span className="text-blue-600">Dossier</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto">
            <SidebarItem view={View.DASHBOARD} icon={LayoutDashboard} label="Tableau de Bord" colorClass="bg-gray-800" />
            
            <div className="my-4 border-t border-gray-100"></div>
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Gestion</p>
            
            <SidebarItem view={View.CREATE} icon={PlusCircle} label="Créer une demande" colorClass="bg-blue-600" />
            <SidebarItem view={View.INCOMING} icon={Inbox} label="Nouveaux Dossiers" colorClass="bg-teal-500" />
            <SidebarItem view={View.TRANSMITTED} icon={Send} label="Transmise Service" colorClass="bg-orange-500" />
            <SidebarItem view={View.RDV} icon={CalendarClock} label="Demande de RDV" colorClass="bg-purple-600" />
            <SidebarItem view={View.CLOSED} icon={CheckCircle} label="Clôturé" colorClass="bg-green-600" />
            
            <div className="my-4 border-t border-gray-100"></div>
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Archives</p>
            
            <SidebarItem view={View.WEEKLY} icon={History} label="Récap Hebdo" colorClass="bg-indigo-600" />
            <SidebarItem view={View.HISTORY} icon={Archive} label="Historique" colorClass="bg-slate-500" />

            <div className="my-4 border-t border-gray-100"></div>
            <SidebarItem view={View.SETTINGS} icon={Settings} label="Paramètres" colorClass="bg-gray-700" />
        </nav>

        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg mt-4 transition">
            <LogOut size={18} />
            <span className="font-medium">Déconnexion</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
             <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Building2 className="text-white" size={20} />
                </div>
                <span className="font-bold text-gray-800">Gestionnaire Dossier</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="text-gray-600" />
            </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
             <div className="md:hidden bg-white rounded-xl shadow-lg p-4 mb-6 space-y-2 border border-gray-100">
                <SidebarItem view={View.DASHBOARD} icon={LayoutDashboard} label="Tableau de Bord" colorClass="bg-gray-800" />
                <SidebarItem view={View.CREATE} icon={PlusCircle} label="Créer une demande" colorClass="bg-blue-600" />
                <SidebarItem view={View.INCOMING} icon={Inbox} label="Nouveaux Dossiers" colorClass="bg-teal-500" />
                <SidebarItem view={View.TRANSMITTED} icon={Send} label="Transmise Service" colorClass="bg-orange-500" />
                <SidebarItem view={View.RDV} icon={CalendarClock} label="Demande de RDV" colorClass="bg-purple-600" />
                <SidebarItem view={View.CLOSED} icon={CheckCircle} label="Clôturé" colorClass="bg-green-600" />
                <SidebarItem view={View.WEEKLY} icon={History} label="Récap Hebdo" colorClass="bg-indigo-600" />
                <SidebarItem view={View.HISTORY} icon={Archive} label="Historique" colorClass="bg-slate-500" />
                <SidebarItem view={View.SETTINGS} icon={Settings} label="Paramètres" colorClass="bg-gray-700" />
             </div>
        )}

        {/* Views Rendering */}
        {currentView === View.DASHBOARD && <Dashboard dossiers={dossiers} />}
        
        {currentView === View.CREATE && (
            <div className="animate-fade-in-up">
                <DossierForm onSubmit={handleCreateDossier} />
            </div>
        )}

        {/* Settings View */}
        {currentView === View.SETTINGS && (
            <div className="max-w-4xl mx-auto space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Settings className="text-gray-600" />
                    Paramètres de l'application
                </h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Database className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Synchronisation et Sauvegarde</h3>
                            <p className="text-gray-500 text-sm">Gérez le transfert des données entre différents ordinateurs.</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <p className="text-sm text-yellow-800">
                            <strong>Note importante :</strong> Cette application fonctionne en mode "autonome" (sans serveur central). 
                            Pour partager les données entre deux ordinateurs, vous devez <strong>exporter</strong> les données du premier ordinateur, 
                            transférer le fichier (clé USB, email, réseau partagé) puis l'<strong>importer</strong> sur le second ordinateur.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 flex flex-col items-center text-center hover:shadow-md transition">
                            <Download size={48} className="text-green-600 mb-4" />
                            <h4 className="font-semibold text-gray-800 mb-2">Exporter les données</h4>
                            <p className="text-sm text-gray-500 mb-6">
                                Télécharge un fichier de sauvegarde (.json) contenant tous les dossiers actuels.
                            </p>
                            <button 
                                onClick={handleExportData}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium w-full"
                            >
                                Sauvegarder / Exporter
                            </button>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 flex flex-col items-center text-center hover:shadow-md transition">
                            <Upload size={48} className="text-orange-500 mb-4" />
                            <h4 className="font-semibold text-gray-800 mb-2">Importer une sauvegarde</h4>
                            <p className="text-sm text-gray-500 mb-6">
                                Charge les données depuis un fichier. <br/>
                                <span className="text-red-500 text-xs font-bold uppercase">Attention : Écrase les données actuelles.</span>
                            </p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium w-full"
                            >
                                Charger / Restaurer
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImportData} 
                                accept=".json"
                                className="hidden" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Render List for all other views (Incoming, Transmitted, RDV, Closed, Weekly, History) */}
        {currentView !== View.DASHBOARD && currentView !== View.CREATE && currentView !== View.SETTINGS && (
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {currentView === View.WEEKLY ? `Récapitulatif de la semaine` : 
                         currentView === View.HISTORY ? `Archives` :
                         currentView === View.INCOMING ? `Nouveaux Dossiers (Entrants)` :
                         `Dossiers : ${currentView}`}
                    </h2>
                    <span className="bg-white px-3 py-1 rounded-full shadow-sm text-sm text-gray-500 border">
                        {filteredDossiers.length} dossier(s)
                    </span>
                 </div>

                 {filteredDossiers.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border-dashed border-2 border-gray-200">
                         <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Archive className="text-gray-400" size={32} />
                         </div>
                         <p className="text-gray-500 text-lg">Aucun dossier dans cette catégorie.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDossiers.map(dossier => (
                            <DossierCard 
                                key={dossier.id} 
                                dossier={dossier} 
                                onUpdate={handleUpdateDossier} 
                                onDelete={handleDeleteDossier}
                                readOnly={currentView === View.HISTORY}
                            />
                        ))}
                     </div>
                 )}
            </div>
        )}
      </main>
    </div>
  );
}