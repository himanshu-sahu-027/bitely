function KitchenBanner({ kitchen, onOpenReviews }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-8 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{kitchen.name}</h1>

          <p className="text-sm">
            {kitchen.rating} ★ • {kitchen.deliveryTime} mins delivery
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReviews}
          className="self-start border border-2 border-white/80  px-4 py-2 text-sm font-semibold text-white  transition hover:bg-white/20"
        >
          Kitchen Reviews
        </button>
      </div>
    </div>
  );
}

export default KitchenBanner;
