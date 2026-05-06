import { PopularFoodsSection } from "../../components/food"

function FoodSection() {
  return (
    <div className="pt-8 pb-5   bg-gradient-to-b from-gray-50 to-white">
      <h2 className="text-2xl font-bold px-4 ">Popular foods around you</h2>
      <PopularFoodsSection />
    </div>
  )
}

export default FoodSection
