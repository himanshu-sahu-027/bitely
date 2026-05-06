import MascotAnimation from "./MascotAnimation";
import "./MotiveSection.css";

function MotiveSection() {
  return (
    <div className="about-motive-container ">
      {/* LEFT SIDE */}
      <div className="about-motive-text ">

        <h1 className="font-mono font-medium text-4xl pb-4">Why Bitely Exists?</h1>
        <h2 className="pb-5 text-2xl font-semibold">
  Discover homemade meals and local kitchens near you
</h2>
        <p>
          Bitely connects food lovers with nearby home kitchens and small local
          food outlets. Many talented cooks prepare delicious homemade meals
          every day but often lack a digital platform to reach customers nearby.
        </p>

        <p>
          Our goal is to make discovering food simple — whether it's a homemade
          meal from a home kitchen or a dish from a small local kitchen.
        </p>

        <p>
          The name <b>Bitely</b> comes from the idea of <b>"Bite Easily"</b>,
          meaning good food should be easy to discover, order, and enjoy.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="about-mascot">
        <MascotAnimation />
      </div>
    </div>
  );
}

export default MotiveSection;
