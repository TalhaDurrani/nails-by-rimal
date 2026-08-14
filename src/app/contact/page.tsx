"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [isSent, setIsSent] = useState(false);

  // Animation for reveal elements
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (e.target as HTMLFormElement).reset();
    setIsSent(true);
  };

  return (
    <main className="w-full flex flex-col min-h-screen">
      {/* PAGE HEAD */}
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> &nbsp;/&nbsp; Contact</div>
          <h1>Say Hello</h1>
          <div className="divider-heart">
            <span className="line"></span>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg>
            <span className="line"></span>
          </div>
          <p style={{ maxWidth: '480px', margin: '0 auto', color: 'var(--ink-soft)', fontSize: '14.5px' }}>
            Questions about sizing, an order, or wholesale? Our studio team replies within one business day.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: '10px' }}>
        <div className="container contact-layout">
          
          <div className="reveal in">
            <div className="contact-info-card">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"/></svg></div>
              <div><h4>Studio</h4><p>Nails by Rimal Atelier, Rawalpindi, Punjab, Pakistan</p></div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h16v16H4z"/><path d="M4 6l8 6 8-6"/></svg></div>
              <div><h4>Email</h4><p>hello@nailsbyrimal.com</p></div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.2a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><h4>WhatsApp</h4><p>+92 3xx xxxxxxx &middot; 10am–7pm, Mon–Sat</p></div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
              <div><h4>Studio Hours</h4><p>Monday – Saturday, 10am – 7pm PKT</p></div>
            </div>

            <div className="map-block">Studio location &middot; Rawalpindi, Pakistan</div>
          </div>

          <div className="reveal in">
            <div className="form-card">
              <h3>Send us a message</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-field"><label>Name</label><input type="text" placeholder="Your name" required /></div>
                  <div className="form-field"><label>Email</label><input type="email" placeholder="you@email.com" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Subject</label>
                    <select>
                      <option>Order Enquiry</option>
                      <option>Sizing Help</option>
                      <option>Wholesale</option>
                      <option>Something Else</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Message</label>
                    <textarea rows={5} placeholder="Tell us a little about what you need..." style={{ border: '1px solid var(--blush-2)', borderRadius: '12px', padding: '12px 15px', fontFamily: '"Jost", sans-serif', fontSize: '13.5px', background: 'var(--cream-2)', outline: 'none', color: 'var(--ink)', resize: 'vertical' }} required></textarea>
                  </div>
                </div>
                <button type="submit" className="btn btn-fill btn-block">Send Message</button>
                {isSent && (
                  <p style={{ textAlign: 'center', color: 'var(--rose-deep)', fontSize: '13px', marginTop: '16px' }}>
                    Thank you — we&apos;ll be in touch soon &#10084;
                  </p>
                )}
              </form>
            </div>
          </div>

        </div>
      </section>

      <section style={{ background: 'var(--cream-2)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="sec-head reveal">
            <span className="eyebrow">Before You Ask</span>
            <h2>Frequently asked</h2>
          </div>

          {[
            { q: "How long does delivery take?", a: "Orders ship within 2–4 business days across Pakistan, with tracking sent via email and WhatsApp." },
            { q: "Can I reuse my press-ons?", a: "Yes — with gentle removal and flat storage, most sets can be reused for up to 10 wears." },
            { q: "What if the sizing doesn't fit?", a: "Every set includes 2 sizes per finger position. If nothing fits, our sizing guide and support team will help you exchange." },
            { q: "Do you offer wholesale or custom sets?", a: "We do! Reach out via the form above with \"Wholesale\" selected and our studio will follow up with details." }
          ].map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item reveal in ${openFaq === index ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
            >
              <div className="faq-q"><span>{faq.q}</span><span className="plus">+</span></div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}

        </div>
      </section>
    </main>
  );
}
