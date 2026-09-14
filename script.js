/* =====================================================================
   WEALTHZY — script.js
   All page behaviour lives here. Loaded at the end of index.html, so the
   DOM already exists when this runs (do not add `defer` — the inline
   onclick handlers in the HTML call these functions by name).

   CONTENTS
     1. Email validation           (isValidEmail, validateField)
     2. Waitlist forms             (handleInlineSubmit, handleModalSubmit)
     3. Waitlist modal             (openWaitlist, closeWaitlist)
     4. Theme switch               (applyTheme, toggleTheme)
     5. Mobile menu                (toggleMobileMenu, open/closeMobileMenu)
     6. Motion preferences
     7. Hero page-load sequence
     8. Scroll: progress bar, nav shadow, hero parallax
     9. 3D tilt (dashboard card only)
    10. Count-up: portfolio health
    11. Trust strip scroll reveal
    12. Brand showcase carousel(s) — 1 on desktop/tablet, 2 on mobile
        (autoplay; hover-to-pause-and-blur is desktop-only)
    13. Reveal-on-scroll
   ===================================================================== */

/* =================================================================
   EMAIL VALIDATION
   Stricter than the browser default: rejects consecutive dots,
   malformed domains, missing TLD and over-length local parts.
   ================================================================= */
function isValidEmail(value){
  var email = value.trim();
  if(email.length === 0 || email.length > 254) return false;
  var pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if(!pattern.test(email)) return false;
  var parts = email.split('@');
  if(parts[0].length > 64) return false;        // local part length cap
  if(email.indexOf('..') !== -1) return false;  // no consecutive dots
  return true;
}

function setFieldError(input, errorEl, show){
  input.classList.toggle('input-error', show);
  input.setAttribute('aria-invalid', show ? 'true' : 'false');
  errorEl.classList.toggle('show', show);
}

function validateField(input, errorEl){
  var valid = isValidEmail(input.value);
  setFieldError(input, errorEl, !valid);
  return valid;
}

/* Hero (inline) form submit */
function handleInlineSubmit(event){
  event.preventDefault();
  var input = document.getElementById('inlineEmail');
  var errorEl = document.getElementById('inlineEmailError');
  if(!validateField(input, errorEl)){ input.focus(); return; }
  input.value = '';
  document.getElementById('inlineSuccessMsg').classList.add('show');
  /* NOTE: wire this up to your email backend / form service to actually store the address */
}

/* Modal form submit */
function handleModalSubmit(event){
  event.preventDefault();
  var input = document.getElementById('modalEmail');
  var errorEl = document.getElementById('modalEmailError');
  if(!validateField(input, errorEl)){ input.focus(); return; }
  document.getElementById('modalFormState').style.display = 'none';
  document.getElementById('modalSuccessState').classList.add('show');
  input.value = '';
  setFieldError(input, errorEl, false);
  /* NOTE: wire this up to your email backend / form service to actually store the address */
}

/* Clear the error live as soon as the input becomes valid */
['modalEmail','inlineEmail'].forEach(function(id){
  var input = document.getElementById(id);
  var errorEl = document.getElementById(id + 'Error');
  input.addEventListener('input', function(){
    if(errorEl.classList.contains('show') && isValidEmail(input.value)){
      setFieldError(input, errorEl, false);
    }
  });
});

/* =================================================================
   WAITLIST MODAL — open / close (X, backdrop, Escape)
   ================================================================= */
var modal = document.getElementById('waitlistModal');
var modalFormState = document.getElementById('modalFormState');
var modalSuccessState = document.getElementById('modalSuccessState');

function openWaitlist(){
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  requestAnimationFrame(function(){ modal.classList.add('visible'); });
  modalFormState.style.display = 'block';
  modalSuccessState.classList.remove('show');
  setTimeout(function(){
    var el = document.getElementById('modalEmail');
    if(el) el.focus();
  }, 250);
}

function closeWaitlist(){
  modal.classList.remove('visible');
  document.body.classList.remove('modal-open');
  setTimeout(function(){ modal.classList.remove('open'); }, 250);
}

modal.addEventListener('click', function(event){
  if(event.target === modal) closeWaitlist();   // backdrop click
});
document.addEventListener('keydown', function(event){
  if(event.key === 'Escape' && modal.classList.contains('open')) closeWaitlist();
});

/* =================================================================
   THEME SWITCH (dark <-> light)
   State lives in a JS variable only — no localStorage/sessionStorage,
   so it resets to dark on reload. Only colors change, so the tilt,
   parallax, scroll progress, coin and reveal logic are untouched.
   ================================================================= */
var currentTheme = 'dark';
var themeToggleBtn = document.getElementById('themeToggle');
var themeToggleMobileBtn = document.getElementById('themeToggleMobile');
var themeIconSun = document.getElementById('themeIconSun');
var themeIconMoon = document.getElementById('themeIconMoon');
var themeIconSunMobile = document.getElementById('themeIconSunMobile');
var themeIconMoonMobile = document.getElementById('themeIconMoonMobile');
var themeToggleLabel = document.getElementById('themeToggleLabel');

function applyTheme(theme){
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  var goingToLight = (theme === 'dark');          // what the button will do next
  var label = goingToLight ? 'Switch to light mode' : 'Switch to dark mode';

  /* Sun icon while dark (click = go light), moon icon while light */
  if(themeIconSun)  themeIconSun.style.display  = goingToLight ? 'block' : 'none';
  if(themeIconMoon) themeIconMoon.style.display = goingToLight ? 'none'  : 'block';
  if(themeIconSunMobile)  themeIconSunMobile.style.display  = goingToLight ? 'block' : 'none';
  if(themeIconMoonMobile) themeIconMoonMobile.style.display = goingToLight ? 'none'  : 'block';

  if(themeToggleBtn){
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.setAttribute('title', label);
  }
  if(themeToggleMobileBtn) themeToggleMobileBtn.setAttribute('aria-label', label);
  if(themeToggleLabel) themeToggleLabel.textContent = goingToLight ? 'Light mode' : 'Dark mode';
}

function toggleTheme(){
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

/* Dark is the default brand presentation */
applyTheme('dark');

/* =================================================================
   MOBILE MENU
   ================================================================= */
var mobileMenu = document.getElementById('mobileMenu');
var menuToggle = document.getElementById('menuToggle');
var menuIconOpen = document.getElementById('menuIconOpen');
var menuIconClose = document.getElementById('menuIconClose');

function toggleMobileMenu(){
  var isOpen = mobileMenu.style.display === 'flex';
  isOpen ? closeMobileMenu() : openMobileMenu();
}
function openMobileMenu(){
  mobileMenu.style.display = 'flex';
  menuIconOpen.style.display = 'none';
  menuIconClose.style.display = 'block';
  menuToggle.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu(){
  mobileMenu.style.display = 'none';
  menuIconOpen.style.display = 'block';
  menuIconClose.style.display = 'none';
  menuToggle.setAttribute('aria-expanded', 'false');
}
/* Close the mobile menu if resized up to desktop width */
window.addEventListener('resize', function(){
  if(window.innerWidth >= 880) closeMobileMenu();
});

/* =================================================================
   MOTION PREFERENCES
   Animations always run at full motion, regardless of the OS/browser
   prefers-reduced-motion setting — intentionally not read here.
   ================================================================= */
var canHoverTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* =================================================================
   NEW: HERO PAGE-LOAD SEQUENCE
   Adds .loaded, which starts the staggered hero animation. Runs once.
   ================================================================= */
function startHeroSequence(){ document.body.classList.add('loaded'); }
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ requestAnimationFrame(startHeroSequence); });
} else {
  requestAnimationFrame(startHeroSequence);
}

/* =================================================================
   SCROLL: progress bar + nav shadow + parallax on hero glow
   (throttled with requestAnimationFrame)
   ================================================================= */
var scrollProgressEl = document.getElementById('scrollProgress');
var navbarEl = document.getElementById('navbar');
var heroGlow = document.querySelector('.hero-glow');
var scrollTicking = false;

function updateOnScroll(){
  var scrollY = window.scrollY || window.pageYOffset;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
  if(scrollProgressEl) scrollProgressEl.style.width = pct + '%';
  if(navbarEl) navbarEl.classList.toggle('scrolled', scrollY > 20);
  if(heroGlow){
    heroGlow.style.transform = 'translateX(-50%) translateY(' + (scrollY * 0.16) + 'px)';
  }
  scrollTicking = false;
}
window.addEventListener('scroll', function(){
  if(!scrollTicking){ requestAnimationFrame(updateOnScroll); scrollTicking = true; }
}, { passive:true });
updateOnScroll();

/* =================================================================
   3D TILT ON HOVER — dashboard card only (desktop / precise pointer)
   ================================================================= */
function attachTilt(el, maxDeg, scaleTo){
  if(!el) return;
  el.addEventListener('mousemove', function(e){
    var rect = el.getBoundingClientRect();
    var relX = (e.clientX - rect.left) / rect.width;
    var relY = (e.clientY - rect.top) / rect.height;
    var rotateY = (relX - 0.5) * (maxDeg * 2);
    var rotateX = (0.5 - relY) * (maxDeg * 2);
    el.style.transition = 'transform .08s linear';
    el.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(' + scaleTo + ')';
  });
  el.addEventListener('mouseleave', function(){
    el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}
if(canHoverTilt){
  attachTilt(document.getElementById('dashTilt'), 5, 1.01);
}

/* =================================================================
   COUNT-UP: hero "portfolio health" stat (fires when in view)
   ================================================================= */
function animateCount(el, target, duration){
  var start = null;
  function step(ts){
    if(!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

var dashEl = document.getElementById('dash');
var healthValueEl = document.getElementById('healthValue');
if(dashEl && healthValueEl){
  var healthAnimated = false;
  function checkHealth(){
    if(healthAnimated) return;
    var rect = dashEl.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.9){
      healthAnimated = true;
      /* Held back so the number counts up as the card finishes landing */
      setTimeout(function(){ animateCount(healthValueEl, 84, 1200); }, 700);
    }
  }
  window.addEventListener('scroll', checkHealth, {passive:true});
  window.addEventListener('load', checkHealth);
  checkHealth();
}

/* =================================================================
   NEW: TRUST STRIP — the one deliberate scroll-triggered moment
   Items stagger in across the divided strip when it enters view.
   ================================================================= */
var trustStrip = document.getElementById('trustStrip');
if(trustStrip){
  if(!('IntersectionObserver' in window)){
    trustStrip.classList.add('in');
  } else {
    var stripObserver = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold:0.2 });
    stripObserver.observe(trustStrip);
  }
}

/* =================================================================
   BRAND SHOWCASE CAROUSEL(S)
   initCarousel() drives one carousel instance — crossfading its own
   slides every 5s. Three instances run on the page, no two ever
   stacked together:
     - #bannerSlider           desktop/tablet, all 5 images (top section,
                               right after "How it works")
     - #bannerSliderMobileA    mobile only, pg1/pg3/pg5 — swaps into that
                               SAME top section/slot in place of #bannerSlider
     - #bannerSliderMobileB    mobile only, pg2/pg4, in its own separate
                               section between Trust and the final CTA,
                               started 2.5s later so it's never mid-change
                               in sync with #bannerSliderMobileA
   `visibleQuery` stops an instance's timer while its breakpoint content
   is display:none (see .banner-desktop / .banner-mobile-top /
   .banner-mobile-section in styles.css), so a hidden carousel doesn't
   keep ticking in the background.
   `hoverPauseQuery` is passed only for the desktop instance: hovering,
   or keyboard-focusing an arrow/dot, pauses its timer and adds
   body.banner-focus (blurs the rest of the page — see styles.css) so
   the showcase reads as the focal point. It's intentionally left off
   the mobile instances — on a touch screen a tap fires a synthetic
   hover with no matching "leave" event, so hover-to-pause would get
   stuck on forever and the carousel would never advance again.
   ================================================================= */
function initCarousel(frame, opts){
  if(!frame) return;
  opts = opts || {};

  var slides = Array.prototype.slice.call(frame.querySelectorAll('.banner-slide'));
  var dots = Array.prototype.slice.call(frame.querySelectorAll('.banner-dot'));
  var prevBtn = frame.querySelector('.banner-arrow.prev');
  var nextBtn = frame.querySelector('.banner-arrow.next');
  if(slides.length < 2) return;

  var current = 0;
  var timer = null;
  var DELAY = 5000;

  var visibleMQ = opts.visibleQuery ? window.matchMedia(opts.visibleQuery) : null;
  var hoverPauseMQ = opts.hoverPauseQuery ? window.matchMedia(opts.hoverPauseQuery) : null;

  function isVisible(){ return !visibleMQ || visibleMQ.matches; }
  function hoverPauseEnabled(){ return !!hoverPauseMQ && hoverPauseMQ.matches; }

  function goTo(index){
    var nextIndex = (index + slides.length) % slides.length;
    if(nextIndex === current) return;
    var prevIndex = current;

    slides[prevIndex].classList.remove('is-active');
    slides[prevIndex].classList.add('is-prev');
    slides[nextIndex].classList.remove('is-prev');
    slides[nextIndex].classList.add('is-active');

    if(dots[prevIndex]){ dots[prevIndex].classList.remove('is-active'); dots[prevIndex].setAttribute('aria-selected', 'false'); }
    if(dots[nextIndex]){ dots[nextIndex].classList.add('is-active'); dots[nextIndex].setAttribute('aria-selected', 'true'); }

    current = nextIndex;
    /* Clears the outgoing slide's "slide out to the left" position once
       its fade has finished, so it's ready to enter from the right next time. */
    setTimeout(function(){ slides[prevIndex].classList.remove('is-prev'); }, 950);
  }

  function nextSlide(){ goTo(current + 1); }
  function prevSlide(){ goTo(current - 1); }

  function stopAutoplay(){
    if(timer){ clearInterval(timer); clearTimeout(timer); timer = null; }
  }
  function startAutoplay(){
    stopAutoplay();
    if(!isVisible()) return;
    timer = setInterval(nextSlide, DELAY);
  }
  /* Only used for the very first kickoff, to desync opts.startDelay ms
     from whatever else is running (e.g. the other mobile carousel). */
  function kickoff(){
    stopAutoplay();
    if(!isVisible()) return;
    if(opts.startDelay){
      timer = setTimeout(function(){ nextSlide(); startAutoplay(); }, opts.startDelay);
    } else {
      startAutoplay();
    }
  }

  dots.forEach(function(dot, i){
    dot.addEventListener('click', function(){ goTo(i); startAutoplay(); });
  });
  if(nextBtn) nextBtn.addEventListener('click', function(){ nextSlide(); startAutoplay(); });
  if(prevBtn) prevBtn.addEventListener('click', function(){ prevSlide(); startAutoplay(); });

  function enterFocus(){
    if(!hoverPauseEnabled()) return;
    stopAutoplay();
    document.body.classList.add('banner-focus');
  }
  function exitFocus(){
    document.body.classList.remove('banner-focus');
    startAutoplay();
  }

  frame.addEventListener('mouseenter', enterFocus);
  frame.addEventListener('mouseleave', exitFocus);
  frame.addEventListener('focusin', enterFocus);
  frame.addEventListener('focusout', function(event){
    if(frame.contains(event.relatedTarget)) return;  // focus moved within the frame — stay paused
    exitFocus();
  });

  /* Don't pile up slide changes while the tab is in the background */
  document.addEventListener('visibilitychange', function(){
    if(document.hidden) stopAutoplay();
    else if(!document.body.classList.contains('banner-focus')) startAutoplay();
  });

  /* Crossing a breakpoint hides/shows this instance's group — start 
     stop its timer to match, and always drop any stuck hover-pause. */
  if(visibleMQ){
    var onVisibleChange = function(){
      exitFocus();
      startAutoplay();
    };
    if(visibleMQ.addEventListener) visibleMQ.addEventListener('change', onVisibleChange);
    else if(visibleMQ.addListener) visibleMQ.addListener(onVisibleChange); // older Safari
  }
  if(hoverPauseMQ){
    var onHoverPauseChange = function(e){ if(!e.matches) exitFocus(); };
    if(hoverPauseMQ.addEventListener) hoverPauseMQ.addEventListener('change', onHoverPauseChange);
    else if(hoverPauseMQ.addListener) hoverPauseMQ.addListener(onHoverPauseChange);
  }

  kickoff();
}

initCarousel(document.getElementById('bannerSlider'), {
  visibleQuery: '(min-width: 641px)',
  hoverPauseQuery: '(min-width: 1025px)'
});
initCarousel(document.getElementById('bannerSliderMobileA'), {
  visibleQuery: '(max-width: 640px)'
});
initCarousel(document.getElementById('bannerSliderMobileB'), {
  visibleQuery: '(max-width: 640px)',
  startDelay: 2500
});

/* =================================================================
   REVEAL-ON-SCROLL new 
   feature with motion
   
   ================================================================= */
function revealElements(){
  document.querySelectorAll('.reveal').forEach(function(el){
    var rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.92){
      el.classList.add('show');
    }
  });
}
window.addEventListener('scroll', revealElements, {passive:true});
window.addEventListener('load', revealElements);
revealElements();
