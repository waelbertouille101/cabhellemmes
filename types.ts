export enum ServiceType {
  URBANISME = 'Urbanisme',
  ETAT_CIVIL = 'État Civil',
  SCOLAIRE = 'Scolaire & Enfance',
  TECHNIQUE = 'Services Techniques',
  SOCIAL = 'Action Sociale (CCAS)',
  POLICE = 'Police Municipale',
  AUTRE = 'Autre'
}

export enum DossierStatus {
  NOUVEAU = 'Nouveau',
  TRANSMIS = 'Transmis au service',
  RDV = 'Demande de RDV',
  CLOTURE = 'Clôturé'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  content: string; // Base64 string
}

export interface Dossier {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  object: string;
  service: string; // Changed to string for manual input
  description: string;
  status: DossierStatus;
  createdAt: number; // Timestamp
  updatedAt: number;
  rdvDetails?: string; // Nom/Prenom de la personne pour le RDV
  attachments: Attachment[];
  isArchived: boolean;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<DossierStatus, number>;
  byService: Record<string, number>;
}