function OrderItemsList({ items }) {
  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={`${item.name}-${idx}`} className="flex gap-2 text-sm text-slate-700">
          <span className="truncate">{item.name}</span>
          <span className="shrink-0 text-slate-500">x{item.qty}</span>
        </div>
      ))}
    </div>
  );
}

export default OrderItemsList;