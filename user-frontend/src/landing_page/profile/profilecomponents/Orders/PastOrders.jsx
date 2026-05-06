import OrderCard from "./OrderCard";

export default function PastOrders({ orders, onReorder, onHelp, onPay }) {
  return (
    <section className="rounded-2xl bg-slate-100 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="w-full">
          <h3 className="text-lg font-bold text-slate-900">Past Orders</h3>
          <p className="text-sm text-slate-500 mt-1">
            Review completed deliveries and pay pending orders.
          </p>
        </div>
      </div>

      <div className="mt-4 w-full space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onReorder={onReorder}
            onHelp={onHelp}
            onPay={onPay}
          />
        ))}
      </div>
    </section>
  );
}
