import "./Footer.css";
import Logo from "../../assets/logo/logo.png";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaReddit,
  FaFacebook,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <footer className="footer-gradient text-gray-200  pt-1 pb-12 px-6">
      <div className="max-w-6xl mx-auto   p-6">
        {/* Row 1 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Logo Section */}
          <div className=" p-6">
            <img src={Logo} alt="Logo" className="w-36" />
            <h2 className="text-3xl font-bold brand-gradient pl-8 pb-2">
              Bitely
            </h2>
            <p className="text-base text-gray-200 leading-relaxed">
              Discover flavors that bring people together. Bitely connects you
              with the best kitchens around you so every meal feels special.
            </p>
          </div>

          {/* Contact */}
          <div className=" p-6">
            <h3 className="footer-heading heading-blue text-2xl font-extrabold mb-6">
              contact us
            </h3>

            <a
              href="mailto:info@bitely.food"
              className="flex items-center gap-3 text-sm group"
            >
              <div className="bg-indigo-600/20 p-2 rounded-md group-hover:bg-indigo-500/40 transition">
                <MdEmail size={18} />
              </div>

              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="group-hover:text-blue-400 transition">
                  bitely2026@gmail.com
                </p>
              </div>
            </a>
          </div>

          {/* Support */}
          <div className=" p-6">
            <h3 className="footer-heading heading-pink text-2xl font-extrabold mb-6">
              support
            </h3>

            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <a href="/contact" className="footer-link">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="/terms/customer" className="footer-link">
                  Customer Terms & Conditions
                </a>
              </li>

              <li>
                <a href="/terms/restaurant" className="footer-link">
                  Restaurant Terms & Conditions
                </a>
              </li>

              <li>
                <a href="/privacy" className="footer-link">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="/refund-policy" className="footer-link">
                  Refund and Cancellation Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Row 2 */}
        <div className="footer-box rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>

          <div className="flex gap-4">
            <a href="#" className="social-icon hover:text-pink-400">
              <FaInstagram />
            </a>

            <a href="#" className="social-icon hover:text-blue-400">
              <FaLinkedin />
            </a>

            <a href="#" className="social-icon hover:text-sky-400">
              <FaTwitter />
            </a>

            <a href="#" className="social-icon hover:text-orange-400">
              <FaReddit />
            </a>

            <a href="#" className="social-icon hover:text-blue-500">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
