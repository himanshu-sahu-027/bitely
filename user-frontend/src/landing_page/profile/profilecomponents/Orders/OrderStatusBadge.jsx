function OrderStatusBadge({ status }) {
  const normalizedStatus = (status ?? "").trim().toLowerCase().replaceAll(" ", "_");
  const color =
    normalizedStatus === "delivered"
      ? "text-emerald-600"
      : normalizedStatus === "out_for_delivery"
      ? "text-blue-600"
      : "text-orange-500";

  const label = (status ?? "")
    .trim()
    .replaceAll("_", " ");

  return (
    <span className={`font-semibold ${color}`}>
      {label}
    </span>
  );
}

export default OrderStatusBadge;
