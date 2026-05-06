export default function SubscriptionPage({ subscriptions }) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Subscriptions</h3>
          <p className="text-sm text-slate-500 mt-1">
            Kitchens you are subscribed to (not Bitely subscription).
          </p>
        </div>
      </div>

      <div className="space-y-4 ">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl border border-slate-100 bg-slate-100 shadow-sm p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 truncate">
                  {sub.kitchenName}
                </div>
                <div className="mt-2 text-sm font-semibold text-primary">
                  {sub.planDetails}
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Manage plans for ${sub.kitchenName} (mock).`)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Manage / View Plans
              </button>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-800">Benefits</div>
              <ul className="mt-2 space-y-2">
                {sub.benefits.map((b, idx) => (
                  <li key={`${sub.id}-${idx}`} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

