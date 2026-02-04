// CardOrders.tsx
import React, { useState } from 'react';
import { Card, ListGroup, Button } from "react-bootstrap";
import { OrderInterface, Item } from "./CurrentOrders.js";
import { RiAlertFill } from "react-icons/ri";
import { TbVip } from "react-icons/tb";
import './CardOrders.css';
import ProductOptionsMenu from './ProductOptionsMenu.js';

interface CustomToggleProps {
  data: OrderInterface[];
  token: string; //?
  onUpdateOrders: (transId: number, completedQuantity: number) => void;
}

const CardOrders: React.FC<CustomToggleProps> = ({ data, token, onUpdateOrders }) => {
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

  const handleProductClick = (product: Item) => setSelectedProduct(product);
  const handleCloseMenu = () => setSelectedProduct(null);

  const handleItemClosed = (transId: number, completedQuantity: number) => {


    console.log(`Ítem con transId ${transId} cerrado. El backend debería notificar la actualización.`);
    onUpdateOrders(transId, completedQuantity);
    handleCloseMenu();
  };

  return (
    <div className="masonry-container">
      {data.map((order) => {

        // LÓGICA DE ESTADO VISUAL: El completado anula el alertamiento.
        const isCompleted = order.preparationStatus === 5;
        const isAlerted = order.isDelayed && !isCompleted;

        // Define el borde: info (completada) > danger (alerta) > primary (normal)
        const cardBorder = isCompleted ? "info" : isAlerted ? "danger" : "primary";

        return (
          <div key={order.id} className="masonry-item">
            <Card
              border={cardBorder} // Usa el borde determinado
              className="p-1 card-postit"
            >
              <Card.Header className="p-1 d-flex justify-content-between align-items-center" style={{ height: '40px' }}>
                <strong className="fs-6">#{order.id}</strong>
                <div>
                  {/* Ícono de alerta solo si isAlerted es true */}
                  {isAlerted && (
                    <Button variant="" className="me-1 border-0 p-0">
                      <RiAlertFill size={25} color="red" />
                      <span className="visually-hidden">Delayed order</span>
                    </Button>
                  )}
                  {order.isVIP && (
                    <Button variant="" className="me-1 border-0 p-0">
                      <TbVip size={25} color="purple" />
                      <span className="visually-hidden">VIP customer</span>
                    </Button>
                  )}
                </div>
              </Card.Header>

              <Card.Body className="p-1">
                <div>
                  <strong>Hora:</strong>{' '}
                  {new Date(order.dateTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {order.averagePrepTime !== undefined && (
                    <span className="text-muted small ms-2">
                      ({order.averagePrepTime} min promedio)
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <strong>Productos:</strong>
                  <ListGroup variant="flush">
                    {order.orderItems?.map((product) => {

                      const preparedCount = product.completedQuantity || 0; // Usar completedQuantity

                      return (
                        <Button
                          key={product.transId}
                          variant="light"
                          className="p-1 fs-6 w-100 text-start mt-1"
                          onClick={() => handleProductClick(product)}
                        >
                          {/* Muestra el progreso real */}
                          {`${preparedCount}/${product.quantity} x ${product.name}`}
                          {product.comment && (
                            <div className="text-muted small">{product.comment}</div>
                          )}
                        </Button>
                      );
                    })}
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>
          </div>
        );
      })}

      {selectedProduct && (
        <ProductOptionsMenu
          product={selectedProduct}
          onClose={handleCloseMenu}
          onItemClosed={handleItemClosed}
          token={token} //? Pasamos el token
        />
      )}
    </div>
  );
};

export default CardOrders;