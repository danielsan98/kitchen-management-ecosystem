import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  // Definimos la ruta de la carpeta y el archivo
  private logDir = 'C:\\datafiles\\comandas';
  private logFilePath = path.join(this.logDir, 'logs_kiosko.txt');

  constructor() {
    this.ensureDirectoryExists();
  }

  // Crea la carpeta si no existe
  private ensureDirectoryExists(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('No se pudo crear el directorio de logs:', err);
    }
  }

  private formatLog(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(this.sanitizeData(data))}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  // Evitamos errores de clonación y manejamos objetos complejos para el texto
  private sanitizeData(data: any): any {
    try {
      if (data instanceof Error) {
        return { message: data.message, stack: data.stack };
      }
      return data;
    } catch {
      return '[Data no serializable]';
    }
  }

  private writeToFile(text: string): void {
    try {
      // AppendFileSync añade el texto al final del archivo sin borrar lo anterior
      fs.appendFileSync(this.logFilePath, text + '\n', 'utf8');
    } catch (err) {
      console.error('Error escribiendo en el archivo de logs:', err);
    }
  }

  private addLog(level: LogLevel, message: string, data?: any): void {
    const formattedText = this.formatLog(level, message, data);
    
    // 1. Imprimir en consola de la terminal
    console.log(formattedText);

    // 2. Guardar en el archivo TXT
    this.writeToFile(formattedText);

    // 3. Mantener en memoria (por si aún quieres verlos en la UI)
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data)
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
  }

  error(message: string, data?: any): void {
    this.addLog(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.addLog(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.addLog(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.addLog(LogLevel.DEBUG, message, data);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export default new Logger();