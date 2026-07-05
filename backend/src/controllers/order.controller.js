import {
  cancelOrder,
  createOrder,
  getOrderDetails,
  prepareCreateOrderData,
  getUserProfileOrders,
  listOrders,
  paginateProfileOrders,
  prepareReorder,
  splitActiveAndPastOrders,
} from "../services/orderService/index.js";
import { parsePagination } from "../utils/pagination.js";
import { sendResponse } from "../utils/sendResponse.js";

const buildActor = (req) => ({
  role: req.user?.role || "user",
  userId: req.user?._id,
  kitchenId: req.query.kitchenId || req.body?.kitchenId || null,
});

// GET /api/orders
// Returns orders for the current actor with optional filtering, sorting, and pagination.
export const getOrders = async (req, res, next) => {
  try {
    const actor = buildActor(req);
    const { page, limit } = parsePagination(req.query);

    const result = await listOrders({
      actor,
      status: req.query.status,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      page,
      limit,
      sort: req.query.sort || "desc",
    });

    sendResponse(res, {
      message: "Orders fetched successfully",
      data: result.data,
      pagination: result.pagination,
      filters: {
        status: req.query.status || null,
        search: req.query.search || null,
        dateFrom: req.query.dateFrom || null,
        dateTo: req.query.dateTo || null,
        sort: req.query.sort || "desc",
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/active
// Returns the active orders for the current user using the copied profile-order logic.
export const getActiveOrders = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const ordersByStatus = await getUserProfileOrders(req.user._id);
    const result = paginateProfileOrders(
      splitActiveAndPastOrders(ordersByStatus).active,
      pagination
    );

    sendResponse(res, {
      message: "Active orders fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/history
// Returns past orders for the current user with optional status filtering.
export const getOrderHistory = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const ordersByStatus = await getUserProfileOrders(req.user._id);
    let history = splitActiveAndPastOrders(ordersByStatus).past;

    if (req.query.status) {
      history = history.filter((order) => order.status === req.query.status);
    }

    const result = paginateProfileOrders(history, pagination);

    sendResponse(res, {
      message: "Order history fetched successfully",
      data: result.data,
      pagination: result.pagination,
      filters: {
        status: req.query.status || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:orderId
// Returns a single order with joined order details.
export const getOrderById = async (req, res, next) => {
  try {
    const actor = buildActor(req);
    const data = await getOrderDetails({
      orderId: req.params.orderId,
      actor,
    });

    sendResponse(res, {
      message: "Order details fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
// Creates an order from explicit request items and pricing inputs.
export const createNewOrder = async (req, res, next) => {
  try {
    const createOrderData = await prepareCreateOrderData({
      userId: req.user._id,
      ...req.validatedBody,
    });

    const result = await createOrder(createOrderData);

    sendResponse(res, {
      statusCode: 201,
      message: "Order created successfully",
      data: result.order,
      event: result.event,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:orderId/cancel
// Cancels an order if the current business rules allow it.
export const cancelExistingOrder = async (req, res, next) => {
  try {
    await getOrderDetails({
      orderId: req.params.orderId,
      actor: buildActor(req),
    });

    const result = await cancelOrder(req.params.orderId);

    sendResponse(res, {
      message: "Order cancelled successfully",
      data: result.order,
      cancellation: result.cancellation,
      event: result.event,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:orderId/reorder
// Prepares reorder data from the current catalog without modifying the original order.
export const reorderExistingOrder = async (req, res, next) => {
  try {
    await getOrderDetails({
      orderId: req.params.orderId,
      actor: buildActor(req),
    });

    const reorderItems = await prepareReorder(req.params.orderId);

    sendResponse(res, {
      message: "Reorder data prepared successfully",
      data: reorderItems,
    });
  } catch (err) {
    next(err);
  }
};
