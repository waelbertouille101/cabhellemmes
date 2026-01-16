import React, { useState } from 'react';
import { Dossier, DossierStatus, Attachment } from '../types';
import { Calendar, User, Mail, FileText, Trash2, Paperclip, ChevronRight, Save, Download, X } from 'lucide-react';

interface DossierCardProps {
  dossier: Dossier;
  onUpdate: (dossier: Dossier) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export const DossierCard: React.FC<DossierCardProps> = ({ dossier, onUpdate, onDelete, readOnly = false }) => {
  const [rdvWho, setRdvWho] = useState(dossier.rdvDetails || '');
  const [isEditingRdv, setIsEditingRdv] = useState(false);

  const statusColors = {
    [DossierStatus.NOUVEAU]: 'bg-blue-100 text-blue-800 border-blue-200',
    [DossierStatus.TRANSMIS]: 'bg-orange-100 text-orange-800 border-orange-200',
    [DossierStatus.RDV]: 'bg-purple-100 text-purple-800 border-purple-200',
    [DossierStatus.CLOTURE]: 'bg-green-100 text-green-800 border-green-200',
  };

  const handleStatusChange = (newStatus: DossierStatus) => {
    onUpdate({ ...dossier, status: newStatus, updatedAt: Date.now() });
  };

  const handleRdvSave = () => {
    onUpdate({ ...dossier, rdvDetails: rdvWho, updatedAt: Date.now() });
    setIsEditingRdv(false);
  };

  const handleRemoveAttachment = (attId: string) => {
      const newAttachments = dossier.attachments.filter(a => a.id !== attId);
      onUpdate({...dossier, attachments: newAttachments, updatedAt: Date.now()});
  };

  const downloadFile = (att: Attachment) => {
      // Create a temporary link to download base64
      const link = document.createElement("a");
      link.href = att.content;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  // Determine text color for service based on status
  // User request: "dans l'onglet nouvelle demande mets les écriture des service en noire"
  const serviceTextColor = dossier.status === DossierStatus.NOUVEAU ? 'text-black' : 'text-blue-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 overflow-hidden relative">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[dossier.status]}`}>
              {dossier.status}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {new Date(dossier.createdAt).toLocaleDateString()}
            </span>
          </div>
          {/* Suppression améliorée : z-index, padding, type=button */}
          <button 
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  onDelete(dossier.id);
              }}
              className="p-2 -mr-2 text-gray-500 hover:text-red-600 transition rounded-full hover:bg-red-50 z-10 cursor-pointer"
              title="Supprimer le dossier"
          >
              <Trash2 size={20} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-1">{dossier.object}</h3>
        <p className={`text-sm font-medium mb-4 ${serviceTextColor}`}>{dossier.service}</p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span>{dossier.firstName} {dossier.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-400" />
            <a href={`mailto:${dossier.email}`} className="hover:text-blue-600 hover:underline">{dossier.email}</a>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4 whitespace-pre-wrap border border-gray-100">
            {dossier.description}
        </div>

        {/* RDV Section Specifics */}
        {dossier.status === DossierStatus.RDV && (
            <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="text-xs font-semibold text-purple-800 mb-1">RDV avec :</div>
                {!readOnly && (isEditingRdv || !dossier.rdvDetails) ? (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 text-sm border-purple-200 rounded px-2 py-1 focus:ring-purple-500"
                            placeholder="Nom Prénom du responsable"
                            value={rdvWho}
                            onChange={(e) => setRdvWho(e.target.value)}
                        />
                        <button onClick={handleRdvSave} className="text-purple-600 hover:text-purple-800">
                            <Save size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center text-sm text-purple-900">
                        <span>{dossier.rdvDetails || "Non assigné"}</span>
                        {!readOnly && (
                             <button onClick={() => setIsEditingRdv(true)} className="text-xs text-purple-600 hover:underline">Modifier</button>
                        )}
                       
                    </div>
                )}
            </div>
        )}

        {/* Attachments */}
        {dossier.attachments.length > 0 && (
            <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <Paperclip size={12} /> Pièces jointes
                </div>
                <div className="space-y-1">
                    {dossier.attachments.map(att => (
                        <div key={att.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="truncate max-w-[150px]">{att.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => downloadFile(att)} className="text-blue-500 hover:text-blue-700">
                                    <Download size={14} />
                                </button>
                                {!readOnly && (
                                    <button onClick={() => handleRemoveAttachment(att.id)} className="text-red-400 hover:text-red-600">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Action Buttons - Workflow */}
        {!readOnly && (
            <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Changer le statut :</p>
            <div className="flex flex-wrap gap-2">
                {Object.values(DossierStatus).map((status) => (
                    <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={dossier.status === status}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
                            ${dossier.status === status 
                                ? 'bg-gray-800 text-white cursor-default' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        {status}
                    </button>
                ))}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};