import mascot from "../../../assets/logo/logo.png";

function EmptyCart() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <img
          src={mascot}
          alt="Bitely Mascot"
          className="w-28 h-28 object-contain opacity-20"
        />

        <h2 className="mt-5 text-2xl font-semibold text-blue-900">
          Your cart is empty
        </h2>

        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          Add your favourite dishes from nearby kitchens
        </p>
      </div>
    </div>
  );
}

export default EmptyCart;