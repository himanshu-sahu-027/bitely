import { motion } from "framer-motion";
import "./HowItWorks.css";
import { FaSearch, FaUtensils, FaShoppingCart, FaSmile } from "react-icons/fa";

const steps = [
  {
    icon: <FaSearch />,
    title: "Discover Kitchens",
    description:
      "Find nearby home chefs and local kitchens offering fresh homemade meals."
  },
  {
    icon: <FaUtensils />,
    title: "Explore Menu",
    description:
      "Browse delicious dishes prepared with authentic flavors and fresh ingredients."
  },
  {
    icon: <FaShoppingCart />,
    title: "Place Your Order",
    description:
      "Select your favorite meals and place an order quickly through Bitely."
  },
  {
    icon: <FaSmile />,
    title: "Enjoy Your Food",
    description:
      "Receive your order and enjoy delicious homemade food delivered to you."
  }
];

function HowItWorks() {
  return (
    <section className="how-section py-16 pb-24">

      <div className="how-header">
        <h2 className="font-mono font-medium text-4xl pt-8 pb-4">How Bitely Works</h2>
        <p>
          Connecting food lovers with local kitchens in just a few simple steps.
        </p>
      </div>

      <div className="steps-container py-5 hover:cursor-pointer"> 

        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="step-card"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="step-card-header py-1">
              <div className="step-icon">{step.icon}</div>
              <h3 className="font-medium">{step.title}</h3>
            </div>
            <p className="pb-2">{step.description}</p>
          </motion.div>
        ))}

      </div>

    </section>
  );
}

export default HowItWorks;
