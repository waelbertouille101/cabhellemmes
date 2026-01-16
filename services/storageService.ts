const STORAGE_KEY = 'mairie_manager_dossiers_v1';

export const getDossiers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load dossiers", e);
    return [];
  }
};

export const saveDossiers = (dossiers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
  } catch (e) {
    console.error("Failed to save dossiers", e);
  }
};

// Helper to check if a date is in the current week (Monday to Sunday)
export const isDateInCurrentWeek = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Calculate Monday of this week
  // If today is Sunday (0), Monday was 6 days ago. If Monday (1), 0 days ago.
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  
  // Calculate next Monday (start of next week)
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  return date >= monday && date < nextMonday;
};

export const isDateInPastWeek = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay(); 
    
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    
    return date < monday;
};