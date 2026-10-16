import { useState } from "react";
import "./ContactForm.css";

// Replace with your own Formspree endpoint (formspree.io -> New Form)
const FORM_ENDPOINT = "https://formspree.io/f/xppzlyrr";

const REASONS = ["Job opportunity", "Freelance project", "Just saying hi"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!emailPattern.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.message.trim().length < 10) errors.message = "Write a message of at least 10 characters.";
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", reason: REASONS[0], message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Spam trap: real visitors never see or fill this field
    if (values.website) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          reason: values.reason,
          message: values.message,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setValues({ name: "", email: "", reason: REASONS[0], message: "", website: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="ct-section" id="contact">
      <div className="ct-wrap">
        <div className="ct-intro">
          <h2>Contact me</h2>
          <p>Looking for a junior developer or technical role? Send a message and I'll reply within two business days.</p>
          <ul className="ct-links">
            <li><a href="mailto:kayla.m.mangum@gmail.com">Email</a></li>
            <li><a href="https://www.linkedin.com/in/kayleen-mangum-a95656195/?isSelfProfile=true" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://github.com/your-username" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href="/resume.pdf" download>Download resume</a></li>
          </ul>
        </div>

        {status === "success" ? (
          <div className="ct-success" role="status">
            <h3>Message sent</h3>
            <p>Thanks for reaching out. I'll reply within two business days.</p>
            <button className="sp-btn" onClick={() => setStatus("idle")}>Send another message</button>
          </div>
        ) : (
          <form className="ct-form" onSubmit={handleSubmit} noValidate>
            <div className="ct-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" value={values.name} onChange={handleChange} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
              {errors.name && <p className="ct-error" id="name-error">{errors.name}</p>}
            </div>

            <div className="ct-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
              {errors.email && <p className="ct-error" id="email-error">{errors.email}</p>}
            </div>

            <div className="ct-field">
              <label htmlFor="reason">Reason for contacting</label>
              <select id="reason" name="reason" value={values.reason} onChange={handleChange}>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="ct-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="6" value={values.message} onChange={handleChange} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
              {errors.message && <p className="ct-error" id="message-error">{errors.message}</p>}
            </div>

            {/* Hidden spam trap */}
            <div className="ct-trap" aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" value={values.website} onChange={handleChange} />
            </div>

            {status === "error" && (
              <p className="ct-error" role="alert">Your message didn't send. Check your connection and try again, or email me directly.</p>
            )}

            <button className="sp-btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
