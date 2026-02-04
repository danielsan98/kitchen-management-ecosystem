import { electronAPI } from '@electron-toolkit/preload'

const { contextBridge } = require('electron');

// Custom APIs for renderer
const api = {}

// Use contextBridge APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) { 
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else { // Esta rama es la que se ejecuta porque contextIsolation: false
  // @ts-ignore (define in dts)
  window.electron = electronAPI // Esto expone window.electron.ipcRenderer
  // @ts-ignore (define in dts)
  window.api = api
}