import { Accordion, Badge, Button, Card, ProgressBar, Table } from "react-bootstrap";
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { OrderInterface } from "./CurrentOrders.js";
import { RiAlertFill } from "react-icons/ri";
import { TbVip } from "react-icons/tb";
// import { useState } from "react";

function CustomToggle({ children, eventKey, total, prepared, alertTime }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
        console.log('totally custom!'),
    );

    const percent = (prepared * 100 / total);
    let color;

    const timeRemaining = alertTime ? 0 : 10; // Ejemplo de tiempo restante en minutos

    if (percent >= 100) {
        color = 'success';
    } else if (percent >= 50) {
        color = 'warning';
    } else {
        color = 'danger';
    }

    return (
        <>
            <ProgressBar now={percent} className="mb-2" variant={color} style={{ height: '5px' }} />
            <button
                className="btn btn-light me-2"
                type="button"
                // style={{ backgroundColor: 'pink' }}
                onClick={decoratedOnClick}
            >
                {children}
            </button>
            <Button variant="" className="btn-outline-info me-2 border-0">
                Productos <Badge bg="success">{total}</Badge>
                <span className="visually-hidden">unread messages</span>
            </Button>
            <Button variant="" className="btn-outline-info me-2 border-0">
                Preparados <Badge bg="info">{prepared}</Badge>
                <span className="visually-hidden">unread messages</span>
            </Button>
            
            <Button variant="" className="btn-outline-info me-2 border-0"><RiAlertFill size={20} color="red" /></Button>

            <Button variant="" className="me-2 border-0">
                {timeRemaining} min
                <span className="visually-hidden">unread messages</span>
            </Button>

            <Button variant="" className="me-2 border-0">
                {/* VIP <Badge bg="danger">!</Badge> */}
                <TbVip size = {30} color="gold"/>
                <span className="visually-hidden">unread messages</span>
            </Button>
            
        </>
    );
}


interface OrderProps {
    id: string |number
    order: OrderInterface
}


const Order = ({ id, order }: OrderProps) => {
    const x = order.orderItems?.filter(product => product.preparationStatus === 5).length;
    

    return (
        <Card>
            <Card.Header>
                <CustomToggle eventKey={`${id}`} alertTime={order.alertTime} total={order.orderItems?.length} prepared={x}>Pedido {id}</CustomToggle>
            </Card.Header>
            <Accordion.Collapse eventKey={`${id}`}>
                <Card.Body>
                    {/* <ListGroup key={"lg"} horizontal={"lg"} className="my-2">
                        <ListGroup.Item className="border-0">Cliente: {order.customer}</ListGroup.Item>
                        <ListGroup.Item className="border-0"></ListGroup.Item>
                    </ListGroup> */}
                    <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Comentarios</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            order.orderItems?.map((product, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{product.name}</td>
                                    <td>{product.quantity}</td>
                                    <td>{product?.comment}</td>
                                    <td>{product.preparationStatus === 5 ? <Button variant="primary" disabled>Preparado</Button> : <Button variant="primary">Preparado</Button>}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                    </Table>

                </Card.Body>
            </Accordion.Collapse>
        </Card>
    )
}

export default Order
