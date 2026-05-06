const payments = [
  {
    id: "pay_1",
    order_id: "order_1",
    method: "UPI",
    status: "success",
    transaction_id: "txn_12345",
    amount: 209,
    paid_at: "2026-03-05T19:12:00",
  },

  {
    id: "pay_2",
    order_id: "order_2",
    method: "COD",
    status: "pending",
    transaction_id: null,
    amount: 448,
    paid_at: null,
  },
];

export default payments;