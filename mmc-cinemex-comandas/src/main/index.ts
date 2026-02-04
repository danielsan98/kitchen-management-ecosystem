import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import os from 'os'
import * as SocketIO from 'socket.io'
import { createServer } from 'http'
import logger from './utils/logger'
import * as dotenv from 'dotenv'
import axios from 'axios' // Usaremos el import estándar

// 1. Configuración de Entorno
dotenv.config()

// Forzamos la obtención de valores para evitar el "undefined"
const API_PORT = process.env.VITE_API_PORT || '5001'
const API_HOST = process.env.VITE_API_HOST || '100.91.8.11'
const API_URL = `http://${API_HOST}:${API_PORT}/api`

// LOG DE DEPURACIÓN: Esto aparecerá en tu C:\datafiles\comandas\logs_kiosko.txt
logger.info('Iniciando configuración de red...', { 
  host_detectado: API_HOST, 
  puerto_detectado: API_PORT,
  url_final: API_URL 
})

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 780,
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Obtener IPs y Hostname
  const hostname = os.hostname()
  const networkInterfaces = os.networkInterfaces()
  const ips: { family: string, ip: string }[] = []

  for (const name of Object.keys(networkInterfaces)) {
    networkInterfaces[name]?.forEach(net => {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ family: name, ip: net.address })
      }
    })
  }

  const osInfo = {
    hostname,
    IPs: ips,
    branchName: process.env.VITE_SUCURSAL_MONITOR 
  }

  logger.info('Informacion del sistema operativo:', osInfo)

  // REGISTRO DEL CLIENTE
  axios.post(`${API_URL}/clients/registerClient`, osInfo)
    .then(response => {
      logger.info('Cliente registrado con éxito en la API:', response.data)
    })
    .catch(error => {
      // Aquí verás si la URL sigue saliendo mal
      logger.error('Error al registrar el cliente:', { 
        mensaje: error.message,
        url_intentada: `${API_URL}/clients/registerClient`
      })
    })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function socketListener(port: number, mainWindow: BrowserWindow) {
  try {
    const httpServer = createServer()
    const io = new SocketIO.Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    })

    io.on('connection', (socket) => {
      logger.info('Socket conectado:', { socketId: socket.id })
      
      socket.on('orders-update', (data) => {
        logger.info('Update de órdenes recibido')
        const ordersArray = data && Array.isArray(data.orders) ? data.orders : []
        mainWindow.webContents.send("orders-update", { orders: ordersArray })
      })
    })

    httpServer.listen(port, () => {
      logger.info('Servidor de sockets local escuchando en puerto:', { port })
    })
  } catch (error) {
    logger.error('Error en servidor de sockets:', { error })
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()
  socketListener(5101, mainWindow)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('get-env', (_, key) => {
  return process.env[key] || null
})

// ELIMINADA LA LLAVE EXTRA QUE HABÍA AQUÍ