import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import logoImg from './assets/logo.png'; 

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// --- HELPER: Linear Interpolation for smoothing ---
const lerp = (start, end, factor) => start + (end - start) * factor;

const Athera = () => {
  // --- Refs ---
  const mainRef = useRef(null);
  const wrapperRef = useRef(null);
  const worldRef = useRef(null);
  const audioRef = useRef(null);
  const blocksRef = useRef(null);
  
  // Motion Section Refs
  const diagonal1Ref = useRef(null);
  const diagonal2Ref = useRef(null);
  const workshopsTitleRef = useRef(null);
  
  // Scrolling Text Refs
  const scrollingTextRef = useRef(null);
  const scrollSpeedRef = useRef(0);
  const currentSkewRef = useRef(0);
  const currentScaleRef = useRef(1);

  // --- DATA: All Topics ---
  const topics = [
    { tag: "01 / Intelligence", title: "Agentic AI Systems", desc: "Beyond simple automation. AI agents that perceive, reason, and act to achieve complex goals without constant human intervention.", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800" },
    { tag: "02 / Practical", title: "Hands-on Innovation", desc: "Bridging the gap between theory and reality through rapid prototyping and experimental engineering.", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" },
    { tag: "03 / Community", title: "Hackathons & Tech Events", desc: "Fostering a competitive spirit through high-intensity building sessions and global technical gatherings.", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800" },
    { tag: "04 / Academia", title: "Research Implementation", desc: "Translating cutting-edge research papers into scalable, real-world software architectures.", img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800" },
    { tag: "05 / Advanced", title: "Advanced AI & ML", desc: "Deep diving into neural networks, transformer architectures, and the math behind modern intelligence.", img: "https://images.unsplash.com/photo-1555255707-c07966488bc0?w=800" },
    { tag: "06 / Professional", title: "Skill and Career growth", desc: "Empowering the next generation of engineers with industry-ready skills and strategic networking.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" }
  ];

  // --- CONFIGURATION ---
  const SCROLL_DURATION = 2.5; 

  // --- Redirect Logic ---
  const handleAddToCart = (e) => {
    e.preventDefault();
    window.location.href = "/shop";
  };

  // --- SMOOTH SCROLL SETUP (LENIS) ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: SCROLL_DURATION,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.5, 
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      scrollSpeedRef.current = e.velocity;
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      
      // --- White Blocks Transition Animation ---
      const blocks = blocksRef.current.querySelectorAll('.t-block');
      gsap.to(blocks, {
        y: "-100%",
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=2000", 
          scrub: true,
          pin: true,
        }
      });

      // --- 1. Diagonal Card 1 ---
      if (diagonal1Ref.current) {
        gsap.to(diagonal1Ref.current, {
          scrollTrigger: {
            trigger: "#motion-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
          x: -window.innerWidth * 0.4, 
          y: -window.innerHeight * 1.5,
          rotation: -10,
          scale: 0.8
        });
      }

      // --- 2. Diagonal Card 2 ---
      if (diagonal2Ref.current) {
        gsap.to(diagonal2Ref.current, {
          scrollTrigger: {
            trigger: "#motion-section",
            start: "top 60%",
            end: "bottom top",
            scrub: 1,
          },
          x: window.innerWidth * 0.2, 
          y: -window.innerHeight * 1.8,
          rotation: 10,
          scale: 0.9
        });
      }

      // --- 3. Workshops Title ---
      if (workshopsTitleRef.current) {
        gsap.to(workshopsTitleRef.current, {
          x: -window.innerWidth * 1.5, 
          ease: "none",
          scrollTrigger: {
            trigger: "#motion-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1, 
          }
        });
      }

      // --- 4. IMMERSIVE WORLD LOGIC (Modified for dynamic topics) ---
      const renderWorld = (p) => {
        const total = topics.length;
        const segment = 1 / total;

        topics.forEach((_, i) => {
          const sectionEl = document.getElementById(`section-${i}`);
          const contentEl = document.getElementById(`content-${i}`);
          if (!sectionEl || !contentEl) return;

          const start = i * segment;
          const end = (i + 1) * segment;

          if (p >= start && p <= end) {
            const localP = (p - start) / segment; 
            sectionEl.style.opacity = 1;
            sectionEl.style.visibility = "visible";

            // TRANSITION LOGIC
            let tx = 0, ty = 0;
            if (i % 3 === 0) { tx = (1 - localP) * 150; ty = 0; } // Right to Left
            else if (i % 3 === 1) { tx = (localP - 1) * 150; ty = 0; } // Left to Right
            else { tx = (1 - localP) * 100; ty = (1 - localP) * 100; } // Diagonal

            contentEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
            sectionEl.classList.add('active');
          } else {
            sectionEl.style.opacity = 0;
            sectionEl.style.visibility = "hidden";
            sectionEl.classList.remove('active');
          }
        });

        // Text Logic
        let textOpacity = p > 0.05 && p < 0.95 ? 1 : 0;
        if (scrollingTextRef.current) {
          const textTransX = 120 - (p * 400); 
          const targetVelocity = scrollSpeedRef.current;
          currentSkewRef.current = lerp(currentSkewRef.current, Math.max(Math.min(targetVelocity * 0.25, 20), -20), 0.1);
          
          gsap.set(scrollingTextRef.current, {
             x: `${textTransX}vw`,
             skewX: currentSkewRef.current,
             opacity: textOpacity
          });
        }
      };

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: `+=${topics.length * 2000}`, 
        pin: true,
        scrub: 0.1,
        onUpdate: (self) => renderWorld(self.progress)
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  const textQuote = "Designing autonomous intelligence for the future";

  return (
    <div ref={mainRef} className="athera-container">
      <audio ref={audioRef} loop>
        <source src="/audio.mp3" type="audio/mp3" />
      </audio>

      <video autoPlay muted loop playsInline className="fixed-bg-video">
        <source src="/athera.mp4" type="video/mp4" />
      </video>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Inter:wght@300;900&display=swap');

        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-stopped { overflow: hidden; }

        .athera-container { background-color: transparent; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; width: 100%; position: relative; }
        .fixed-bg-video { position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; z-index: -1; pointer-events: none; }
        .transition-blocks-layer { position: absolute; top: 100vh; left: 0; width: 100%; height: 100vh; display: flex; z-index: 5; pointer-events: none; }
        .t-block { flex: 1; height: 100%; background: #000; transform: translateY(0); }
        .nav-bar { position: fixed; top: 0; width: 100%; padding: 2.4rem 3rem; display: flex; justify-content: space-between; align-items: center; z-index: 100; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); }
        .nav-left { position: absolute; left: 3rem; top: 50%; transform: translateY(-50%); }
        .nav-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; gap: 3rem; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.3em; font-weight: bold; }
        .nav-center a { color: white; text-decoration: none; transition: color 0.3s; cursor: pointer; }
        .nav-center a:hover { color: #dc2626; }
        .nav-right { position: absolute; right: 3rem; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 1.2rem; }
        .logo-circle { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid #dc2626; display: flex; align-items: center; justify-content: center; background: transparent; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .logo-circle:hover { transform: scale(1.1); box-shadow: 0 0 15px rgba(220, 38, 38, 0.5); }
        .logo-img { width: 100%; height: 100%; object-fit: cover; }
        .reg-btn { border: 1px solid #dc2626; padding: 0.5rem 1.5rem; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; background: transparent; color: white; cursor: pointer; transition: background 0.3s; }
        .reg-btn:hover { background: #dc2626; }
        .hackathon-nav-btn { position: relative; padding: 0.5rem 1.5rem; font-size: 0.65rem; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; color: #fff; border: 1px solid #dc2626; background: transparent; text-decoration: none; overflow: hidden; cursor: pointer; border-radius: 10px; }
        .hackathon-nav-btn::before, .hackathon-nav-btn::after { content: attr(data-text); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }
        .hackathon-nav-btn::before { color: #dc2626; transform: translateX(-2px); }
        .hackathon-nav-btn::after { color: #00ffff; transform: translateX(2px); }
        .hackathon-nav-btn:hover::before, .hackathon-nav-btn:hover::after { opacity: 1; animation: nav-glitch 0.35s steps(2, end) infinite; }
        @keyframes nav-glitch { 0% { clip-path: inset(15% 0 80% 0); } 50% { clip-path: inset(70% 0 15% 0); } 100% { clip-path: inset(0 0 0 0); } }
        .hero-title { font-size: 12vw; font-weight: 900; font-style: italic; line-height: 1; letter-spacing: -0.05em; margin: 0; position: relative; z-index: 10; }
        .hero-sub { color: #dc2626; letter-spacing: 1.5em; font-size: 0.65rem; text-transform: uppercase; margin-top: 1rem; position: relative; z-index: 10; }
        .technical-grid { background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(circle, black 40%, transparent 95%); position: relative; min-height: 200vh; padding-top: 0; padding-bottom: 10rem; overflow: hidden; }
        .sticky-text { position: sticky; top: 50%; transform: translateY(-50%); margin-left: 5rem; width: 35%; z-index: 30; padding: 2.5rem; }
        .vision-main { font-size: 2.25rem; font-weight: 300; line-height: 1.2; }
        .newses { position: absolute; top: 20vh; right: 5%; text-align: right; font-size: 7rem; font-weight: 900; z-index: 10; line-height: 1; white-space: nowrap; color: #ffffff; text-shadow: 0 0 20px rgba(255,255,255,0.2); }
        .card-wrapper { position: absolute; z-index: 10; width: 350px; }
        .card-wrapper.c1 { bottom: 0; right: 5%; width: 400px; }
        .card-wrapper.c2 { bottom: -10vh; left: 45%; z-index: 10; width: 350px; }
        .interactive-card { width: 100%; border-radius: 4px; filter: grayscale(100%); transition: filter 0.5s ease; box-shadow: 20px 20px 60px rgba(0,0,0,0.5), -5px -5px 20px rgba(255,0,0,0.1); }
        .interactive-card:hover { filter: grayscale(0%); }
        .card-meta { margin-top: 1rem; border-left: 2px solid #dc2626; padding-left: 1rem; }
        .card-meta.right { text-align: right; border-left: none; border-right: 2px solid #dc2626; padding-right: 1rem; }
        .card-label { font-size: 10px; font-weight: bold; color: #dc2626; text-transform: uppercase; }
        .card-title { font-size: 1.25rem; font-weight: bold; }
        #immersive-wrapper { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: transparent; }
        .imm-section { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; visibility: hidden; opacity: 0; will-change: transform; transition: opacity 0.5s ease; }
        .split-layout { display: flex; align-items: center; gap: 4rem; width: 85%; max-width: 1200px; }
        .split-image { width: 100%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .imm-h1 { font-size: 3.5rem; text-transform: uppercase; font-weight: 900; margin-bottom: 10px; }
        .imm-tag { background: #ff0000; padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 20px; }
        .horizontal-quote { position: absolute; top: 70%; left: 0; font-size: 8vw; white-space: nowrap; font-weight: 900; text-transform: uppercase; opacity: 0; pointer-events: none; z-index: 50; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        footer { background: #000; padding-top: 10rem; padding-bottom: 2.5rem; position: relative; border-top: 1px solid #18181b; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }
        .footer-top { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 5rem; align-items: flex-end; }
        .footer-reveal-text { font-size: 8vw; line-height: 0.8; font-weight: 900; font-style: italic; color: #1a1a1a; transition: color 0.5s ease; cursor: default; user-select: none; letter-spacing: -0.05em; }
        .footer-container:hover .footer-reveal-text { color: #dc2626; }
        .footer-links ul { list-style: none; padding: 0; color: #52525b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; line-height: 2; }
        .footer-links a { color: inherit; text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: #dc2626; }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      <section className="hero-section" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <nav className="nav-bar">
             <div className="nav-left">
                <div className="logo-circle" onClick={() => window.location.reload()}>
                   <img src={logoImg} alt="Athera Logo" className="logo-img" />
                </div>
             </div>
             <div className="nav-center">
                <a href="#">Events</a>
                <a href="#">About Us</a>
                <a href="#">Contact</a>
                <a onClick={handleAddToCart}>Add to Cart</a>
             </div>
             <div className="nav-right">
                <a href="https://athera-hackathon.vercel.app/" className="hackathon-nav-btn" data-text="HACKATHON">HACKATHON</a>
                <button className="reg-btn">Register</button>
             </div>
          </nav>

        <h1 className="hero-title">ATHERA</h1>
        <p className="hero-sub">The Digital Renaissance</p>

        <div style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Scroll to explore</p>
          <div style={{ width: '1px', height: '4rem', background: 'linear-gradient(to bottom, #dc2626, transparent)' }}></div>
        </div>

        <div className="transition-blocks-layer" ref={blocksRef}>
          {[...Array(5)].map((_, i) => <div key={i} className="t-block"></div>)}
        </div>
      </section>

      {/* --- SECTION 2: MOTION --- */}
      <section id="motion-section" className="technical-grid">
        <div className="sticky-text">
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Mission Protocol</span>
            </div>
            <p className="vision-main">We don't just host events. We engineer <span style={{ fontWeight: 900, fontStyle: 'italic', color: '#dc2626' }}>movements.</span></p>
            <p style={{ marginTop: '2rem', fontSize: '1rem', color: '#a1a1aa', lineHeight: '1.6', maxWidth: '100%' }}>Athera is the convergence point for minds that refuse to settle for the present.</p>
            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="reg-btn" style={{ padding: '0.75rem 2rem', fontSize: '0.75rem' }}>Explore Our Vision</button>
            </div>
        </div>
        <h1 ref={workshopsTitleRef} className="newses">WORKSHOPS</h1>
        <div ref={diagonal1Ref} className="card-wrapper c1">
          <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800" alt="Cybernetic Design" className="interactive-card"/>
          <div className="card-meta"><p className="card-label">Workshop 01</p><p className="card-title">CYBERNETIC DESIGN</p></div>
        </div>
        <div ref={diagonal2Ref} className="card-wrapper c2">
           <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" alt="Hardware Hacking" className="interactive-card"/>
           <div className="card-meta right"><p className="card-label">Workshop 02</p><p className="card-title">HARDWARE HACKING</p></div>
        </div>
      </section>

      {/* --- SECTION 3: IMMERSIVE WORLD (NOW DYNAMIC) --- */}
      <div id="immersive-wrapper" ref={wrapperRef}>
        {topics.map((item, index) => (
          <div className="imm-section" id={`section-${index}`} key={index}>
            <div id={`content-${index}`} className="inner-content split-layout" style={{ flexDirection: index % 2 !== 0 ? 'row-reverse' : 'row' }}>
              <div className="split-image-wrapper">
                <img src={item.img} alt={item.title} className="split-image" />
              </div>
              <div className="split-text-wrapper">
                <span className="imm-tag">{item.tag}</span>
                <h1 className="imm-h1">{item.title}</h1>
                <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="horizontal-quote" ref={scrollingTextRef}>{textQuote}</div>
      </div>

     {/* --- FOOTER --- */}
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-top">
            
            <div style={{ maxWidth: '340px' }}>
              <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>ATHERA</p>
              <p style={{ color: '#71717a', fontSize: '0.85rem', lineHeight: 1.6 }}>AI & Technology Hub for Enhanced Research and Analytics</p>
              <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '1rem' }}>Department of Computer Science and Engineering (AI & ML) <br /> Chennai Institute of Technology</p>
            </div>

            <div className="footer-links">
              <h4>About ATHERA</h4>
              <ul>
                <li><a href="#">About the Club</a></li>
                <li><a href="#">Vision & Mission</a></li>
                <li><a href="#">Faculty Advisors</a></li>
                <li><a href="#">Core Team</a></li>
                <li><a href="#">Student Members</a></li>
              </ul>
            </div>

             <div className="footer-links">
              <h4>Domains</h4>
              <ul>
                <li><a href="#">Agentic AI Systems</a></li>
                <li><a href="#">Machine Learning</a></li>
                <li><a href="#">Large Language Models</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-reveal-text">ATHERA</div>

          <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderTop: '1px solid #18181b', paddingTop: '2rem', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#3f3f46', gap: '1rem' }}>
            <h3>© 2025 ATHERA CLUB — ALL RIGHTS RESERVED</h3>
            <h3>Faculty Advisor: Dr. P. Karthikeyan · CSE (AIML)</h3>
            <p>
              <a href="#" style={{ marginRight: '1rem' }}>LinkedIn</a>
              <a href="#" style={{ marginRight: '1rem' }}>Instagram</a>
              <a href="#">GitHub</a>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Athera;
