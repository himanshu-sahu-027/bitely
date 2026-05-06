import OrderCard from "./OrderCard";

export default function ActiveOrders({ orders, onCancel, onPay }) {
  return (
    <section className="rounded-2xl bg-slate-100 p-5">

      <h3 className="text-lg font-bold text-slate-900">Active Orders</h3>

      <div className="mt-4 space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={onCancel}
            onPay={onPay}
          />
        ))}
      </div>

    </section>
  );
}
