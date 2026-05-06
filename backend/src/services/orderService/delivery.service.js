// Delivery ETA and timeline helpers used by order read models.

export const calculateEtaMinutes = (deliveryTime) => {
  const eta = Number.parseInt(deliveryTime, 10);
  return Number.isNaN(eta) ? null : eta;
};

export const estimateDeliveryTimeline = ({ placedAt, etaMins }) => {
  if (!placedAt || etaMins === null) {
    return {
      estimated_delivery_at: null,
      eta_mins: etaMins,
    };
  }

  const placedDate = new Date(placedAt);

  return {
    estimated_delivery_at: new Date(
      placedDate.getTime() + etaMins * 60 * 1000
    ),
    eta_mins: etaMins,
  };
};

export const buildDeliveryTrackingHooks = (order) => ({
  order_id: order?._id ?? order?.id ?? null,
  status: order?.status ?? null,
  can_track: order?.status === "out_for_delivery",
});
