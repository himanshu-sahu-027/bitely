import { FaComments, FaPaperPlane } from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";
import "./ContactSection.css";

function ContactSection() {
  return (
    <section className="contact-section">
      {/* HEADER */}
      <div className="contact-header">
        <h1 className="font-mono font-medium text-4xl pb-4">
          Looking for Us?
          <span className="contact-eyes" aria-hidden="true">
            {"\u{1F440}"}
          </span>
        </h1>

        <p>
          You've come to the right kitchen. Let's get your questions served hot .{" "}
          <GiCookingPot className="contact-pot-inline" aria-hidden="true" />
        </p>
      </div>

      {/* CONTENT */}
      <div className="contact-container">
        {/* LEFT CARD */}
        <div className="help-card">
          <div className="card-header">
            <div className="card-icon">
              <FaComments />
            </div>

            <h2 className="font-medium text-xl">Need a Hand ? We've Got You</h2>
          </div>

          <p>
            Have questions about your order, need support, or want to partner
            with Bitely? Our team is ready to assist you.
          </p>

          <div className="online-box">
            <span className="status-dot mt-2 animate-pulse"></span>

            <div>
              <strong>Support Chef is Ready</strong>
              <p>We usually respond within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon pink">
              <FaPaperPlane />
            </div>

            <h2 className="font-medium text-xl">Send us a Message</h2>
          </div>

          <p>
            Fill out the form below and we'll get back to you as soon as
            possible.
          </p>

          <form className="contact-form">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />

            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />

            <label>Mobile Number</label>
            <input type="text" placeholder="Enter your mobile number" />

            <label>You are a</label>
            <select>
              <option>Customer</option>
              <option>Kitchen Owner</option>
              <option>New Partner</option>
            </select>

            <label>Comment</label>
            <textarea placeholder="Enter your comment"></textarea>

            <button className="submit-btn">
              Submit Query <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
