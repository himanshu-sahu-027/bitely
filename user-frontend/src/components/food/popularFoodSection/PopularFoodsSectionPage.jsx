{/* popular foods section wrapper */}

import PopularFoodsSlider from "./PopularFoodsSlider";


function PopularFoodsSection() {
  return (
    <section className="py-10">
      {/* Horizontal list of the currently highlighted foods. */}
      <PopularFoodsSlider />
    </section>
  );
}

export default PopularFoodsSection;
