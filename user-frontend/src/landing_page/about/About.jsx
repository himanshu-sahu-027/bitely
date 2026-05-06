import MotiveSection from "./MotiveSection";
import HowItWorks from "./HowItWorks";
import ContactSection from "./ContactSection";

function About() {
  return (
    <div>

      {/* Section 1 */}
      <MotiveSection />

      {/* Section 2 */}
      {<HowItWorks/>}

      {/* Section 3 */}
      {<ContactSection/>}

    </div>
  );
}

export default About;