# Sistema de Visualización de Órdenes de Recogida (Pickup) de Cinemex

## Propósito General
Sistema de integración que utiliza Python para interactuar con la API de pedidos de Cinemex, obtener el estado de las órdenes (En Preparación y Completadas), y luego las inyecta en una pantalla de señalización digital operada por Scala InfoChannel para informar a los clientes sobre el estado de su pedido.

## Funcionalidades Principales

### 1. **Gestión de Metadatos**
El script de Python (cinemex-orders-script.py) carga y utiliza la configuración del reproductor Scala para la operación del sistema.
- **Carga metadatos:** Se obtienen variables de entorno y configuración de la instalación de Scala, incluyendo Player.A1.HOSTNAME, URLs de API (Player.Pickup.test.URL), y credenciales del reproductor.
- **Definición de rutas:** Se definen rutas de archivos importantes, incluyendo la ruta de logs (logs_path), la ruta para el token de acceso (token_path), y la ruta para el registro de órdenes (orders_record_file_path), todas ellas dentro de un subdirectorio pickup.
- **Límites de visualización (Parametrizables):** Se establecen límites fijos para la cantidad de órdenes a solicitar por página para órdenes pendientes (PENDING_ORDERS_LIMIT = 6) y completadas (COMPLETED_ORDERS_LIMIT = 6).

### 2. **Autenticación con API**
El sistema garantiza un acceso seguro y continuo a la API de pedidos.
**Flujo de acceso:**
- Verifica la existencia del archivo de token (access.info).
- Si no existe, realiza un signIn a /auth con credenciales fijas para obtener un access_token y un refresh_token.
- Si el archivo existe, verifica si el access_token ha expirado mediante decodificación JWT y la fecha de expiración (exp).
- Si el token expiró, realiza un refreshToken a /auth/refresh-token. Si el refresco falla, intenta un signIn completo nuevamente.
- **Persistencia:** El token de acceso y de refresco se guardan en el archivo access.info.

### 3. **Obtención y Procesamiento de Órdenes**
Se realiza la comunicación con la API y el tratamiento de la respuesta para el formato de visualización.
- **Llamadas a la API:** Se utiliza la función getOrders (usando la librería requests) para consultar el endpoint /order/get-orders, aplicando filtros por hostname, página (page), límite (limit), y, para órdenes completadas, el estado de preparación (preparationStatus=5).
- **Paginación:** Las variables compartidas de Scala (svars.page_pending y svars.page_completed) controlan qué página de resultados se solicita. Si la respuesta de la API indica que hay más resultados ("next" == True), la página se incrementa para la siguiente ejecución; de lo contrario, se reinicia a 1.
- **Aplanamiento de Datos:** La función flatten_orders toma la respuesta JSON de la API y crea un arreglo aplanado (array_aplanado) que incluye los campos customerName y el id (anteriormente orderId o preparationReference) de forma consecutiva.
- **Relleno de Arreglos:** Si la cantidad de órdenes recibidas es menor que el límite (PENDING_ORDERS_LIMIT o COMPLETED_ORDERS_LIMIT), el arreglo aplanado se rellena con cadenas vacías (u"") para mantener una longitud consistente para Scala.
- **Entrega de Variables:** Los arreglos aplanados resultantes (flat_orders_pendientes y flat_orders_completadas) se almacenan en las variables compartidas de Scala (svars.arrPendingOrders y svars.arrCompletedOrders).

# Especificaciones de Visualización
El script cinemex_pickup_led.sca define la interfaz gráfica y la lógica de visualización en la pantalla.

## 1. Configuración General

- **Tamaño:** La configuración de fondo indica un tamaño de pantalla de 678×344 píxeles.
- **Variables Compartidas:** Se declaran arreglos de cadenas para las órdenes (arrCompletedOrders[100], arrPendingOrders[100]) y variables de enteros para colores y paginación.
- **Tiempo en Pantalla:** La duración de la visualización (on_screen_time) se establece en 5000 ms (5 segundos).
- **Tipografía:** Se definen varias fuentes, incluyendo letter_font_tradicional (VVDSFifties-CondSBold) y maison_font_book (MaisonNeue-Book) para distintos elementos de texto.


## 2. Estructura de la Pantalla
El diseño principal consiste en dos secciones claramente delimitadas para Órdenes en Preparación y Órdenes Listas.

### A. Configuración de elementos de visualización

+-----------------+---------------------------------+------------------------------------------+-------------------+------------------------------+
| Elemento        | Propósito                       | Configuración Principal                  | Coordenadas       | Fuentes                      |
+=================+=================================+==========================================+===================+==============================+
| Fondo           | Base del diseño                 | Imagen: assets\bg_blanco.jpg    | Pantalla completa | N/A                          |
+-----------------+---------------------------------+------------------------------------------+-------------------+------------------------------+
| FondoDerecho    | Rectángulo lateral              | Rect de color blanco por defecto (Pen 3) | 317, 0, 361, 344 | N/A                          |
+-----------------+---------------------------------+------------------------------------------+-------------------+------------------------------+
| Título 1        | Título de órdenes pendientes    | Texto: PREPARACIÓN            | 25, 34 | letter_font_tradicional, 64 |
+-----------------+---------------------------------+------------------------------------------+-------------------+------------------------------+
| Subtítulo 1     | Subtítulo de órdenes pendientes | Texto: Ordenes en             | 24, 15 | maison_font_book, 24 |
+-----------------+---------------------------------+------------------------------------------+-------------------+------------------------------+


### B. Despliegue de órdenes 

+-----------+----------------------------------+------------------------------+----------------------------------+------------------+
| Columna   | Título Superior                  | Variable de Scala            | Posiciones de Muestra (Índice Scala) | Coordenada Y (Inicio) |
+===========+==================================+==============================+==================================+==================+
| Izquierda | Ordenes en PREPARACIÓN           | arrPendingOrders             | 1, 3, 5, 7, 9, 11                | [cite_start]105 [cite: 2]    |
+-----------+----------------------------------+------------------------------+----------------------------------+------------------+
| Derecha   | Ordenes Listas PARA RECOGER      | arrCompletedOrders           | 1, 3, 5, 7, 9, 11                | [cite_start]105 [cite: 2]    |
+-----------+----------------------------------+------------------------------+----------------------------------+------------------+

