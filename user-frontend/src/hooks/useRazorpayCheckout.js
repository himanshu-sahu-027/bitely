import { loadRazorpayScript } from "../utils/loadRazorpayScript";

export function useRazorpayCheckout() {
  const openRazorpayCheckout = async ({
    key,
    amount,
    orderId,
    customer,
    onSuccess,
    onFailure,
  }) => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded || !window.Razorpay) {
      onFailure?.(new Error("Razorpay script failed to load."));
      return;
    }

    const options = {
      key,
      amount,
      currency: "INR",
      name: "Bitely",
      description: "Bitely test payment",
      order_id: orderId || undefined,
      prefill: {
        name: customer?.name || "",
        email: customer?.email || "",
        contact: customer?.contact || "",
      },
      theme: {
        color: "#4f46e5",
      },
      handler: (response) => {
        onSuccess?.(response);
      },
      modal: {
        ondismiss: () => {
          onFailure?.(new Error("Razorpay checkout was closed."));
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      onFailure?.(new Error(response.error?.description || "Payment failed."));
    });

    razorpay.open();
  };

  return { openRazorpayCheckout };
}
