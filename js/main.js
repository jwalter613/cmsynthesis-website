/**
 * CMS Alpine — main.js
 * Minimal, purposeful JS. No frameworks. No bloat.
 *
 * Responsibilities:
 * 1. Mobile nav toggle
 * 2. Active nav link highlighting based on current page
 * 3. Smooth-scroll for in-page anchor links
 * 4. Subtle scroll-reveal for sections (Intersection Observer)
 * 5. Notify form feedback
 * 6. Typewriter label animation on hero (single run, on load)
 */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. Mobile nav toggle
  -------------------------------------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks  = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);

      // Animate the two toggle bars into an X
      const bars = navToggle.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(5px) rotate(45deg)';
        bars[1].style.transform = 'translateY(-5px) rotate(-45deg)';
        if (bars[2]) bars[2].style.opacity = '0';
      } else {
        bars[0].style.transform = '';
        bars[1].style.transform = '';
        if (bars[2]) bars[2].style.opacity = '';
      }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const bars = navToggle.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.transform = '';
        if (bars[2]) bars[2].style.opacity = '';
      });
    });
  }

  /* --------------------------------------------------------
     2. Active nav link — mark current page
  -------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --------------------------------------------------------
     3. Smooth scroll — catch all in-page hash links
     (CSS scroll-behavior handles most cases; this is a
     fallback for browsers that don't support it and for
     links that need offset compensation for the fixed nav)
  -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 56;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* --------------------------------------------------------
     4. Scroll-reveal — fade + lift sections into view
     Uses IntersectionObserver with a single reusable class.
     Elements with class "reveal" start hidden and animate
     in when they cross the viewport threshold.
  -------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const revealStyle = document.createElement('style');
    revealStyle.textContent = [
      '.reveal {',
      '  opacity: 0;',
      '  transform: translateY(16px);',
      '  transition: opacity 0.55s ease, transform 0.55s ease;',
      '}',
      '.reveal.revealed {',
      '  opacity: 1;',
      '  transform: translateY(0);',
      '}'
    ].join('\n');
    document.head.appendChild(revealStyle);

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Apply to sections and key blocks (excluding nav, hero headline)
    document.querySelectorAll(
      '.pillar, .feature-block, .specs-section, .team-member, ' +
      '.story-section > *, .principles-list li, .gallery-grid > *'
    ).forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });

    // Stagger pillar reveals
    document.querySelectorAll('.pillar').forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.1) + 's';
    });

    // Stagger team member reveals
    document.querySelectorAll('.team-member').forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.06) + 's';
    });
  }

  /* --------------------------------------------------------
     5. Notify form — client-side feedback only
     (No backend. Captures the email, shows confirmation,
     prevents actual submit. Backend can be wired later.)
  -------------------------------------------------------- */
  document.querySelectorAll('.notify-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('.notify-form__input');
      const btn   = form.querySelector('.notify-form__btn');
      const email = input ? input.value.trim() : '';

      if (!email || !email.includes('@')) {
        if (input) {
          input.style.borderColor = 'var(--accent)';
          input.focus();
          setTimeout(function () { input.style.borderColor = ''; }, 1500);
        }
        return;
      }

      // Confirmation state
      if (btn) {
        btn.textContent = 'Noted.';
        btn.style.backgroundColor = '#1a4a1a';
        btn.style.borderColor     = '#1a4a1a';
        btn.disabled = true;
      }

      if (input) {
        input.value = '';
        input.disabled = true;
        input.placeholder = 'We\'ll be in touch.';
      }

      // Log to console — replace with actual API call when ready
      console.log('[CMS Alpine] Notify signup:', email);
    });
  });

  /* --------------------------------------------------------
     6. Hero label typewriter effect (index.html only)
     Runs once on load. Restores the text character by
     character. Does nothing if the element isn't present.
  -------------------------------------------------------- */
  const heroLabel = document.querySelector('.hero__label--type');
  if (heroLabel) {
    const fullText = heroLabel.dataset.text || heroLabel.textContent.trim();
    heroLabel.textContent = '';
    heroLabel.style.visibility = 'visible';

    let i = 0;
    const interval = setInterval(function () {
      if (i < fullText.length) {
        heroLabel.textContent += fullText.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 55);
  }

  /* --------------------------------------------------------
     Nav border on scroll — adds a slightly more visible
     border when the user has scrolled away from the top.
  -------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 10) {
            nav.style.borderBottomColor = 'var(--border)';
          } else {
            nav.style.borderBottomColor = 'transparent';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

})();
