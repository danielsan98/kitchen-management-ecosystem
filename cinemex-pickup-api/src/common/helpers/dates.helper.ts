

// dates.helper.ts
export const formatDatetime = (datetimeStr: string): Date => {
  if (!datetimeStr || datetimeStr.length !== 14) {
    throw new Error('Formato datetime inválido. Se espera YYYYMMDDHHMMSS');
  }

  // Extraer componentes
  const year = parseInt(datetimeStr.substring(0, 4));
  const month = parseInt(datetimeStr.substring(4, 6)) - 1; // Meses en JS son 0-index
  const day = parseInt(datetimeStr.substring(6, 8));
  const hour = parseInt(datetimeStr.substring(8, 10));
  const minute = parseInt(datetimeStr.substring(10, 12));
  const second = parseInt(datetimeStr.substring(12, 14));

  // Crear fecha en UTC
  return new Date(Date.UTC(year, month, day, hour, minute, second));
};