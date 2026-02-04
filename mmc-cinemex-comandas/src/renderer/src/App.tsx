// import { useTranslation } from 'react-i18next'
import { Button, Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { TbToolsKitchen2 } from "react-icons/tb";
import { BiSolidDrink } from "react-icons/bi";
import { LuPopcorn } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { LuLeafyGreen } from "react-icons/lu";
import { TbMeat } from "react-icons/tb";
import { PiWarningBold } from "react-icons/pi";
import { VscEye } from "react-icons/vsc";
import { HiMiniLanguage } from "react-icons/hi2";
import { BsMoon } from "react-icons/bs";
import { FiSun } from "react-icons/fi";
import CurrentOrders, { OrderInterface } from './components/screens/CurrentOrders.js';
import CardOrders from './components/screens/CardOrders.js';
// import AuthContext from '@auth/context/AuthContext';
import AuthContext from '../../auth/context/AuthContext.js';
import { enrichOrderWithTimeData } from './utils/orderUtils.js';
import { TiTickOutline } from "react-icons/ti";

export interface GeneralOptions {
  theme: string;
  language: string
}

const init = (): GeneralOptions => {
  const options: GeneralOptions = {
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'sp'
  }
  return options;
}

const saveOption = (key: string, value: string) => {
  const options = init();
  options[key] = value;
  localStorage.setItem(key, value);
}

//?

function App(): JSX.Element {
  const [language, setLanguage] = useState<string>(init().language);
  // const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<string>(init().theme);
  const [isListView, setListView] = useState(false);


  const [ordersData, setOrdersData] = useState<OrderInterface[]>([]); //* Doble arreglo: ordersData (datos de API-electron)

  const [orders, setOrders] = useState<OrderInterface[]>([]); // Arreglo a renderizar filtrado

  const [statusFilters, setStatusFilters] = useState<string[]>([]); //* Filtros de estado (alertados, pendientes)
  const [workZoneFilters, setWorkZoneFilters] = useState<string[]>([]); //* Filtros de zona de trabajo



  // const [authenticated, setAuthenticated] = useState(false);

  const { token } = useContext(AuthContext);



  const applyFilters = (
    data: OrderInterface[],
    activeWorkZones: string[],
    activeStatusFilters: string[]
  ) => {
    let filteredOrders = [...data];

    // Filtro de status de la orden 
    if (activeStatusFilters.length > 0) {
      filteredOrders = filteredOrders.filter(order => {

        let isIncludedByStatus = false;

        const isAlerted = activeStatusFilters.includes('alertados') && order.isDelayed === true;

        const isCompleted = activeStatusFilters.includes('completadas') && order.preparationStatus === 5;


        if (activeStatusFilters.length === 1 && activeStatusFilters.includes('alertados')) {
          return isAlerted;
        }


        if (isAlerted || isCompleted) {
          isIncludedByStatus = true;
        }

        return isIncludedByStatus;
      });
    } else {
      filteredOrders = filteredOrders.filter(order => order.preparationStatus === 2);
    }

    // Filtro de zonas de trabajo
    if (activeWorkZones.length > 0) {
      filteredOrders = filteredOrders
        .map(order => {
          // Crear una copia de la orden para modificar solo los orderItems
          const filteredOrder: OrderInterface = { ...order, orderItems: order.orderItems ? [...order.orderItems] : [] };


          const filteredItems = order.orderItems?.filter(item => {
            const itemWorkZone = item.product?.workZone;
            return itemWorkZone && activeWorkZones.includes(itemWorkZone);
          });

          // Si la orden aún tiene items después de filtrar, la incluimos
          if (filteredItems && filteredItems.length > 0) {
            filteredOrder.orderItems = filteredItems;
            return filteredOrder;
          }


          return null;
        })
        .filter((order): order is OrderInterface => order !== null);
    }

    // ordenes a renderizar
    setOrders(filteredOrders);
  };



  useEffect(() => {
    const win: any = window;
    const ipc = win?.electron?.ipcRenderer;

    if (!ipc) {
      console.error('ipcRenderer no disponible (preload no expuso la API).');
      return;
    }

    // Escuchar órdenes desde electron
    const updateListener = (_: any, payload: any) => {


      const ordersData: OrderInterface[] = payload.orders;

      // console.log('Órdenes recibidas en App.tsx:', payload);
      // console.log('Contenido de ordersData:', ordersData);

      if (ordersData && Array.isArray(ordersData)) {

        const enrichedOrders = ordersData.map(order => enrichOrderWithTimeData(order));

        setOrdersData(enrichedOrders);

        // Fusionar con órdenes existentes para evitar duplicados
        setOrders((prevOrders) => {
          const newOrders = [...prevOrders];

          enrichedOrders.forEach((newOrder: OrderInterface) => {
            const existingIndex = newOrders.findIndex(o => o.id === newOrder.id);

            if (existingIndex >= 0) {
              // newOrders[existingIndex] = { ...newOrders[existingIndex], ...newOrder };
              newOrders[existingIndex] = newOrder;
            } else {
              newOrders.push(newOrder);
            }
          });

          return newOrders;
        });
      }
    };

    ipc.on('orders-update', updateListener);

    const interval = setInterval(() => {
      setOrdersData((prevOrders) => {
        return prevOrders.map(order => enrichOrderWithTimeData(order));
      });
    }, 1000);

    return () => {
      ipc.removeListener('orders-update', updateListener);
      clearInterval(interval);
    };
  }, []);



  // Inicializar Keycloak
  // useEffect(() => {
  //   if (keycloak) {
  //     keycloak.init({
  //       onLoad: 'check-sso',
  //       silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  //       pkceMethod: 'S256',
  //     }).then((auth) => {
  //       setAuthenticated(auth);
  //     }).catch((error) => {
  //       console.error("Error initializing Keycloak:", error);
  //     });
  //   }
  // }, [keycloak]);

  useEffect(() => {
    // Cuando ordersData, statusFilters o workZoneFilters cambien, re-aplicar los filtros
    applyFilters(ordersData, workZoneFilters, statusFilters);

  }, [ordersData, workZoneFilters, statusFilters]); // Dependencias

  const handleChangeLanguage = (): void => {
    setLanguage((prevLang) => (prevLang === "es" ? "en" : "es"));
    // i18n.changeLanguage(language);
    saveOption("language", language);
  }

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  //! Obsoleto
  // const handleChange = (val: any) => {
  //   setValue(val)
  // };

  // const handleChangeOrdersStatus = (val: any) => {
  //   setPendingValue(val)

  //   if (val.includes("pendientes")) {
  //     setPendingOrders(false);
  //   } else {
  //     setPendingOrders(true);
  //   }
  // };



  const handleWorkZoneFilterChange = (val: string[]) => {
    setWorkZoneFilters(val); // Actualiza el estado de filtros de zona

    // Llama a applyFilters con el nuevo estado de zona y el estado actual de status
    applyFilters(ordersData, val, statusFilters);
  };

  const handleChangeOrdersStatus = (val: string[]) => {
    setStatusFilters(val); // Actualiza el estado de filtros de status

    // Llama a applyFilters con el nuevo estado de status y el estado actual de zona
    applyFilters(ordersData, workZoneFilters, val);
  };

  const handleUpdateOrders = (transId: number, completedQuantity: number) => {
    setOrdersData(prevOrdersData => {

      const newOrdersData = prevOrdersData.map(order => {
        // Encontrar si el ítem modificado pertenece a esta orden
        const itemIndex = order.orderItems?.findIndex(item => item.transId === transId);

        if (itemIndex !== undefined && itemIndex > -1 && order.orderItems) {
          // El ítem fue encontrado, crear una copia 
          const newOrder = { ...order };
          newOrder.orderItems = [...order.orderItems];

          const itemToUpdate = newOrder.orderItems[itemIndex];

          // Aplicar el cambio 
          itemToUpdate.completedQuantity = completedQuantity;
          if (completedQuantity === itemToUpdate.quantity) {
            // Marcar inmediatamente como completado si la cantidad es total
            itemToUpdate.preparationStatus = 5 as any;
          }

          const allItemsCompleted = newOrder.orderItems.every(i => (i.completedQuantity || 0) === i.quantity);
          if (allItemsCompleted) {
            newOrder.preparationStatus = 5 as any;
          }

          return newOrder;
        }
        return order; // Devolver órdenes no modificadas
      });

      // [ordersData] en el useEffect de applyFilters se encargará de actualizar 'orders' a renderizar
      return newOrdersData;
    });
  };





  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    saveOption("theme", theme);
  }

  const toggleView = () => {
    setListView(!isListView);
  }

  return (
    <Container fluid className="vh-100 d-flex flex-column">
      {/* Sección Superior */}
      <Row className="flex-grow-0">
        <Col className='mt-1' sm={3}>
          <ToggleButtonGroup type="checkbox" value={workZoneFilters} onChange={(val) => handleWorkZoneFilterChange(val as string[])} className='btn-group-lg'>
            <ToggleButton variant="outline-primary" id="tbg-btn-1" value={"Cocina"}>
              <div className="d-flex flex-column align-items-center">
                <TbToolsKitchen2 />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>COCINA</span>
              </div>
            </ToggleButton>
            <ToggleButton variant="outline-primary" id="tbg-btn-2" value={"Bar"}>
              <div className="d-flex flex-column align-items-center">
                <BiSolidDrink />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>BAR</span>
              </div>
            </ToggleButton>
            <ToggleButton variant="outline-primary" id="tbg-btn-3" value={"Dulceria"}>
              <div className="d-flex flex-column align-items-center">
                <LuPopcorn />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>DULCERÍA</span>
              </div>
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>

        <Col className='mt-1'>
          <ToggleButtonGroup type="checkbox" value={statusFilters} onChange={(val) => handleChangeOrdersStatus(val as string[])} className='btn-group-lg'>
            <ToggleButton variant="outline-primary" id="status-btn-1" value={"completadas"} >
              <div className="d-flex flex-column align-items-center">
                <TiTickOutline />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>LISTAS</span>
              </div>
            </ToggleButton>
            <ToggleButton variant="outline-danger" id="alert-btn-1" value={"alertados"}>
              <div className="d-flex flex-column align-items-center">
                <PiWarningBold />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>TARDE</span>
              </div>
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>

        <Col sm={2}>
          <div style={{ backgroundColor: "" }} className="d-flex justify-content-end mt-1 me-1">
            {theme === "light" ?
              <BsMoon size={45} className='btn btn-primary me-1' onClick={toggleTheme} /> :
              <FiSun size={45} className='btn btn-primary me-1' onClick={toggleTheme} />}
            {/* {
              language === "es" ?
                <HiMiniLanguage size={45} className='btn btn-primary' onClick={handleChangeLanguage} /> :
                <HiMiniLanguage size={45} className='btn outline-primary' onClick={handleChangeLanguage} />
            } */}
            <Button variant="outline-primary" onClick={toggleView}>
              <VscEye />
            </Button>
          </div>
        </Col>
      </Row>

      {/* Sección Inferior con Scroll */}
      <Row className="flex-grow-1 overflow-auto mt-4">
        <Col>
          {/* Debug: mostrar cantidad de órdenes */}
          {/* <div className="mb-2">
            <small>Órdenes cargadas: {orders.length}</small>
          </div> */}

          {isListView ? (
            <CurrentOrders key="CurrentOrders" data={orders} />
          ) : (
            <CardOrders key="CardOrders" data={orders} token={token || ""} onUpdateOrders={handleUpdateOrders} />
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default App