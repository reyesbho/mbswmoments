// Función para obtener el nombre del día en español
export const getDayName = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

export const getDayOfMonth = (date: Date): number => {
  //get day of month
  return date.getDate();
};

// Función para formatear la fecha
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para formatear la hora
export const formatTime = (timestamp: { seconds: number; nanoseconds: number }): string => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para convertir timestamp de Firestore a Date
export const timestampToDate = (timestamp: { seconds: number; nanoseconds: number }): Date => {
  return new Date(timestamp.seconds * 1000);
};

// Función para formatear el mes y año
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
};
