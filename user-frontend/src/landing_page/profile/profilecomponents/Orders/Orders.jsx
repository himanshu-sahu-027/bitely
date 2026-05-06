import ActiveOrders from "./ActiveOrders";
import PastOrders from "./PastOrders";

export default function Orders({
  activeOrders,
  pastOrders,
  onCancel,
  onPay,
  onReorder,
  onHelp,
}) {
  return (
    <div className="space-y-6">
      <ActiveOrders
        orders={activeOrders}
        onCancel={onCancel}
        onPay={onPay}
      />
      <PastOrders
        orders={pastOrders}
        onReorder={onReorder}
        onHelp={onHelp}
        onPay={onPay}
      />
    </div>
  );
}
