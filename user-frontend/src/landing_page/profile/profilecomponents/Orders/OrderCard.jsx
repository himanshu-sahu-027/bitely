import { useEffect, useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import OrderViewDetailsDrawer from "./ViewDetails/OrderViewDetailsDrawer";
import ReviewModal from "../../../../components/review/ReviewModal";
import { useAuth } from "../../../../context/AuthContext";

import {
  addKitchenReview,
  addFoodReview,
  deleteFoodReview,
  deleteKitchenReview,
  getFoodReviews,
  getKitchenReviews,
  updateFoodReview,
  updateKitchenReview,
} from "../../../../services/reviewService";

function OrderCard({ order, onReorder, onCancel, onPay }) {
  const { user } = useAuth();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // { type, kitchenId/menuId, orderId }
  const [reviewInitial, setReviewInitial] = useState({
    rating: 5,
    review: "",
  });

  const [myKitchenReview, setMyKitchenReview] = useState(null);
  const [myFoodReviewsByMenuId, setMyFoodReviewsByMenuId] = useState({}); // menuId -> review
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [foodReviewsOpen, setFoodReviewsOpen] = useState(false);
  const [foodReviewsMenuId, setFoodReviewsMenuId] = useState(null);
  const [foodReviewsList, setFoodReviewsList] = useState([]);
  const [foodReviewsLoading, setFoodReviewsLoading] = useState(false);

  const displayOrderId = order.orderId ?? order.id ?? "N/A";

  const isActive = ["placed", "preparing", "out_for_delivery"].includes(
    order.status,
  );

  const kitchenId = order.kitchenId ?? order.kitchen_id;
  const orderId = order.orderId ?? order.id ?? order._id;

  const menuIdsInOrder = useMemo(() => {
    const items = order.items ?? [];
    return items
      .map((item) => item.menuId ?? item.menu_id)
      .filter(Boolean);
  }, [order.items]);

  const formatDateTime = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const refreshKitchenAndFoodReviews = async () => {
    if (!user?._id) return;

    setReviewsLoading(true);
    try {
      const kitchenResp = await getKitchenReviews(kitchenId);
      const kitchenReviews = kitchenResp?.data ?? kitchenResp ?? [];
      const mineKitchen = Array.isArray(kitchenReviews)
        ? kitchenReviews.find(
            (r) => String(r.user_id?._id ?? r.user_id) === String(user._id),
          )
        : null;

      setMyKitchenReview(mineKitchen);

      const nextFood = {};
      // fetch per menuId (keeps API surface simple, no new endpoints)
      await Promise.all(
        menuIdsInOrder.map(async (menuId) => {
          if (!menuId) return;

          const foodResp = await getFoodReviews(menuId);
          const foodReviews = foodResp?.data ?? foodResp ?? [];
          const mineFood = Array.isArray(foodReviews)
            ? foodReviews.find(
                (r) =>
                  String(r.user_id?._id ?? r.user_id) === String(user._id),
              )
            : null;

          if (mineFood) nextFood[menuId] = mineFood;
        }),
      );

      setMyFoodReviewsByMenuId(nextFood);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!isActive) {
      refreshKitchenAndFoodReviews();
    } else {
      setMyKitchenReview(null);
      setMyFoodReviewsByMenuId({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, kitchenId, orderId, user?._id]);

  useEffect(() => {
    if (!reviewOpen && !reviewsLoading) {
      // after submit/update/delete close, ensure latest reflected
      refreshKitchenAndFoodReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewOpen]);

  const handleReviewOpenForKitchen = () => {
    if (myKitchenReview) {
      setReviewInitial({
        rating: myKitchenReview.rating ?? 5,
        review: myKitchenReview.review ?? "",
      });

      setReviewTarget({
        type: "kitchen",
        kitchenId,
        orderId,
        reviewId: myKitchenReview._id,
      });
    } else {
      setReviewInitial({ rating: 5, review: "" });
      setReviewTarget({
        type: "kitchen",
        kitchenId,
        orderId,
      });
    }

    setReviewOpen(true);
  };

  const handleReviewOpenForFood = (menuId) => {
    const existing = myFoodReviewsByMenuId[menuId];

    if (existing) {
      setReviewInitial({
        rating: existing.rating ?? 5,
        review: existing.review ?? "",
      });

      setReviewTarget({
        type: "food",
        menuId,
        orderId,
        reviewId: existing._id,
      });
    } else {
      setReviewInitial({ rating: 5, review: "" });
      setReviewTarget({
        type: "food",
        menuId,
        orderId,
      });
    }

    setReviewOpen(true);
  };

  const handleReviewSubmit = async ({ rating, review }) => {
    try {
      if (!reviewTarget) return;

      if (reviewTarget.type === "kitchen") {
        if (reviewTarget.reviewId) {
          await updateKitchenReview(reviewTarget.reviewId, {
            rating,
            review,
          });
        } else {
          await addKitchenReview(reviewTarget.kitchenId, {
            orderId: reviewTarget.orderId,
            rating,
            review,
          });
        }
      }

      if (reviewTarget.type === "food") {
        if (reviewTarget.reviewId) {
          await updateFoodReview(reviewTarget.reviewId, {
            rating,
            review,
          });
        } else {
          await addFoodReview(reviewTarget.menuId, {
            orderId: reviewTarget.orderId,
            rating,
            review,
          });
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleReviewDelete = async () => {
    try {
      if (!reviewTarget?.reviewId) return;

      if (reviewTarget.type === "kitchen") {
        await deleteKitchenReview(reviewTarget.reviewId);
      }

      if (reviewTarget.type === "food") {
        await deleteFoodReview(reviewTarget.reviewId);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const statusColor = {
    placed: "text-orange-500",
    preparing: "text-yellow-500",
    out_for_delivery: "text-blue-500",
    delivered: "text-emerald-500",
    cancelled: "text-red-500",
  };

  return (
    <>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
        {/* Top Row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="text-xs text-slate-600">
            Order{" "}
            <span className="font-semibold text-slate-700">
              #{displayOrderId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:justify-end md:text-right">
            {isActive ? (
              <span
                className={`font-semibold capitalize ${
                  statusColor[order.status] || "text-primary"
                }`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            ) : (
              <>
                <span>Delivered on {formatDateTime(order.deliveredAt)}</span>

                <button
                  type="button"
                  onClick={() => {
                    handleReviewOpenForKitchen();
                  }}
                  className="rounded bg-orange-500 px-3 py-1 text-white"
                >
                  {myKitchenReview ? "Edit Review" : "Rate Kitchen"}
                </button>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={10} strokeWidth={3} className="text-white" />
                </span>
              </>
            )}

          </div>
        </div>

        {/* Main Section */}
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
          {/* Left: Kitchen Info */}
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <img
              src={order.image}
              alt={order.kitchenName}
              className="h-16 w-16 flex-shrink-0 rounded-2xl border border-slate-100 object-cover"
            />

            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900">
                {order.kitchenName}
              </div>

              <div className="truncate text-sm text-slate-600">
                {order.location}
              </div>
              <div className="text-xs text-slate-500">
                {formatDateTime(order.placedAt)}
              </div>
            </div>
          </div>

          {/* Middle: Items (Desktop) */}
          <div className="hidden md:block md:w-[34%]">
            <div className="text-sm font-semibold text-slate-800">Items</div>

            <div className="mt-2 space-y-1">
              {order.items?.map((item, idx) => {
                const menuId = item.menuId ?? item.menu_id;

                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex gap-2 text-sm text-slate-700"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 text-slate-500">
                      x{item.quantity}
                    </span>

                    {!isActive ? (
                      <div className="ml-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!menuId) return;
                            handleReviewOpenForFood(menuId);
                          }}
                          className="text-xs font-semibold text-orange-600"
                        >
                          {menuId && myFoodReviewsByMenuId[menuId]
                            ? "Edit Food Review"
                            : "Rate Food"}
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!menuId) return;

                            try {
                              setFoodReviewsLoading(true);
                              const resp = await getFoodReviews(menuId);
                              const list = resp?.data ?? resp ?? [];
                              setFoodReviewsList(list);
                              setFoodReviewsMenuId(menuId);
                              setFoodReviewsOpen(true);
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setFoodReviewsLoading(false);
                            }
                          }}
                          className="text-xs text-slate-600 underline underline-offset-2"
                        >
                          View Reviews
                        </button>
                      </div>
                    ) : (
                      <div className="ml-2 flex items-center gap-2">
                        {/* No food review actions for non-delivered orders */}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Right: Payment + Actions */}
          <div className="w-full md:w-[26%] md:text-right">
            {/* Payment */}
            {order.paymentStatus !== "paid" ? (
              <button
                type="button"
                onClick={() => onPay?.(order)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary via-secondary to-indigo-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:opacity-90 md:w-auto"
              >
                Pay ₹{order.totalAmount}
              </button>
            ) : (
              <div className="inline-flex justify-end">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
                  Paid ₹{order.totalAmount}
                </div>
              </div>
            )}

            {/* View Details */}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="mt-3 block text-sm font-semibold uppercase tracking-wide text-primary transition hover:opacity-80 md:ml-auto"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Items (Mobile) */}
        <div className="mt-4 md:hidden">
          <div className="text-sm font-semibold text-slate-800">Items</div>

          <div className="mt-2 space-y-3">
            {order.items?.map((item, idx) => {
              const menuId = item.menuId ?? item.menu_id;
              const myFoodReview = menuId ? myFoodReviewsByMenuId[menuId] : null;

              return (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Qty x{item.quantity}
                      </div>
                    </div>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!menuId) return;
                          handleReviewOpenForFood(menuId);
                        }}
                        className={`rounded px-3 py-1 text-xs font-semibold ${
                          myFoodReview
                            ? "bg-slate-100 text-slate-800"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {myFoodReview ? "Edit Food Review" : "Rate Food"}
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>

                  {!isActive ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!menuId}
                        onClick={async () => {
                          if (!menuId) return;
                          try {
                            setFoodReviewsLoading(true);
                            const resp = await getFoodReviews(menuId);
                            const list = resp?.data ?? resp ?? [];
                            setFoodReviewsList(list);
                            setFoodReviewsMenuId(menuId);
                            setFoodReviewsOpen(true);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setFoodReviewsLoading(false);
                          }
                        }}
                        className="text-xs font-semibold text-slate-600 underline underline-offset-2"
                      >
                        {foodReviewsLoading && foodReviewsMenuId === menuId
                          ? "Loading..."
                          : "View Reviews"}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isActive && order.paymentStatus !== "paid" ? (
            <button
              type="button"
              onClick={() => onCancel?.(order)}
              className="rounded-xl border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel Order
            </button>
          ) : !isActive ? (
            <button
              type="button"
              onClick={() => onReorder?.(order)}
              className="rounded-xl border border-indigo-700 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-slate-100"
            >
              Reorder
            </button>
          ) : null}
        </div>
      </article>

      {/* Drawer */}
      <OrderViewDetailsDrawer
        open={detailsOpen}
        order={order}
        onClose={() => setDetailsOpen(false)}
      />

      {/* Read-only Food Reviews modal */}
      {foodReviewsOpen ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="w-[90vw] max-w-[36rem] rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Food Reviews
                </h2>
                <div className="text-xs text-slate-500">
                  {foodReviewsMenuId ? `Menu ID: ${foodReviewsMenuId}` : " "}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFoodReviewsOpen(false)}
                className="rounded border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              {foodReviewsLoading ? (
                <div className="text-sm text-slate-600">Loading...</div>
              ) : foodReviewsList?.length ? (
                <div className="space-y-3">
                  {foodReviewsList.map((r) => (
                    <div
                      key={r._id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-slate-900">
                          {r.user_id?.name ?? r.user_id?.full_name ?? "User"}
                        </div>

                        <span className="rounded bg-green-100 px-2 py-1 text-xs">
                          Verified Purchase
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-800">
                        ⭐ {r.rating}
                      </div>

                      <div className="mt-1 text-sm text-slate-700">
                        {r.review}
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No reviews yet.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        title={
          reviewTarget?.type === "food"
            ? myFoodReviewsByMenuId[reviewTarget?.menuId]?.review
              ? "Edit Food Review"
              : "Rate Food"
            : myKitchenReview?.review
              ? "Edit Kitchen Review"
              : "Rate Kitchen"
        }
        initialRating={reviewInitial.rating}
        initialReview={reviewInitial.review}
        submitLabel={
          reviewTarget?.reviewId ? "Update" : "Submit"
        }
        onDelete={
          reviewTarget?.reviewId
            ? handleReviewDelete
            : undefined
        }
        deleteLabel="Delete Review"
      />
    </>
  );
}

export default OrderCard;
