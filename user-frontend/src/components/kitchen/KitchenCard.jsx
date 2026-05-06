import React from "react";
import { Link } from "react-router-dom";
import { Bike, Star } from "lucide-react";
import { FaMapMarkerAlt } from "react-icons/fa";
import kitchenLogo from "../../assets/images/dummy_kitchen_img.png";
import "./KitchenCard.css";

function KitchenCard({ id, name, image, showMenuImg, rating, address, deliveryTime, lastOrderTime }) {
  return (
    <Link to={`/kitchen/${id}`}>
      <div className="relative h-full bg-white hover:bg-gradient-to-l from-teal-50 via-sky-100 to-indigo-100 rounded-xl shadow-md p-4 transition">
        {/* Kitchen Logo */}
        <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
          <img
            src={showMenuImg || image || kitchenLogo}
            onError={(event) => {
              event.currentTarget.src = kitchenLogo;
            }}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        {/* kitchen Rating Badge */}

        <div className="absolute top-5 left-5 bg-white px-2 py-1 rounded flex items-center text-xs shadow ">
          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />

          {rating}
        </div>
        {/* kitchen name */}
        <h3 className="font-semibold mt-3">{name}</h3>
        <p className="kitchen-card-address mt-2 flex items-center gap-2 text-sm text-slate-600">
          <FaMapMarkerAlt className="h-4 w-4 text-rose-500" />
          <span>{address}</span>
        </p>

        {/* kitchen delivery time */}
        <p className="kitchen-card-delivery mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sky-700">
          <span>Delivery in {deliveryTime}</span>
          <Bike className="kitchen-card-bike h-4 w-4 text-blue-500" />
        </p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <span>Last order by {lastOrderTime}</span>
          <span className="kitchen-card-clock">
            <span className="kitchen-card-clock-face" />
            <span className="kitchen-card-clock-hand kitchen-card-clock-hand-hour" />
            <span className="kitchen-card-clock-hand kitchen-card-clock-hand-minute kitchen-card-clock-hand-rotating" />
          </span>
        </p>
      </div>
    </Link>
  );
}

export default KitchenCard;
