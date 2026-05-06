function KitchenBanner({ kitchen }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-8">
      <h1 className="text-2xl font-bold">
        {kitchen.name}
      </h1>

      <p className="text-sm">
        {kitchen.rating} ⭐ • {kitchen.deliveryTime}s delivery
      </p>
    </div>
  );
}

export default KitchenBanner;