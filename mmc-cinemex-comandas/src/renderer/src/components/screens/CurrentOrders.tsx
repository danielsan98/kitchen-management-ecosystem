import { Accordion } from "react-bootstrap";
import Order from "./Order.js";


export interface OrderInterface {
    id: string | number;
    dateTime:     string; // fecha base para calcular tiempos de la alerta
    customerName: string;
    preparationStatus: number;
    completed?: boolean;
    orderItems?: Item[];
    totalTime?: number;
    alertTime?: boolean;
    isVIP?: boolean;
    averagePrepTime?: number;
    isDelayed?: boolean;
}

export interface ProductDetails { 
    id: number;
    productName: string;
    description: string;
    workZone: string;
    category: string;
    prepTime: number; // propiedad que se usa para la alerta de tiempo
    minPrepTime: number;
    maxPrepTime: number;
}

export interface Item {
    transId:       number;
    name:     string;
    quantity: number;
    preparationStatus: number;y
    comment?: string;
    completedQuantity: number;
    product?: ProductDetails
}

interface CustomToggleProps {
  data: OrderInterface[];
}

export default function CurrentOrders( {data} : CustomToggleProps  ) {

//  const [orders] = useState<OrderInterface[]>(data);  




  return (
    <Accordion defaultActiveKey="0" alwaysOpen>
      {
        data.map((order) => (
          <Order key={order.id} id={order.id} order={order}/>
        ))
      }
    </Accordion>
  )
}
