const STORAGE_KEY = "andoke_visitor_session";

export const parkStorageService = {
  getSession: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split("T")[0];

      if (parsed.date === today) {
        return parsed;
      } else {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    } catch (error) {
      console.error("Error al leer sesión local:", error);
      return null;
    }
  },

  saveSession: ({ routeId, selectedPois, visitedPois = [] }) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const sessionData = {
        date: today,
        routeId,
        selectedPois,
        visitedPois,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      return sessionData;
    } catch (error) {
      console.error("Error al guardar sesión local:", error);
      return null;
    }
  },

  toggleVisitedPoi: (poiId) => {
    const session = parkStorageService.getSession();
    if (!session) return null;

    const visited = session.visitedPois.includes(poiId)
      ? session.visitedPois.filter((id) => id !== poiId)
      : [...session.visitedPois, poiId];

    return parkStorageService.saveSession({
      ...session,
      visitedPois: visited,
    });
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};