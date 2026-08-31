"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NewsletterForm } from "@/components/NewsletterForm";

export default function AboutPage() {
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

  return (
    <main className="w-full flex flex-col min-h-screen">
      {/* PAGE HEAD */}
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> &nbsp;/&nbsp; About</div>
          <h1>The Studio Behind the Sets</h1>
          <div className="divider-heart">
            <span className="line"></span>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg>
            <span className="line"></span>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: '20px' }}>
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="reveal in">
            <span className="eyebrow">Handmade in Rawalpindi</span>
            <h2 style={{ fontSize: 'clamp(28px,3.4vw,40px)', margin: '16px 0 20px' }}>Nails that feel like a love letter to yourself.</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: '1.85', marginBottom: '20px' }}>
              Nails by Rimal started at a kitchen table with a bottle of gel polish and a promise: salon-quality nails shouldn&apos;t need a salon appointment. Every set is still hand-painted by our small team, cured, filed and boxed before it reaches your door.
            </p>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: '1.85' }}>
              We design in tiny batches — usually under thirty sets per shade — so every collection stays a little rare, and a little more personal.
            </p>
          </div>
          <div className="about-visual reveal in h-[420px] flex items-center justify-center relative order-first lg:order-none">
            <div className="hex-frame h2"></div>
            <div className="hex-frame"></div>
            <div className="fan-wrap palette-gold">
              <div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--cream-2)', paddingTop: '80px' }}>
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">How We Got Here</span>
            <h2>Our journey</h2>
          </div>
          <div className="timeline">
            <div className="tl-item reveal">
              <div className="tl-year">2022</div>
              <div className="tl-body">
                <h4>First hundred sets</h4>
                <p>Rimal hand-painted the very first Blush Almond sets and sold them to friends in Rawalpindi.</p>
              </div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-year">2023</div>
              <div className="tl-body">
                <h4>Studio opens</h4>
                <p>A dedicated studio space and a three-person team allowed weekly small-batch drops to begin.</p>
              </div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-year">2024</div>
              <div className="tl-body">
                <h4>Nationwide shipping</h4>
                <p>Nails by Rimal began shipping across Pakistan, reaching customers well beyond Rawalpindi and Islamabad.</p>
              </div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-year">2026</div>
              <div className="tl-body">
                <h4>This shop</h4>
                <p>Our full online atelier launches, bringing every collection — past and present — under one roof.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">What We Stand For</span>
            <h2>Our values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="value-card reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg></div>
              <h4>Handmade, always</h4>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', marginTop: '10px' }}>No mass production — every fan is painted, cured and packed by hand.</p>
            </div>
            <div className="value-card reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg></div>
              <h4>Cruelty-free</h4>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', marginTop: '10px' }}>Every formula we use is cruelty-free, and always will be.</p>
            </div>
            <div className="value-card reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M4 7v5h5M20 17v-5h-5"/></svg></div>
              <h4>Made to be reused</h4>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', marginTop: '10px' }}>Reusable sets mean less waste, and more mileage from every purchase.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Meet the Studio</span>
            <h2>The hands behind your nails</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="reveal">
              <div className="team-avatar">R</div>
              <h4 style={{ color: 'var(--cream)' }}>Rimal</h4>
              <div className="role">Founder &amp; Lead Designer</div>
            </div>
            <div className="reveal">
              <div className="team-avatar">S</div>
              <h4 style={{ color: 'var(--cream)' }}>Sana</h4>
              <div className="role">Nail Artist</div>
            </div>
            <div className="reveal">
              <div className="team-avatar">A</div>
              <h4 style={{ color: 'var(--cream)' }}>Ayesha</h4>
              <div className="role">Orders &amp; Packing</div>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container reveal">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Join the Atelier</span>
          <h2>Get first look at new drops</h2>
          <p>Restocks, seasonal edits and 10% off your first set — straight to your inbox.</p>
          <NewsletterForm />
        </div>
      </section>

    </main>
  );
}
