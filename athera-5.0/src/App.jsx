import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

const Athera = () => {
  // --- Refs ---
  const mainRef = useRef(null);
  const wrapperRef = useRef(null);
  const worldRef = useRef(null);
  const audioRef = useRef(null); 
  
  const part1Ref = useRef(null);
  const part2Ref = useRef(null);
  const part3Ref = useRef(null);
  
  const content1Ref = useRef(null);
  const content2Ref = useRef(null);
  const content3Ref = useRef(null);
  
  const diagonal1Ref = useRef(null);
  const diagonal2Ref = useRef(null);
  const scrollingTextRef = useRef(null);

  // --- Audio State ---
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Diagonal Cards Animation
      if (diagonal1Ref.current) {
        gsap.to(diagonal1Ref.current, {
          scrollTrigger: {
            trigger: "#motion-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
          x: -window.innerWidth * 0.8,
          y: -window.innerHeight * 1.5,
          rotation: -10,
          scale: 0.8
        });
      }

      if (diagonal2Ref.current) {
        gsap.to(diagonal2Ref.current, {
          scrollTrigger: {
            trigger: "#motion-section",
            start: "top 60%", 
            end: "bottom top",
            scrub: 1,
          },
          x: window.innerWidth * 1.5, 
          y: -window.innerHeight * 1.8,
          rotation: 15, 
          scale: 0.9
        });
      }

      // 2. Immersive World Logic
      const renderWorld = (p) => {
        const scrollDistance = 150; 
        let wx = 0, wy = 0; 
        let c1y = 0, c2y = 0, c3y = 0; 
        let op1 = 0, op2 = 0, op3 = 0;
        let textTransX = 100; 
        let textOpacity = 0; 

        // Text Movement
        if (p > 0.20 && p < 0.80) {
            const textProgress = (p - 0.20) / 0.60; 
            textTransX = 100 - (textProgress * 300); 
            textOpacity = 1;
        } else {
            textOpacity = 0;
        }
        
        if (scrollingTextRef.current) {
          scrollingTextRef.current.style.transform = `translateX(${textTransX}vw)`;
          scrollingTextRef.current.style.opacity = textOpacity;
        }

        // Coordinate Logic
        // PHASE 1
        if (p <= 0.15) {
            const localP = p / 0.15;
            wx = 0; wy = 0;
            c1y = localP * -scrollDistance;
            op1 = 1; op2 = 0; op3 = 0;
        } 
        // PHASE 2
        else if (p > 0.15 && p <= 0.30) {
            const localP = (p - 0.15) / 0.15;
            c1y = -scrollDistance;
            wx = localP * -100;
            wy = localP * -100;
            op1 = 1 - localP;
            op2 = localP;
            op3 = 0;
        }
        // PHASE 3
        else if (p > 0.30 && p <= 0.70) {
            const localP = (p - 0.30) / 0.40;
            wx = -100; wy = -100;
            c2y = localP * -scrollDistance; 
            c1y = -scrollDistance;
            op1 = 0; op2 = 1; op3 = 0;
        }
        // PHASE 4
        else if (p > 0.70 && p <= 0.85) {
            const localP = (p - 0.70) / 0.15;
            wx = -100 + (localP * -100); 
            wy = -100 + (localP * 100);
            c1y = -scrollDistance;
            c2y = -scrollDistance;
            op1 = 0;
            op2 = 1 - localP;
            op3 = localP;
        }
        // PHASE 5
        else {
            const localP = (p - 0.85) / 0.15;
            wx = -200; wy = 0;
            c3y = localP * -scrollDistance;
            c1y = -scrollDistance;
            c2y = -scrollDistance;
            op1 = 0; op2 = 0; op3 = 1;
        }

        if (worldRef.current) worldRef.current.style.transform = `translate3d(${wx}vw, ${wy}vh, 0)`;
        if (content1Ref.current) content1Ref.current.style.transform = `translate3d(0, ${c1y}px, 0)`;
        if (content2Ref.current) content2Ref.current.style.transform = `translate3d(0, ${c2y}px, 0)`;
        if (content3Ref.current) content3Ref.current.style.transform = `translate3d(0, ${c3y}px, 0)`;

        if (part1Ref.current) part1Ref.current.style.opacity = op1;
        if (part2Ref.current) part2Ref.current.style.opacity = op2;
        if (part3Ref.current) part3Ref.current.style.opacity = op3;

        if (part1Ref.current) part1Ref.current.classList.toggle('active', op1 > 0.5);
        if (part2Ref.current) part2Ref.current.classList.toggle('active', op2 > 0.5);
        if (part3Ref.current) part3Ref.current.classList.toggle('active', op3 > 0.5);
      };

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "+=4000",
        pin: true,
        scrub: 0.1,
        onUpdate: (self) => renderWorld(self.progress)
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  const handleRestart = () => {
    wrapperRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const textQuote = "Improving myself to be a deserved one for the desired thing";

  return (
    <div ref={mainRef} className="athera-container">
      {/* --- AUDIO COMPONENT --- */}
      <audio ref={audioRef} loop>
        <source src="/audio.mp3" type="audio/mp3" />
      </audio>

      {/* --- GLOBAL FIXED BACKGROUND VIDEO --- */}
      <video autoPlay muted loop playsInline className="fixed-bg-video">
        <source src="/athera.mp4" type="video/mp4" />
      </video>

      {/* --- EMBEDDED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Inter:wght@300;900&display=swap');

        /* RESET & BASICS */
        .athera-container { 
            background-color: transparent;
            color: #fff; 
            font-family: 'Inter', sans-serif; 
            overflow-x: hidden; 
            width: 100%;
            position: relative;
        }
        
        .fixed-bg-video { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            opacity: 0.4;
            z-index: -1; 
            pointer-events: none;
        }

        /* NAV BAR */
        .nav-bar {
            position: fixed;
            top: 0; width: 100%; padding: 2rem;
            display: flex; justify-content: space-between; align-items: center;
            z-index: 100; box-sizing: border-box;
            background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }
        .nav-links { display: flex; gap: 3rem; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.3em; font-weight: bold; }
        .nav-links a { color: white; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #dc2626; }
        
        .brand-logo { font-family: 'Syncopate', sans-serif; color: #dc2626; font-size: 1.25rem; font-weight: bold; letter-spacing: -1px; }
        .reg-btn { 
            border: 1px solid #dc2626; padding: 0.5rem 1.5rem; 
            font-size: 0.65rem; font-weight: bold; text-transform: uppercase; 
            background: transparent; color: white; cursor: pointer; transition: background 0.3s;
        }
        .reg-btn:hover { background: #dc2626; }

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
            min-height: 130vh; 
            padding-top: 0;
            padding-bottom: 10rem;
        }

        /* STICKY TEXT STYLES */
        .sticky-text { 
            position: sticky; 
            top: 50%; 
            transform: translateY(-50%); 
            margin-left: 5rem; 
            max-width: 32rem; 
            z-index: 20; /* High Z-Index to hover over images */
            padding: 2.5rem; 
        }
        .vision-tag { color: #dc2626; font-weight: bold; letter-spacing: 0.5em; font-size: 0.75rem; margin-bottom: 1rem; display: block; }
        .vision-main { font-size: 2.25rem; font-weight: 300; line-height: 1.2; }
        
        /* CARD HOVER EFFECTS */
        .card-wrapper {
            position: absolute;
            z-index: 10; /* Lower Z-Index than sticky text */
            width: 350px;
        }
        .card-wrapper.c1 { bottom: 0; right: -10%; width: 400px; }
        .card-wrapper.c2 { bottom: -10vh; left: -10%; }

        .interactive-card {
            width: 100%;
            border-radius: 4px;
            filter: grayscale(100%);
            transition: filter 0.5s ease;
            box-shadow: 20px 20px 60px rgba(0,0,0,0.5), -5px -5px 20px rgba(255,0,0,0.1);
        }
        .interactive-card:hover {
            filter: grayscale(0%);
        }

        .card-meta { margin-top: 1rem; border-left: 2px solid #dc2626; padding-left: 1rem; }
        .card-meta.right { text-align: right; }
        .card-label { font-size: 10px; font-weight: bold; color: #dc2626; text-transform: uppercase; }
        .card-title { font-size: 1.25rem; font-weight: bold; }

        /* IMMERSIVE WORLD CSS */
        #immersive-wrapper { 
            position: relative; width: 100vw; height: 100vh; overflow: hidden; 
            background: transparent;
        }
        .world-container { position: absolute; width: 300vw; height: 200vh; will-change: transform; top: 0; left: 0; }
        .imm-section { width: 100vw; height: 100vh; position: absolute; overflow: hidden; opacity: 0; display: flex; justify-content: center; align-items: center; }
        
        #part1 { top: 0; left: 0; }
        #part2 { top: 100vh; left: 100vw; }
        #part3 { top: 0; left: 200vw; }
        
        .inner-content { display: flex; flex-direction: column; align-items: center; z-index: 10; padding: 20px; width: 100%; }
        
        .inner-content > *:not(.horizontal-quote) {
            opacity: 0;
            transform: translateX(100px); 
            transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .imm-section.active .inner-content > * {
            opacity: 1;
            transform: translateX(0);
        }
        .imm-section.active .inner-content > *:nth-child(1) { transition-delay: 0.1s; } 
        .imm-section.active .inner-content > *:nth-child(2) { transition-delay: 0.2s; } 
        .imm-section.active .inner-content > *:nth-child(3) { transition-delay: 0.3s; } 

        .imm-card { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); border-left: 4px solid #ff0000; border-radius: 16px; padding: 25px; max-width: 600px; width: 100%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); text-align: left; margin: 15px 0; }
        .imm-h1 { font-size: 3rem; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
        .imm-tag { background: #ff0000; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 0.75rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; box-shadow: 0 0 15px rgba(255, 0, 0, 0.4); }
        
        .horizontal-quote { font-size: 6vw; white-space: pre; text-transform: uppercase; font-weight: 900; color: #fff; border-left: 20px solid #ff0000; padding-left: 40px; position: absolute; top: 150vh; left: 0; z-index: 20; opacity: 0; display:flex; text-shadow: 0 4px 30px rgba(0,0,0,0.9); }
        .wave-char { display: inline-block; animation: waveAnim 2s ease-in-out infinite; animation-delay: calc(0.05s * var(--char-index)); }
        
        @keyframes waveAnim { 
            0%, 100% { transform: translateY(0); color: #fff; } 
            50% { transform: translateY(-30px); color: #ff0000; text-shadow: 0 0 20px rgba(255, 0, 0, 0.8); } 
        }

        /* FOOTER */
        footer { 
            background: #000;
            padding-top: 10rem; padding-bottom: 2.5rem; position: relative; border-top: 1px solid #18181b; 
        }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }
        .footer-top { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 5rem; align-items: flex-end; }
        
        .footer-reveal-text { 
            font-size: 8vw; line-height: 0.8; font-weight: 900; font-style: italic; 
            color: #1a1a1a; 
            transition: color 0.5s ease; 
            cursor: default; user-select: none;
            letter-spacing: -0.05em;
        }
        
        .footer-container:hover .footer-reveal-text { color: #dc2626; }
        
        .footer-links ul { list-style: none; padding: 0; color: #52525b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; line-height: 2; }
        .footer-links a { color: inherit; text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: #dc2626; }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        
        <nav className="nav-bar">
          <div className="brand-logo">ATHERA</div>
          <div className="nav-links">
            <a href="#">Events</a>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
          </div>
          <div style={{ display:'flex', alignItems:'center' }}>
            <button className="reg-btn">Register</button>
          </div>
        </nav>

        <h1 className="hero-title">ATHERA</h1>
        <p className="hero-sub">The Digital Renaissance</p>

        <div style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Scroll to explore</p>
          <div style={{ width: '1px', height: '4rem', background: 'linear-gradient(to bottom, #dc2626, transparent)' }}></div>
        </div>
      </section>

      {/* --- SECTION 2: MOTION --- */}
      <section id="motion-section" className="technical-grid">
        
        {/* --- ADDED: STICKY TEXT HOVERING OVER TRANSITION --- */}
        <div className="sticky-text">
            <span className="vision-tag">// ABOUT THE VISION</span>
            <p className="vision-main">
                We don't just host events. We engineer <span style={{ fontWeight: 900, fontStyle: 'italic', color: '#dc2626' }}>movements.</span>
            </p>
        </div>
        {/* ---------------------------------------------------- */}

        <div ref={diagonal1Ref} className="card-wrapper c1">
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800" 
            alt="Cybernetic Design" 
            className="interactive-card"
          />
          <div className="card-meta">
            <p className="card-label">Workshop 01</p>
            <p className="card-title">CYBERNETIC DESIGN</p>
          </div>
        </div>

        <div ref={diagonal2Ref} className="card-wrapper c2">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" 
            alt="Hardware Hacking" 
            className="interactive-card"
          />
          <div className="card-meta right">
            <p className="card-label">Workshop 02</p>
            <p className="card-title">HARDWARE HACKING</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: IMMERSIVE WORLD --- */}
      <div id="immersive-wrapper" ref={wrapperRef}>
        <div className="world-container" id="world" ref={worldRef}>
          
          <div className="imm-section" id="part1" ref={part1Ref}>
            <div className="inner-content" id="content1" ref={content1Ref}>
              <span className="imm-tag">01 / The Void</span>
              <h1 className="imm-h1">Dark Matter</h1>
              <div className="imm-card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>Compact Space</h2>
                <p style={{ color: '#ccc', lineHeight: 1.6 }}>We have integrated the coordinate system. The scroll track is now pinned to this section.</p>
              </div>
            </div>
          </div>

          <div className="imm-section" id="part2" ref={part2Ref}>
            <div className="inner-content" id="content2" ref={content2Ref}></div>
          </div>

          <div className="horizontal-quote" id="scrollingText" ref={scrollingTextRef}>
            {textQuote.split('').map((char, index) => (
              <span key={index} className="wave-char" style={{ '--char-index': index }}>
                {char}
              </span>
            ))}
          </div>

          <div className="imm-section" id="part3" ref={part3Ref}>
            <div className="inner-content" id="content3" ref={content3Ref}>
              <span className="imm-tag">03 / Finality</span>
              <h1 className="imm-h1">The Core</h1>
              <div className="imm-card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>Arrival</h2>
                <p style={{ color: '#ccc', lineHeight: 1.6 }}>We have moved Northeast to the final coordinate. The animation resets when you leave the area.</p>
                <button onClick={handleRestart} style={{ padding: '15px 30px', cursor:'pointer', background:'#ff0000', border:'none', borderRadius:'30px', fontWeight:'bold', color:'#fff', marginTop:'20px', fontSize: '1rem', boxShadow: '0 5px 20px rgba(255,0,0,0.4)' }}>
                  Restart Journey ↺
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-top">
            <div style={{ maxWidth: '300px' }}>
              <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Connect with us</p>
              <p style={{ color: '#71717a', fontSize: '0.875rem', lineHeight: 1.6 }}>Pushing the boundaries of digital interaction through art and technology.</p>
            </div>
            <div className="footer-links" style={{ marginTop: '2rem' }}>
              <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Platform</h4>
              <ul>
                <li><a href="#">Membership</a></li>
                <li><a href="#">Resources</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-reveal-text">ATHERA</div>

          <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #18181b', paddingTop: '2rem', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#3f3f46' }}>
            <p>©2025 ALL RIGHTS RESERVED</p>
            <p>DESIGNED BY THE GRID</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Athera;