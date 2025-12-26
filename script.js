/**
 * 121watts.com — VOLTAGE Interactions
 * Electrical effects and power-on reveals
 */

(function() {
  'use strict';

  // Respect reduced motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // POWER-ON REVEAL ANIMATIONS
  // ============================================
  
  function initPowerOnReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.power-on').forEach(el => {
        el.classList.add('powered');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('powered');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.1
      }
    );

    document.querySelectorAll('.power-on').forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================
  // CURSOR ELECTRICAL TRAIL (Desktop Only)
  // ============================================
  
  function initCursorTrail() {
    if (prefersReducedMotion) return;
    if ('ontouchstart' in window) return; // Skip on touch devices

    const canvas = document.getElementById('cursor-trail');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isMoving = false;
    let moveTimeout;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);

      // Only spawn particles when moving fast enough
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 5 && particles.length < 30) {
        particles.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 2 + 1
        });
      }
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter(p => p.life > 0);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        p.size *= 0.98;

        const alpha = p.life * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 247, ${alpha})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 247, ${alpha * 0.3})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ============================================
  // WATTS METER FLUCTUATION
  // ============================================
  
  function initWattsMeter() {
    if (prefersReducedMotion) return;

    const meter = document.querySelector('.watts-meter');
    if (!meter) return;

    const baseWatts = 121;
    
    function updateMeter() {
      const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newWatts = baseWatts + fluctuation;
      meter.textContent = newWatts + 'W';
    }

    setInterval(updateMeter, 2000);
  }

  // ============================================
  // INITIAL GLITCH BURST ON LOAD
  // ============================================
  
  function initLoadGlitch() {
    if (prefersReducedMotion) return;

    const glitchElements = document.querySelectorAll('.glitch-text');
    
    // Trigger a more intense glitch on page load
    glitchElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('glitch-burst');
        setTimeout(() => {
          el.classList.remove('glitch-burst');
        }, 300);
      }, index * 100);
    });
  }

  // ============================================
  // TRANSMISSION TYPING EFFECT (Optional Enhancement)
  // ============================================
  
  function initTransmissionEffects() {
    if (prefersReducedMotion) return;

    const transmissions = document.querySelectorAll('.transmission');
    
    transmissions.forEach(transmission => {
      transmission.addEventListener('mouseenter', () => {
        const signal = transmission.querySelector('.transmission-signal');
        if (signal) {
          signal.style.animation = 'none';
          signal.offsetHeight; // Trigger reflow
          signal.style.animation = 'signal-sweep 0.5s ease-out';
        }
      });
    });
  }

  // ============================================
  // BENTO CELL ELECTRICAL PULSE
  // ============================================
  
  function initBentoCells() {
    if (prefersReducedMotion) return;

    const cells = document.querySelectorAll('.bento-cell');
    
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        // Quick flash effect
        cell.style.transition = 'none';
        cell.style.boxShadow = '0 0 40px rgba(0, 255, 247, 0.3), inset 0 0 40px rgba(0, 255, 247, 0.1)';
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cell.style.transition = 'box-shadow 0.3s ease-out';
            cell.style.boxShadow = '';
          });
        });
      });
    });
  }

  // ============================================
  // BUTTON CHARGE-UP EFFECT
  // ============================================
  
  function initButtonEffects() {
    if (prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        // Add subtle "charging" vibration
        btn.style.animation = 'btn-charge 0.1s ease-in-out 2';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.animation = '';
      });
    });
  }

  // ============================================
  // DYNAMIC STYLES FOR GLITCH BURST
  // ============================================
  
  function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .glitch-burst::before {
        animation: glitch-burst-before 0.3s linear !important;
        opacity: 0.8 !important;
      }
      
      .glitch-burst::after {
        animation: glitch-burst-after 0.3s linear !important;
        opacity: 0.8 !important;
      }
      
      @keyframes glitch-burst-before {
        0% { transform: translate(3px, -3px); opacity: 1; }
        20% { transform: translate(-3px, 3px); opacity: 0.8; }
        40% { transform: translate(3px, -1px); opacity: 1; }
        60% { transform: translate(-1px, 2px); opacity: 0.6; }
        80% { transform: translate(2px, -2px); opacity: 0.9; }
        100% { transform: translate(0); opacity: 0; }
      }
      
      @keyframes glitch-burst-after {
        0% { transform: translate(-3px, 3px); opacity: 1; }
        20% { transform: translate(3px, -3px); opacity: 0.6; }
        40% { transform: translate(-1px, 2px); opacity: 1; }
        60% { transform: translate(2px, -1px); opacity: 0.8; }
        80% { transform: translate(-2px, 1px); opacity: 0.7; }
        100% { transform: translate(0); opacity: 0; }
      }
      
      @keyframes signal-sweep {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 1; }
      }
      
      @keyframes btn-charge {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-1px); }
        75% { transform: translateX(1px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    addDynamicStyles();
    initPowerOnReveals();
    initCursorTrail();
    initWattsMeter();
    initBentoCells();
    initButtonEffects();
    initTransmissionEffects();
    
    // Delay the load glitch slightly for effect
    setTimeout(initLoadGlitch, 200);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
