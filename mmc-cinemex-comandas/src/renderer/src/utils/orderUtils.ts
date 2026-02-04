import { OrderInterface } from '../components/screens/CurrentOrders.js';

export function calculateAveragePrepTime(order: OrderInterface): number {
  if (!order.orderItems || order.orderItems.length === 0) {
    return 0;
  }

  const totalPrepTime = order.orderItems.reduce((sum, item) => {
    return sum + (item.product?.prepTime || 0);
  }, 0);

  return Math.round(totalPrepTime / order.orderItems.length);
}

export function isOrderDelayed(order: OrderInterface, averagePrepTimeMinutes: number): boolean {
  if (!order.dateTime || averagePrepTimeMinutes === 0) {
    return false;
  }

  const createdTime = new Date(order.dateTime).getTime();
  const currentTime = new Date().getTime();
  const elapsedMinutes = (currentTime - createdTime) / (1000 * 60);

  return elapsedMinutes > averagePrepTimeMinutes;
}


export function enrichOrderWithTimeData(order: OrderInterface): OrderInterface {
  const averagePrepTime = calculateAveragePrepTime(order);
  const isDelayed = isOrderDelayed(order, averagePrepTime);

  return {
    ...order,
    averagePrepTime,
    isDelayed
  };
}