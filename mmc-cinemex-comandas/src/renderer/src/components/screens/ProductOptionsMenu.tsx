import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { updateItemCompletedQuantity } from '../../utils/itemUtils.js'; 
import { Item } from './CurrentOrders.js';


interface ProductOptionsMenuProps {
  product: Item; 
  onClose: () => void;
  onItemClosed: (transId: number, completedQuantity: number) => void; 
  token: string; //?
}

const ProductOptionsMenu: React.FC<ProductOptionsMenuProps> = ({ product, onClose, onItemClosed, token }) => {
  
  const [newCompletedQuantity, setNewCompletedQuantity] = useState(product.completedQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Propiedades  del producto
  const isSingleItem = product.quantity === 1;
  const maxClosableQuantity = product.quantity;
  
  const minClosableQuantity = product.completedQuantity; 
  
  // Condición para saber si el ítem ya está cerrado por completo
  const itemIsFullyCompleted = product.completedQuantity === product.quantity;

  const handleIncrement = () => {
    if (newCompletedQuantity < maxClosableQuantity) {
      setNewCompletedQuantity(newCompletedQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (newCompletedQuantity > minClosableQuantity) {
      setNewCompletedQuantity(newCompletedQuantity - 1);
    }
  };

  const handleCloseItem = async (quantityToClose: number) => {
    if (loading || itemIsFullyCompleted) return;
    
    setLoading(true);
    setError(null);

    try {
        // Llama a la utilidad de API con el nuevo total de ítems completados y el token
        await updateItemCompletedQuantity(product.transId, quantityToClose, token);
        
        // Notifica al componente padre para que refresque la vista
        onItemClosed(product.transId, quantityToClose); 
        
        onClose(); 
        
    } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  
  const handlePartialClose = () => {
    
    if (newCompletedQuantity > product.completedQuantity) {
      handleCloseItem(newCompletedQuantity);
    } else {
      onClose(); 
    }
  };

  const handleCloseAll = () => {
    handleCloseItem(product.quantity);
  };
  
  
  const renderCounterAndPartialClose = !isSingleItem && !itemIsFullyCompleted;
  
  
  const renderCloseAllButton = !isSingleItem && !itemIsFullyCompleted;

  
  let primaryAction;
  if (renderCounterAndPartialClose) {
    
    primaryAction = (
        <Button 
            variant="primary" 
            onClick={handlePartialClose} 
            disabled={loading || newCompletedQuantity <= product.completedQuantity}
        >
          {loading ? 'Guardando...' : `Completar ${newCompletedQuantity - product.completedQuantity} ítems`}
        </Button>
    );
  } else if (isSingleItem && !itemIsFullyCompleted) {
   
    primaryAction = (
        <Button variant="primary" onClick={() => handleCloseItem(product.quantity)} disabled={loading}>
          {loading ? 'Cerrando...' : 'Cerrar ítem'}
        </Button>
    );
  }


  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center justify-content-center">
        {error && <Alert variant="danger" className="w-100">{error}</Alert>}
        
        {renderCounterAndPartialClose && (
          <>
            <span style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cantidad a completar (Total: {product.quantity}):</span>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={handleDecrement} 
                className="me-3" 
                style={{ fontSize: '2rem' }} 
                disabled={newCompletedQuantity <= minClosableQuantity || loading}
              >
                -
              </Button>
              <span style={{ fontSize: '2rem' }}>{newCompletedQuantity}</span>
              <Button 
                variant="outline-secondary" 
                onClick={handleIncrement} 
                className="ms-3" 
                style={{ fontSize: '2rem' }} 
                disabled={newCompletedQuantity >= maxClosableQuantity || loading}
              >
                +
              </Button>
            </div>
            <p className='mt-2'>Ya completados: {product.completedQuantity}</p>
          </>
        )}
        
        {(isSingleItem && !itemIsFullyCompleted) && (
          <span style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            ¿Desea cerrar el ítem "{product.name}"?
          </span>
        )}
        
        {itemIsFullyCompleted && (
          <span style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'green' }}>
            Este producto ya está completamente completado.
          </span>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cerrar
        </Button>

        {primaryAction}
        
        {renderCloseAllButton && (
          <Button variant="danger" onClick={handleCloseAll} disabled={loading}>
            {loading ? 'Cerrando todos...' : `Cerrar todos los ${product.quantity} ítems`}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ProductOptionsMenu;