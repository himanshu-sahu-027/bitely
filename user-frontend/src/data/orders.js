const orders = [
  {
    id: "order_1",
    user_id: "user_1",
    kitchen_id: "kit_1",

    // snapshot
    kitchen_name: "Royal Rolls & Co.",
    kitchen_image: "/kitchens/royal-rolls.jpg",

    status: "delivered",

    placed_at: "2026-03-05T19:10:00",
    delivered_at: "2026-03-05T20:05:00",
    cancelled_at: null,

    delivery_by_time: "2026-03-05T20:10:00",
    last_cancellation_time: "2026-03-05T19:25:00",

    payment_method: "UPI",
    payment_status: "paid",

    total_amount: 209,

    instructions: "Less spicy",

    created_at: "2026-03-05T19:10:00",
  },

  {
    id: "order_2",
    user_id: "user_1",
    kitchen_id: "kit_2",

    kitchen_name: "Spice & Slice",
    kitchen_image: "/kitchens/spice-slice.jpg",

    status: "out_for_delivery",

    placed_at: "2026-03-23T18:00:00",
    delivered_at: null,
    cancelled_at: null,

    delivery_by_time: "2026-03-23T18:40:00",
    last_cancellation_time: "2026-03-23T18:10:00",

    payment_method: "COD",
    payment_status: "pending",

    total_amount: 448,

    instructions: "",

    created_at: "2026-03-23T18:00:00",
  },

  {
    id: "order_3",
    user_id: "user_1",
    kitchen_id: "kit_3",

    kitchen_name: "Momos Hub",
    kitchen_image: "/kitchens/momos-hub.jpg",

    status: "preparing",

    placed_at: "2026-03-23T19:05:00",
    delivered_at: null,
    cancelled_at: null,

    delivery_by_time: "2026-03-23T19:35:00",
    last_cancellation_time: "2026-03-23T19:15:00",

    payment_method: "UPI",
    payment_status: "paid",

    total_amount: 318,

    instructions: "Send extra mayo dip",

    created_at: "2026-03-23T19:05:00",
  },

  {
    id: "order_4",
    user_id: "user_1",
    kitchen_id: "kit_4",

    kitchen_name: "Mutton Hub",
    kitchen_image: "/kitchens/mutton-hub.jpg",

    status: "delivered",

    placed_at: "2026-03-21T20:15:00",
    delivered_at: "2026-03-21T21:02:00",
    cancelled_at: null,

    delivery_by_time: "2026-03-21T21:00:00",
    last_cancellation_time: "2026-03-21T20:25:00",

    payment_method: "COD",
    payment_status: "pending",

    total_amount: 562,

    instructions: "Call on arrival",

    created_at: "2026-03-21T20:15:00",
  },

  {
    id: "order_5",
    user_id: "user_1",
    kitchen_id: "kit_1",

    kitchen_name: "Royal Rolls & Co.",
    kitchen_image: "/kitchens/royal-rolls.jpg",

    status: "placed",

    placed_at: "2026-03-23T20:10:00",
    delivered_at: null,
    cancelled_at: null,

    delivery_by_time: "2026-03-23T20:45:00",
    last_cancellation_time: "2026-03-23T20:20:00",

    payment_method: "Card",
    payment_status: "paid",

    total_amount: 276,

    instructions: "No onion",

    created_at: "2026-03-23T20:10:00",
  },
];

export default orders;
