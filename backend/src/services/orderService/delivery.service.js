// Delivery ETA and timeline helpers used by order read models.

export const calculateEtaMinutes = (deliveryTime) => {
  const eta = Number.parseInt(deliveryTime, 10);
  return Number.isNaN(eta) ? null : eta;
};

export const estimateDeliveryTimeline = ({ placedAt, etaMins }) => {
  if (!placedAt || etaMins === null) {
    return {
      estimatedDeliveryAt: null,
      etaMins: etaMins,
    };
  }

  const placedDate = new Date(placedAt);

  return {
    estimatedDeliveryAt: new Date(
      placedDate.getTime() + etaMins * 60 * 1000
    ),
    etaMins: etaMins,
  };
};

export const buildDeliveryTrackingHooks = (order) => ({
  orderId: order?._id ?? order?.id ?? null,
  status: order?.status ?? null,
  canTrack: order?.status === "out_for_delivery",
});
