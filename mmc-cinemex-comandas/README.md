# Sistema de Gestión de Taquillas Cinemex

## Propósito General
Sistema de visualización (Kitchen Display System - KDS) que optimiza los flujos de trabajo en cocina, bar y dulcería. Su objetivo es eliminar la latencia en la comunicación y proporcionar una interfaz de usuario ágil y con retroalimentación inmediata.

## Funcionalidades Principales

### 1. **Gestión de Ítems y estado**
- Seguimiento del progreso usando quantity vs. completedQuantity.
- Actualización optimista del estado local en React (App.tsx) tras la acción del usuario.
- Cierre automático de la orden (preparationStatus = 5) cuando todos los ítems están completados.

### 2. **Comunicación con API y sincrinización**
- Llamadas PATCH autenticadas a la API para actualizar la completedQuantity.
- Uso de Electron IPC para la comunicación entre el backend y el frontend.
- Sincronización periódica de órdenes desde el cron del backend para validar el estado.

### 3. **Filtros y Agrupación**
- Filtrado de órdenes por Zona de Trabajo (Cocina, Bar, etc.).
- Filtrado por Estado (Alertadas, Completadas).
- Enriquecimiento de datos para calcular el tiempo promedio de preparación.

### 4. **Estilos y Prioridad Visual**
- Aplicación de borde azul claro (info) a las órdenes Completadas.
- Supresión del ícono de alerta (isDelayed) en las órdenes que están Completadas.


# Especificaciones de Visualización


## 1. Configuración General

- **Dispositivos:** Soporte para múltiples pantallas
- **Ciclo de actualización:** Sincronización del backend con la API cada 1 minuto (vía cron).
- **Datos Base:** Order, Item, preparationStatus, completedQuantity, isDelayed, isVIP.


## 2. Ciclo de Vida de la Orden

### A. Órdenes Prioritarias (Retrasadas / Alertadas)

- Son órdenes con preparationStatus != 5 (no completadas) y isDelayed = true.
- **Diseño:** Tarjeta Post-it (Card).
- **Estilo Visual:** Borde ROJO (danger).

**Reglas de Contenido:**

- **Muestra:** ID de Orden, Hora, Ítems, Ícono de Alerta.
- **Prevalencia:** Esta prioridad se anula si la orden alcanza el estado de Completada.
- **Iconografía:** Se debe mostrar el ícono de alerta (RiAlertFill).


### B. Órdenes VIP

- Se muestran con el ícono TbVip.
- **Prevalencia:** Se muestra independientemente de si está alertada o completada.


### C. Órdenes Completadas

- Son órdenes donde preparationStatus = 5

#### Reglas de Visualización 

- **Borde:** Azul Claro (info).
- **Ícono de alerta:** No visible, incluso si isDelayed es true.
- **Ítems:** El progreso de los ítems debe mostrarse como X/X.

#### Reglas de Cierre

- **Acción:** handleUpdateOrders en App.tsx realiza el cambio de estado.
- **Items:** El completedQuantity del ítem modificado se actualiza instantáneamente.
- **Orden:** Si order.orderItems.every(i => i.completedQuantity === i.quantity) es verdadero, order.preparationStatus se establece en 5.


