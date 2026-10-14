import { useState } from "react";
import "./stylesheet.css";
import Contact from "./ContactForm";

const LINKS = [{label: "Projects Overview", href: "#overview"},{label: "Project 1", href: "#"}, {label: "Project 2", href: "#"}, {label: "Project 3", href: "#"}, { label: "Contact", href: "#contact" }];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sp-nav" aria-label="Main">
      <a className="sp-home" href="#home">Home</a>
      <div className="sp-links">
        {LINKS.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
      </div>
      <button className="sp-burger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
        ☰
      </button>
      {open && (
        <div className="sp-drawer">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <header className="sp-hero" id="home">
      <div>
        <h1>KAYLEEN MANGUM</h1>
        <p>Backend Software Development for SQL, TypeScript, and Python</p>
        <div className="sp-btn-group">
          <a className="sp-btn" href="#overview">View My Work</a>
          <a className="sp-btn" href="#contact">Contact Me</a>
        </div>
      </div>
    </header>
  );
}

function Feature({ title, text, body, reverse, tone }) {
  return (
    <section className={reverse ? "sp-band" : ""}>
      <div className={`sp-row ${reverse ? "sp-alt" : ""}`}>
        <div>
          <h2>{title}</h2>
          <h5>{text}</h5>
          <p>{body}</p>
        </div>
        <div className={`sp-img ${tone}`} role="img" aria-label="Decorative placeholder" />
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="sp-contact">
      <h1>Looking for a developer for a technical role? Let's talk!</h1>
      <a className="sp-btn" href="#contact">Contact Me</a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="sp-foot">
      <p>© {new Date().getFullYear()} Kayleen Mangum</p>
      <p className="sp-foot-links">
        <a href="https://github.com/your-username" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/your-profile" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:your.email@example.com">Email</a>
        <a href="#home">Back to top</a>
      </p>
      <p>Built with React</p>
    </footer>
  );
}

export default function StartPage() {
  return (
    <div className="sp">
      <Navbar />
      <Hero />
      <div id="about">
        <Feature title="About Me" text="Backend-focused developer finishing my B.S. in Software Engineering." body="In my current role at Fishbowl, I write and debug SQL queries, repair JXML report scripts, and troubleshoot API integrations with QuickBooks, Shopify, Amazon, and more. Before that, I worked on training data for Tesla’s Optimus robot, and I spent a year diagnosing hardware issues at ThermoWorks. Years of explaining technical problems to non-technical people taught me to write clear code and clearer documentation. I’m looking for a junior backend or software role where I can keep building on SQL, Python, and TypeScript." tone="a" />
        <Feature title="How I Work" text="Clear communication and constant documentation." body="Years of explaining technical problems to non-technical customers taught me to work in both directions: turning technical details into plain language, and turning what someone wants from their software into clear requirements. Understanding the need first is how I build something that actually solves it. I also document my work thoroughly, recording what changed, why, and how to undo it, so anyone can pick up where I left off - including me!" tone="b" reverse />
      </div>
      <CallToAction />
      <Contact />
      <Footer />
    </div>
  );
}
