import React, { useState, useRef, ChangeEvent } from 'react';
import { DossierStatus } from '../types';
import { Upload, X, Paperclip } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface Attachment {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface DossierFormProps {
  onSubmit: (dossier: any) => void;
}

export const DossierForm = ({ onSubmit }: DossierFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    object: '',
    service: '',
    description: '',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAttachments(prev => [
            ...prev,
            {
              id: generateId(),
              name: file.name,
              type: file.type,
              content: base64String
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDossier = {
      id: generateId(),
      ...formData,
      status: DossierStatus.NOUVEAU,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attachments: attachments,
      isArchived: false,
    };
    onSubmit(newDossier);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      object: '',
      service: '',
      description: '',
    });
    setAttachments([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
        Créer une Nouvelle Demande
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              required
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              required
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="jean.dupont@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service concerné</label>
            <input
              required
              type="text"
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Ex: Urbanisme"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la demande</label>
          <input
            required
            type="text"
            name="object"
            value={formData.object}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Ex: Demande de permis de construire"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Détails du problème</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            placeholder="Décrivez votre demande en détail..."
          />
        </div>

        {/* Attachment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pièces jointes</label>
          <div className="flex items-center gap-4">
             <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Upload size={18} />
              Ajouter un fichier
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <span className="text-sm text-gray-500">
               {attachments.length === 0 ? 'Aucun fichier sélectionné' : `${attachments.length} fichier(s)`}
            </span>
          </div>
          
          {attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {attachments.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                    title="Supprimer la pièce jointe"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            Enregistrer la demande
          </button>
        </div>
      </form>
    </div>
  );
};