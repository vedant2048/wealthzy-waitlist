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
    12. Reveal-on-scroll
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
   ================================================================= */
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var canHoverTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion;

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
  if(!prefersReducedMotion && heroGlow){
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
    if(healthAnimated || prefersReducedMotion) return;
    var rect = dashEl.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.9){
      healthAnimated = true;
      /* Held back so the number counts up as the card finishes landing */
      setTimeout(function(){ animateCount(healthValueEl, 84, 1200); }, 700);
    }
  }
  if(prefersReducedMotion){
    healthValueEl.textContent = '84';
  } else {
    window.addEventListener('scroll', checkHealth, {passive:true});
    window.addEventListener('load', checkHealth);
    checkHealth();
  }
}

/* =================================================================
   NEW: TRUST STRIP — the one deliberate scroll-triggered moment
   Items stagger in across the divided strip when it enters view.
   ================================================================= */
var trustStrip = document.getElementById('trustStrip');
if(trustStrip){
  if(prefersReducedMotion || !('IntersectionObserver' in window)){
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
   REVEAL-ON-SCROLL
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
