import { useState } from "react";
import { Smartphone, CreditCard, Landmark, Wallet } from "lucide-react";


const PAYMENT_OPTIONS = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "Pay using any UPI app",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, RuPay, and more",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Netbanking",
    subtitle: "Choose your bank and pay securely",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "Wallet",
    subtitle: "Paytm Wallet and other wallet options",
    icon: Wallet,
  },
];

const UPI_APPS = [
  {
    name: "Google Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  },
  {
    name: "PhonePe",
    logo: "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png",
  },
  {
    name: "Paytm",
    logo: "https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png",
  },
  {
    name: "BHIM UPI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/BHIM.svg",
  },
  {
    name: "Amazon Pay",
    logo: "https://download.logo.wine/logo/Amazon_Pay/Amazon_Pay-Logo.wine.png",
  },
  {
    name: "CRED Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/89/CRED_logo.svg",
  },
  {
    name: "WhatsApp Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  },
];

export default function DummyRazorpayGatewayModal({
  open,
  amount,
  selectedOption,
  onSelectOption,
  onClose,
  onPay,
  loading = false,
}) {
  const [selectedUpiApp, setSelectedUpiApp] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <div className="relative flex h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-100">
                Choose Payment Method
              </p>

              {/* Amount Row */}
              <div className="mt-4 flex items-center gap-3">
                <p className="text-lg text-indigo-100">Amount to pay</p>

                <p className="text-3xl font-bold">₹{amount}</p>
              </div>

              <p className="mt-3 text-sm text-indigo-100">
                Secure dummy Bitely payment gateway for frontend simulation.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium transition hover:bg-white/30"
            >
              Close
            </button>
          </div>
        </div>

        {/* SCROLLABLE PAYMENT SECTION */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedOption === option.id;
              const Icon = option.icon;

              return (
                <div
                  key={option.id}
                  className={[
                    "overflow-hidden rounded-2xl border transition-all",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  {/* PAYMENT OPTION */}
                  <button
                    type="button"
                    onClick={() => onSelectOption(option.id)}
                    className="flex w-full items-start justify-between px-4 py-4 text-left"
                  >
                    <div className="flex gap-4">
                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          isSelected
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        <Icon size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {option.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "mt-1 h-5 w-5 rounded-full border-2 transition",
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-slate-300",
                        ].join(" ")}
                      />
                    </div>
                  </button>

                  {/* UPI DROPDOWN */}
                  {option.id === "upi" && isSelected && (
                    <div className="border-t border-indigo-100 bg-white px-4 pb-4 pt-3">
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Choose UPI App
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {UPI_APPS.map((app) => {
                          const isActive = selectedUpiApp === app.name;

                          return (
                            <button
                              key={app.name}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.name)}
                              className={[
                                "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                                isActive
                                  ? "border-indigo-500 bg-indigo-100"
                                  : "border-slate-200 hover:border-indigo-300",
                              ].join(" ")}
                            >
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                                <img
                                  src={app.logo}
                                  alt={app.name}
                                  className="h-6 w-6 object-contain"
                                />
                              </div>

                              <span className="text-sm font-semibold text-slate-800">
                                {app.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FIXED FOOTER BUTTON */}
        <div className="border-t border-slate-200 bg-white p-5">
          <button
            type="button"
            onClick={onPay}
            disabled={loading}
            className={[
              "w-full rounded-2xl px-4 py-4 text-sm font-semibold text-white shadow-lg transition",
              loading
                ? "cursor-not-allowed bg-slate-300 text-slate-600"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99]",
            ].join(" ")}
          >
            {loading ? "Processing Payment..." : `Proceed to Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
