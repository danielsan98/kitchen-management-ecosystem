import os
import scalalib
import urllib2
import urllib
import json
import xml.etree.ElementTree as ET
import logging
import time
import jwt
import requests
import codecs


#TODO: Definir la ruta de los logs
# logs_path = "C:\\datafiles\\pickup\\order_logs.txt"
svars = scalalib.sharedvars()
# token_path = "C:\\datafiles\\pickup\\access.info"
metadata_dict = {} # Diccionario para almacenar los metadatos

# orders_record_file_path = "C:\\datafiles\\pickup\\orders_record.txt"

def verifyPickupFolderExists(filename):
    directory = os.path.dirname(filename)
    if not os.path.exists(directory):
        os.makedirs(directory)

# Funcion que obtiene todos los metadatos
def load_metadata():
    global hostname
    global base_url

    try:
        ruta_metadata = "C:\\ProgramData\\Scala\\InfoChannel Player 5\\Network\\"
        archivos = os.listdir(ruta_metadata)
    except:
        ruta_metadata = "C:\\Documents and Settings\\All Users\\Datos de programa\\Scala\\InfoChannel Player 5\\Network\\"
        archivos = os.listdir(ruta_metadata)

    for archivo in archivos:
        if "metadata" in archivo:
            tree = ET.parse(ruta_metadata + archivo)
            root = tree.getroot()
            for entry in root.findall('entry'):
                name = entry.get('name')  # Obtener el atributo 'name'
                value = entry.get('value')  # Obtener el valor en "value"
                type = entry.get('type')  # Obtener el tipo en "type"

                # Convertir el valor dependiendo del tipo
                if type == "string":
                    value = str(value)
                elif type == "integer":
                    value = int(value)
                elif type == "float":
                    value = float(value)
                elif type == "boolean":
                    value = bool(value)
                
                # Guardar en el diccionario
                metadata_dict[name] = value

def getMetadataValue (metadato, default_value=None):
    """
    Obtiene el valor de un metadato del diccionario metadata_dict.
    Si el metadato no existe, devuelve default_value.
    """
    value = metadata_dict[metadato]

    if value is None or value == "":
        return default_value

    return value


#Funcion que revisa si existe el archivo acces.info
def tokenFileExists():
    if not os.path.exists(token_path):
        logging.error("El archivo de token no existe")
        return False
    return True

def signIn(baseURL):
    ruta = baseURL + "/auth"

    body = {
        "email": "pickup@multimediacorp.net",
        "password": "pickupcnmxmmc"
    }

    consulta = urllib2.Request(ruta, json.dumps(body), {'Content-Type': 'application/json'})

    try:
        respuesta = urllib2.urlopen(consulta, timeout=10)
        info = respuesta.read()

        saveToFile(info, token_path)
        logging.info("Token creado en " + token_path)

        return json.loads(info)
    except urllib2.HTTPError as e:
        logging.error("Error HTTP: " + str(e.code) + " - " + e.msg)
    except ValueError as e:
        logging.error("Error en el JSON: " + str(e))
    except Exception as e:
        logging.error("Error general: " + str(e))

def getAccessToken():
    token_data = readFromFile(token_path)
    
    token_json = json.loads(token_data)
    access_token = token_json.get("access_token")
    return access_token

def refreshNeeded():
    """
    Verifica si el token necesita ser refrescado.
    Retorna True si el token no existe o si ha expirado.
    """
    if not tokenFileExists():
        return True
    
    token_data = readFromFile(token_path)

    try:
        token_json = json.loads(token_data)
        # print ("Token JSON:\n" + json.dumps(token_json, indent=2, ensure_ascii=False))
        if isinstance(token_json, str):
            token_json = json.loads(token_json)
        access_token = token_json.get("access_token")
        
        decoded = jwt.decode(access_token, verify=False)
        expires_at = decoded.get("exp")
        
        if not expires_at:
            logging.info("El token no tiene fecha de expiracion, se necesita refrescar")
            return True
        
        # Verificar si la fecha de expiracion es pasada
        if expires_at < int(time.time()):
            logging.info("El token ha expirado, se necesita refrescar")
            return True
        
        logging.info("El token es valido y no necesita refresco")
        return False
    except ValueError as e:
        logging.error("Error al procesar el JSON del token: " + str(e))
        return True

def refreshToken(baseURL):
    if not tokenFileExists():
        logging.error("No se puede refrescar el token porque el archivo no existe")
        return None
    
    ruta_refresh = baseURL + "/auth/refresh-token"

    token_data = readFromFile(token_path)

    try:
        token_json = json.loads(token_data)
        refresh_token = token_json.get("refresh_token")

        if not refresh_token:
            logging.error("El refresh token no se encuentra en el archivo")
            return None
        
        logging.info("Refrescando token...")

        consulta = urllib2.Request(ruta_refresh, json.dumps({"refreshToken": refresh_token}), {'Content-Type': 'application/json'})

        respuesta = urllib2.urlopen(consulta, timeout=10)

        if respuesta.getcode() == 201:
            new_token_data = respuesta.read()
            # with open(token_path, "w") as file:
            #     file.write(new_token_data)
            saveToFile(new_token_data, token_path)
            logging.info("Token actualizado exitosamente")
            print("Token actualizado exitosamente")
            return json.loads(new_token_data)
        else:
            logging.error("Error al refrescar el token: " + str(respuesta.status_code) + " - " + respuesta.reason)
            return None
    except ValueError as e:
        logging.error("Error al procesar el JSON del token: " + str(e))
    except Exception as e:
        logging.error("Error general al refrescar el token: " + str(e))


#* Funcion nueva para obtener la API usando requests para token
def getApi(baseURL, endpoint, params=None, headers=None):
    ruta_api = baseURL + endpoint
    try:
        response = requests.get(ruta_api, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        logging.error("Error HTTP: " + str(e.response.status_code) + " - " + e.response.reason)
    except ValueError as e:
        logging.error("Error en el JSON: " + str(e))
    except Exception as e:
        logging.error("Error general: " + str(e))
    return None


#* Funcion con login de usuario
def getOrders(pickup_api_url, player_ip_A1, player_port_A1, player_user_A1, player_pass_A1, hostname, page, limit=None, token=None, preparationStatus=None):
    try:
        params = {}
        if hostname is not None:
            params["hostname"] = hostname
        params["page"] = page if page is not None else 1
        if limit is not None:
            params["limit"] = limit
        if preparationStatus is not None:
            params["preparationStatus"] = preparationStatus
        if player_ip_A1 is not None:
            params["playerIp"] = player_ip_A1
        if player_port_A1 is not None:
            params["port"] = player_port_A1
        if player_user_A1 is not None:
            params["playerUser"] = player_user_A1
        if player_pass_A1 is not None:
            params["playerPass"] = player_pass_A1
        

        logging.info("Obteniendo ordenes con parametros: " + str(params))

        headers = {}
        if token:
            headers['Authorization'] = 'Bearer ' + token

        orders = getApi(pickup_api_url, "/order/get-orders", params, headers)
        return orders

    except Exception as e:
        logging.error("Error obteniendo ordenes: " + str(e))
        return []

#! Por ahora no esta en uso
def flatten_orders_dynamic(response):
    
    if not response or 'data' not in response or not response['data']:
        return []
    
    # Obtener los campos del primer objeto
    fields = list(response['data'][0].keys())
    
    flattened = []
    for order in response['data']:
        flattened.extend([order.get(field) for field in fields])
    
    # return fields, flattened  # Devuelve tambien los campos para referencia
    #* Orden de los campos: [u'orderId', u'preparationStatusText', u'preparationReference', u'dateTime', u'preparationStatus', u'salesChannel', u'updatedAt', u'id', u'createdAt']
    return flattened

# Esta funcion solo regresa el orderId y el estatus de preparacion

#! Funcion sin unicode
# def flatten_orders(response, limit_per_page):
#     array_aplanado = []
#     if not response or 'data' not in response or not response['data']:
#         for _ in range(limit_per_page):
#             array_aplanado.extend(["", ""])  # Cada "orden" tiene n campos, en este caso 2 campos
#         return array_aplanado
    
#     for order in response['data']:
#         array_aplanado.extend([
#             order.get('customerName', '').encode('utf-8'), # Usar .get para evitar KeyError si la clave no existe
#             order.get('orderId', '').encode('utf-8'), # Asegurarse de que el valor sea una cadena
#             # order.get('preparationStatusText', '')
#         ])
    
#     orders_received = len(response['data'])
#     missing_orders_count = limit_per_page - orders_received

#     if missing_orders_count > 0:
#         for _ in range(missing_orders_count):
#             array_aplanado.extend(["", ""]) # Cada "orden" tiene 2 campos
    
#     return array_aplanado

#* Funcion con unicode
def flatten_orders(response, limit_per_page):
    array_aplanado = []
    if not response or 'data' not in response or not response['data']:
        for _ in range(limit_per_page):
            array_aplanado.extend([u"", u""])  # Usa unicode vacío
        return array_aplanado

    for order in response['data']:
        array_aplanado.extend([
            order.get('customerName', u''),  # No codificar aquí
            order.get('id', u''), #? Cambio de nombre del campo a id
        ])

    orders_received = len(response['data'])
    missing_orders_count = limit_per_page - orders_received

    if missing_orders_count > 0:
        for _ in range(missing_orders_count):
            array_aplanado.extend([u"", u""])
    #* Orden de los campos en el array aplanado: [customerName1, orderId1, customerName2, orderId2, ..., customerNameN, orderIdN]
    return array_aplanado

def saveToFile(data, filename):
    directory = os.path.dirname(filename)
    if not os.path.exists(directory):
        os.makedirs(directory)
    with codecs.open(filename, "w", encoding='utf-8') as file:
        file.write(data)

def readFromFile(filename):
    with open(filename, "r") as file:
        return file.read()
    
# def verifyFolderExists(filename):
#     directory = os.path.dirname(filename)
#     if not os.path.exists(directory):
#         os.makedirs(directory)

def verifyFolderExists(path):
    if os.path.isdir(path):
        directory = path
    else:
        directory = os.path.dirname(path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

# ---------------------------------- Ejecucion principal ----------------------------------
#Obtener metadatos
load_metadata()

hostname = getMetadataValue("Player.A1.HOSTNAME", "Unknown Hostname")
pickup_api_url = getMetadataValue("Player.Pickup.test.URL", "Unknown IP")
# pickup_api_url = getMetadataValue("Player.Pickup.URL", "Unknown IP")
player_ip_A1 = getMetadataValue("Player.ipA1", "Unknown IP")
player_user_A1 = getMetadataValue("Player.UserA1", "Unknown User")
player_pass_A1 = getMetadataValue("Player.PassA1", "Unknown Password")
datafiles_path = getMetadataValue("Player.DATA_FILES", "C:\\datafiles\\")
player_port_A1 = getMetadataValue("Player.portA1", "Unknown Port")

pickup_path = os.path.join(datafiles_path, "pickup")
# pickup_path = datafiles_path + "pickup"
# pickup_path = "C:\\datafiles\\pickup"
logs_path = pickup_path + "/order_logs.txt"
token_path = os.path.join(pickup_path, "access.info")
orders_record_file_path = os.path.join(pickup_path, "orders_record.txt")


# Verificar si el archivo de log existe, si no, crearlo
verifyFolderExists(pickup_path)
verifyFolderExists(logs_path)
verifyFolderExists(orders_record_file_path)
verifyFolderExists(token_path)

if not os.path.exists(logs_path):
    with open(logs_path, "w") as f:
        pass  # Crea el archivo vacio si no existe 

# Configurar logging para ver los mensajes
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()],
    filename=logs_path,
    filemode='a'
)


if svars.page_pending is None:
    svars.page_pending = 1  # Inicializar la pagina pendiente si no esta definida


if svars.page_completed is None:
    svars.page_completed = 1  # Inicializar la pagina completada si no esta definida

# page_pending = 1
# page_completed = 1




PENDING_ORDERS_LIMIT = 6
COMPLETED_ORDERS_LIMIT = 6 #* Cambio de 2 a 6

#Validacion de login 
if not tokenFileExists():
    logging.info("Archivo de token no encontrado, iniciando sesion...")
    print("Archivo de token no encontrado, iniciando sesion...")
    result = signIn(pickup_api_url)
    if not result or not tokenFileExists():
        logging.error("No se pudo crear el archivo de token, abortando ejecución.")
        exit(1)
else:
    logging.info("Archivo de token encontrado, revisando si necesita refrescarse...")
    if refreshNeeded():
        logging.info("Token necesita refresco, refrescando...")
        refreshed = refreshToken(pickup_api_url)
        if not refreshed or not tokenFileExists():
            logging.error("No se pudo refrescar el token, iniciando sesion de nuevo...")
            result = signIn(pickup_api_url)
            if not result or not tokenFileExists():
                logging.error("No se pudo crear el archivo de token, abortando ejecución.")
                exit(1)
    else:
        logging.info("Token aun valido, continuando con la ejecucion")


# Obtener el token de acceso
access_token = getAccessToken()
# access_token = ""

#Obtener las ordenes pendientes
# def getOrders(ip, player_ip_A1, player_user_A1, player_pass_A1, hostname, page, preparationStatus, limit=None, token=None):

response_ordenes_pendientes = getOrders(pickup_api_url, player_ip_A1, player_port_A1, player_user_A1, player_pass_A1, hostname, svars.page_pending, limit=PENDING_ORDERS_LIMIT, token=access_token)

if response_ordenes_pendientes["next"] == True:
    print("Hay mas ordenes pendientes, incrementando la pagina")    
    svars.page_pending += 1
    # page_pending += 1
else:
    svars.page_pending = 1
    # page_pending = 1

response_ordenes_completadas = getOrders(pickup_api_url, player_ip_A1, player_port_A1, player_user_A1, player_pass_A1, hostname, svars.page_completed, limit=COMPLETED_ORDERS_LIMIT, token=access_token, preparationStatus=5)  # 5 es el estatus de orden completada

if response_ordenes_completadas["next"] == True:
    print("Hay mas ordenes completadas, incrementando la pagina")
    svars.page_completed += 1
    # page_completed += 1
else:
    svars.page_completed = 1
    # page_completed = 1

# print("Respuesta de la API de ordenes pendientes:\n" + json.dumps(response_ordenes_pendientes, indent=2, ensure_ascii=False))
# print("Respuesta de la API de ordenes completadas:\n" + json.dumps(response_ordenes_completadas, indent=2, ensure_ascii=False))


# Aplanar las ordenes pendientes
flat_orders_pendientes = flatten_orders(response_ordenes_pendientes, PENDING_ORDERS_LIMIT) if response_ordenes_pendientes else []
print("Ordenes pendientes aplanadas: ", flat_orders_pendientes)

# Aplanar las ordenes completadas
flat_orders_completadas = flatten_orders(response_ordenes_completadas, COMPLETED_ORDERS_LIMIT) if response_ordenes_completadas else []
# print("Ordenes completadas aplanadas: ", flat_orders_completadas)

flat_orders = flat_orders_pendientes + flat_orders_completadas

# print("Ordenes aplanadas: ", flat_orders)

saveToFile(json.dumps(flat_orders, indent=4, ensure_ascii=False), orders_record_file_path)

# Guardar las ordenes pendientes y completadas en sharedvars
svars.arrPendingOrders = flat_orders_pendientes
svars.arrCompletedOrders = flat_orders_completadas






# ---------------------------------- Ejecucion de Pruebas ----------------------------------
