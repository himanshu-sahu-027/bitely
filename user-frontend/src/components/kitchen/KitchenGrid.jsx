import KitchenCard from "./KitchenCard";


function KitchenGrid({ kitchens = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {kitchens.map((kitchen) => (
        <KitchenCard key={kitchen.id} {...kitchen} />
      ))}
    </div>
  );
}

export default KitchenGrid;
