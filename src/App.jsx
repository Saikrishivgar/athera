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
  
  // Immersive Section Refs
  const part1Ref = useRef(null);
  const content1Ref = useRef(null);
  const part2Ref = useRef(null);
  const content2Ref = useRef(null);
  
  // Motion Section Refs
  const diagonal1Ref = useRef(null);
  const diagonal2Ref = useRef(null);
  const workshopsTitleRef = useRef(null);
  
  // Scrolling Text Refs
  const scrollingTextRef = useRef(null);
  const scrollSpeedRef = useRef(0);
  const currentSkewRef = useRef(0);
  const currentScaleRef = useRef(1);

  // --- CONFIGURATION ---
  // /* --- CHANGED: Increased duration for a "heavier/slower" feel --- */
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
      // /* --- CHANGED: Reduced multiplier (0.5 means half speed) --- */
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
          // /* --- CHANGED: Increased distance (slower transition) --- */
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

      // --- 4. IMMERSIVE WORLD LOGIC ---
      const renderWorld = (p) => {
        const scrollDistance = 150;
        let wx = 0, wy = 0;
        let c1y = 0, c2y = 0;
        let op1 = 0, op2 = 0;
        let scale1 = 1;

        let textTransX = 100;
        let textOpacity = 0;

        // --- Text Logic with Physics ---
        if (p > 0.20) {
            const textProgress = (p - 0.20) / 0.80; 
            textTransX = 120 - (textProgress * 300); 
            // Fade out at the very end
            textOpacity = p < 0.95 ? 1 : 1 - ((p - 0.95) * 20); 
        } else {
            textOpacity = 0;
        }
        
        if (scrollingTextRef.current) {
          const targetVelocity = scrollSpeedRef.current;
          
          const skewStrength = 0.25;
          let targetSkew = targetVelocity * skewStrength;
          targetSkew = Math.max(Math.min(targetSkew, 20), -20);

          const scaleStrength = 0.005;
          let targetScale = 1 + Math.abs(targetVelocity * scaleStrength);
          targetScale = Math.min(targetScale, 1.5);

          currentSkewRef.current = lerp(currentSkewRef.current, targetSkew, 0.1);
          currentScaleRef.current = lerp(currentScaleRef.current, targetScale, 0.1);

          gsap.set(scrollingTextRef.current, {
             x: `${textTransX}vw`,
             skewX: currentSkewRef.current,
             scaleX: currentScaleRef.current,
             opacity: textOpacity,
             force3D: true
          });
        }

        // --- COORDINATE LOGIC (3 PHASES) ---
        
        // Phase 1: Entry (0% - 15%)
        if (p < 0.15) {
            const entryP = p / 0.15;
            wx = 0; wy = 0;
            
            c1y = 100 * (1 - entryP); // Slide up effect
            op1 = entryP; 
            scale1 = 0.95 + (0.05 * entryP); 
            
            op2 = 0;
        }
        // Phase 2: Hold (15% - 35%)
        else if (p >= 0.15 && p < 0.35) {
            wx = 0; wy = 0;
            c1y = 0;
            op1 = 1;
            scale1 = 1;
            op2 = 0;
        }
        // Phase 3: Transition (35% - 100%)
        else {
            const localP = (p - 0.35) / 0.65;
            wx = localP * -100;
            wy = localP * -100;
            
            c1y = -50 - (localP * scrollDistance);
            c2y = (1 - localP) * scrollDistance;
            
            op1 = 1 - localP * 1.5;
            op2 = localP * 1.5;
            scale1 = 1 - (localP * 0.1);
        }

        if (worldRef.current) worldRef.current.style.transform = `translate3d(${wx}vw, ${wy}vh, 0)`;
        if (content1Ref.current) content1Ref.current.style.transform = `translate3d(0, ${c1y}px, 0)`;
        if (content2Ref.current) content2Ref.current.style.transform = `translate3d(0, ${c2y}px, 0)`;

        if (part1Ref.current) {
            part1Ref.current.style.opacity = Math.max(0, Math.min(1, op1));
            part1Ref.current.style.transform = `scale(${scale1})`;
            part1Ref.current.classList.toggle('active', op1 > 0.5);
        }
        
        if (part2Ref.current) {
            part2Ref.current.style.opacity = Math.max(0, Math.min(1, op2));
            part2Ref.current.classList.toggle('active', op2 > 0.5);
        }
      };

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        // /* --- CHANGED: Doubled distance. User must scroll twice as much to finish this animation --- */
        end: "+=6000", 
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

        /* RESET & BASICS */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-stopped { overflow: hidden; }

        .athera-container { 
            background-color: transparent;
            color: #fff; 
            font-family: 'Inter', sans-serif; 
            overflow-x: hidden; 
            width: 100%;
            position: relative;
        }
        
        .fixed-bg-video { 
            position: fixed; top: 0; left: 0; 
            width: 100%; height: 100%; 
            object-fit: cover; opacity: 0.4;
            z-index: -1; pointer-events: none;
        }

        /* --- White Blocks Container --- */
        .transition-blocks-layer {
          position: absolute; top: 100vh; left: 0;
          width: 100%; height: 100vh;
          display: flex; z-index: 5; pointer-events: none;
        }
        .t-block { flex: 1; height: 100%; background: #000; transform: translateY(0); }

        /* NAV BAR */
        .nav-bar {
            position: fixed; top: 0; width: 100%; padding: 2.4rem 3rem;
            display: flex; justify-content: space-between; align-items: center;
            z-index: 100; box-sizing: border-box;
            background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }
        .nav-left { position: absolute; left: 3rem; top: 50%; transform: translateY(-50%); }
        .nav-center {
            position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
            display: flex; gap: 3rem; font-size: 0.65rem; text-transform: uppercase;
            letter-spacing: 0.3em; font-weight: bold;
        }
        .nav-center a { color: white; text-decoration: none; transition: color 0.3s; cursor: pointer; }
        .nav-center a:hover { color: #dc2626; }
        .nav-right {
            position: absolute; right: 3rem; top: 50%; transform: translateY(-50%);
            display: flex; align-items: center; gap: 1.2rem;
        }
        
        /* LOGO */
        .logo-circle { 
            width: 60px; height: 60px; 
            border-radius: 50%; overflow: hidden; 
            border: 2px solid #dc2626; 
            display: flex; align-items: center; justify-content: center; 
            background: transparent;
            cursor: pointer; 
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .logo-circle:hover {
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
        }
        .logo-img { width: 100%; height: 100%; object-fit: cover; }

        /* BUTTONS */
        .reg-btn { 
            border: 1px solid #dc2626; padding: 0.5rem 1.5rem; 
            font-size: 0.65rem; font-weight: bold; text-transform: uppercase; 
            background: transparent; color: white; cursor: pointer; transition: background 0.3s;
        }
        .reg-btn:hover { background: #dc2626; }

        .hackathon-nav-btn {
            position: relative; padding: 0.5rem 1.5rem; font-size: 0.65rem;
            font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase;
            color: #fff; border: 1px solid #dc2626; background: transparent;
            text-decoration: none; overflow: hidden; cursor: pointer; border-radius: 10px;
        }
        .hackathon-nav-btn::before, .hackathon-nav-btn::after {
            content: attr(data-text); position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none;
        }
        .hackathon-nav-btn::before { color: #dc2626; transform: translateX(-2px); }
        .hackathon-nav-btn::after { color: #00ffff; transform: translateX(2px); }
        .hackathon-nav-btn:hover::before, .hackathon-nav-btn:hover::after {
            opacity: 1; animation: nav-glitch 0.35s steps(2, end) infinite;
        }
        @keyframes nav-glitch {
            0% { clip-path: inset(15% 0 80% 0); }
            50% { clip-path: inset(70% 0 15% 0); }
            100% { clip-path: inset(0 0 0 0); }
        }

        /* HERO TYPOGRAPHY */
        .hero-title { 
            font-size: 12vw; font-weight: 900; font-style: italic; 
            line-height: 1; letter-spacing: -0.05em; margin: 0;
            position: relative; z-index: 10;
        }
        .hero-sub { color: #dc2626; letter-spacing: 1.5em; font-size: 0.65rem; text-transform: uppercase; margin-top: 1rem; position: relative; z-index: 10; }

        /* GRID & MOTION SECTION */
        .technical-grid {
            background-image: 
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(circle, black 40%, transparent 95%);
            position: relative; 
            min-height: 200vh; 
            padding-top: 0;
            padding-bottom: 10rem;
            overflow: hidden; 
        }

        .sticky-text { 
            position: sticky; top: 50%; transform: translateY(-50%); 
            margin-left: 5rem; 
            width: 35%; 
            z-index: 30;
            padding: 2.5rem; 
        }
        .vision-main { font-size: 2.25rem; font-weight: 300; line-height: 1.2; }
        
        .newses { 
            position: absolute;
            top: 20vh;
            right: 5%;
            text-align: right;
            font-size: 7rem; 
            font-weight: 900; 
            z-index: 10;
            line-height: 1;
            white-space: nowrap;
            color: #ffffff;
            text-shadow: 0 0 20px rgba(255,255,255,0.2);
        }

        /* --- CARD POSITIONING --- */
        .card-wrapper { position: absolute; z-index: 10; width: 350px; }
        .card-wrapper.c1 { bottom: 0; right: 5%; width: 400px; }
        .card-wrapper.c2 { bottom: -10vh; left: 45%; z-index: 10; width: 350px; }

        .interactive-card {
            width: 100%; border-radius: 4px; filter: grayscale(100%);
            transition: filter 0.5s ease;
            box-shadow: 20px 20px 60px rgba(0,0,0,0.5), -5px -5px 20px rgba(255,0,0,0.1);
        }
        .interactive-card:hover { filter: grayscale(0%); }
        .card-meta { margin-top: 1rem; border-left: 2px solid #dc2626; padding-left: 1rem; }
        .card-meta.right { text-align: right; border-left: none; border-right: 2px solid #dc2626; padding-right: 1rem; }
        .card-label { font-size: 10px; font-weight: bold; color: #dc2626; text-transform: uppercase; }
        .card-title { font-size: 1.25rem; font-weight: bold; }

        /* IMMERSIVE WORLD CSS */
        #immersive-wrapper { 
            position: relative; width: 100vw; height: 100vh; overflow: hidden; 
            background: transparent;
        }
        .world-container { position: absolute; width: 200vw; height: 200vh; will-change: transform; top: 0; left: 0; }
        .imm-section { width: 100vw; height: 100vh; position: absolute; overflow: hidden; opacity: 0; display: flex; justify-content: center; align-items: center; }
        
        #part1 { top: 0; left: 0; transform-origin: center; }
        #part2 { top: 100vh; left: 100vw; }
        
        .inner-content { display: flex; flex-direction: column; align-items: center; z-index: 10; padding: 20px; width: 100%; }
        
        /* Default Hidden State for Immersive Parts (Standard cards) */
        .imm-section .inner-content > * { opacity: 0; transform: translateX(100px); transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
        .imm-section.active .inner-content > * { opacity: 1; transform: translateX(0); }
        
        /* NEW SPLIT LAYOUT CSS FOR PART 1 */
        .split-layout {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 4rem;
            width: 80%;
            max-width: 1200px;
        }
        .split-image-wrapper { flex: 1; display: flex; justify-content: flex-end; }
        .split-image { width: 100%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
        .split-text-wrapper { flex: 1; text-align: left; }
        
        .imm-h1 { font-size: 3rem; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; }
        .imm-tag { background: #ff0000; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 0.75rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; }

        .horizontal-quote { 
            font-size: 8vw; 
            white-space: pre; 
            text-transform: uppercase; 
            font-weight: 900; 
            color: #fff; 
            background: transparent; 
            position: absolute; 
            top: 60%; 
            left: 0; 
            z-index: 50; 
            opacity: 0; 
            display: flex; 
            text-shadow: 0 4px 30px rgba(0,0,0,0.9); 
            will-change: transform; 
            pointer-events: none;
        }
        
        /* FOOTER */
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
                <a href="https://athera-hackathon.vercel.app/" className="hackathon-nav-btn" data-text="HACKATHON">
                   HACKATHON
                </a>
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
          <div className="t-block"></div>
          <div className="t-block"></div>
          <div className="t-block"></div>
          <div className="t-block"></div>
          <div className="t-block"></div>
        </div>
      </section>

      {/* --- SECTION 2: MOTION --- */}
      <section id="motion-section" className="technical-grid">
        <div className="sticky-text">
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Mission Protocol</span>
            </div>

            <p className="vision-main">
                We don't just host events. We engineer <span style={{ fontWeight: 900, fontStyle: 'italic', color: '#dc2626' }}>movements.</span>
            </p>

            <p style={{ marginTop: '2rem', fontSize: '1rem', color: '#a1a1aa', lineHeight: '1.6', maxWidth: '100%' }}>
                Athera is the convergence point for minds that refuse to settle for the present. We are building the infrastructure for tomorrow's autonomous systems today.
            </p>

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="reg-btn" style={{ padding: '0.75rem 2rem', fontSize: '0.75rem' }}>
                    Explore Our Vision
                </button>
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

      {/* --- SECTION 3: IMMERSIVE WORLD WRAPPER --- */}
      <div id="immersive-wrapper" ref={wrapperRef}>
        <div className="world-container" id="world" ref={worldRef}>
          
          {/* PART 1: AGENTIC AI SPLIT (New) */}
          <div className="imm-section" id="part1" ref={part1Ref}>
            <div className="inner-content split-layout" id="content1" ref={content1Ref}>
              
              <div className="split-image-wrapper">
                <img 
                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800" 
                    alt="Agentic AI Visualization" 
                    className="split-image" 
                />
              </div>

              <div className="split-text-wrapper">
                <span className="imm-tag">01 / Intelligence</span>
                <h1 className="imm-h1">Agentic AI</h1>
                <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '1.1rem' }}>
                    Beyond simple automation. AI agents that perceive, reason, and act to achieve complex goals without constant human intervention.
                </p>
                <div style={{ marginTop: '20px', borderLeft: '2px solid #dc2626', paddingLeft: '15px' }}>
                    {/* <p style={{ fontSize: '0.9rem', color: '#71717a' }}>AUTONOMY · REASONING · ACTION</p> */}
                </div>
              </div>

            </div>
          </div>

          {/* PART 2 */}
          <div className="imm-section" id="part2" ref={part2Ref}>
            <div className="inner-content" id="content2" ref={content2Ref}>
                 {/* REMOVED: "The Hive" and "Network" text content */}
            </div>
          </div>

        </div>
        
        {/* Horizontal Text Overlay */}
        <div className="horizontal-quote" id="scrollingText" ref={scrollingTextRef}>
            {textQuote}
        </div>
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