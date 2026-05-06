import { motion } from "framer-motion";
import mascot from "../../assets/logo/logo.png";
import "./MascotAnimation.css";

const vegetables = [
  {
    className: "veg veg1",
    icon: "\u{1F955}",
    animate: { y: [0, -14, 0], x: [0, 10, 0], rotate: [-6, 8, -6] },
    duration: 13.5,
    delay: 0
  },
  {
    className: "veg veg2",
    icon: "\u{1F336}",
    animate: { y: [0, 12, 0], x: [0, -12, 0], rotate: [8, -10, 8] },
    duration: 12.8,
    delay: 0.4
  },
  {
    className: "veg veg3",
    icon: "\u{1F96C}",
    animate: { y: [0, -10, 0], x: [0, -8, 0], rotate: [-10, 10, -10] },
    duration: 14,
    delay: 0.8
  },
  {
    className: "veg veg4",
    icon: "\u{1F966}",
    animate: { y: [0, 10, 0], x: [0, 10, 0], rotate: [6, -8, 6] },
    duration: 13.2,
    delay: 0.2
  }
];

function MascotAnimation() {
  return (
    <div className="mascot-container">
      {vegetables.map(({ className, icon, animate, duration, delay }) => (
        <motion.span
          key={className}
          className={className}
          animate={animate}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.span>
      ))}

      <motion.div
        className="mascot-stage"
        animate={{
          y: [0, -10, 0],
          rotate: [0, -0.8, 0.8, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.img
          src={mascot}
          alt="Bitely Mascot"
          className="mascot"
          animate={{
            x: [0, -3, 3, 0],
            rotate: [0, -0.8, 0.8, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="mascot-shadow" />
      </motion.div>
    </div>
  );
}

export default MascotAnimation;
