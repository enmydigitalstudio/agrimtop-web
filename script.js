(() => {
  'use strict';
  const phone = '18094785823';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú de navegación');
    nav?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });

  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      const serviceSelect = document.getElementById('client-service');
      if (serviceSelect) serviceSelect.value = link.dataset.service;
    });
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());

  const form = document.getElementById('quote-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get('nombre') ?? '').trim();
    const service = String(values.get('servicio') ?? '').trim();
    const contact = String(values.get('telefono') ?? '').trim();
    const location = String(values.get('ubicacion') ?? '').trim();
    const details = String(values.get('detalles') ?? '').trim();
    if (!name || !service) return;
    const message = [
      'Hola, AGRIMTOP. Me gustaría solicitar una cotización.',
      '',
      `*Nombre:* ${name}`,
      `*Servicio:* ${service}`,
      ...(contact ? [`*Teléfono:* ${contact}`] : []),
      ...(location ? [`*Ubicación del terreno:* ${location}`] : []),
      ...(details ? [`*Detalles:* ${details}`] : []),
      '',
      'Mensaje enviado desde la página web de AGRIMTOP.'
    ].join('\n');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const popup = window.open(url, '_blank');
    const feedback = form.querySelector('.form-feedback');
    if (popup) popup.opener = null;
    if (!popup) {
      if (feedback) {
        feedback.hidden = false;
        feedback.replaceChildren();
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = 'Abrir WhatsApp para enviar mi solicitud ↗';
        feedback.append('El navegador bloqueó la pestaña. ', anchor);
      }
    } else if (feedback) {
      feedback.hidden = false;
      feedback.textContent = 'Se abrió WhatsApp. Revisa y envía tu mensaje para completar la solicitud.';
    }
  });

  // Progressive enhancement: without dialog support, the local image link still works.
  const galleryDialog = document.getElementById('gallery-dialog');
  if (galleryDialog && typeof galleryDialog.showModal === 'function') {
    const galleryImage = document.getElementById('gallery-dialog-image');
    const galleryTitle = document.getElementById('gallery-dialog-title');
    const galleryNote = document.getElementById('gallery-dialog-note');
    let galleryTrigger = null;
    let backdropPointer = false;

    document.querySelectorAll('[data-gallery]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        galleryTrigger = link;
        const thumbnail = link.querySelector('img');
        galleryImage.src = link.getAttribute('href');
        galleryImage.alt = thumbnail.alt;
        galleryTitle.textContent = link.dataset.title;
        galleryNote.textContent = link.dataset.note;
        galleryDialog.showModal();
        document.body.classList.add('gallery-opened');
      });
    });

    galleryDialog.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
    const isOutsidePanel = event => {
      const bounds = galleryDialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
    };
    galleryDialog.addEventListener('pointerdown', event => {
      backdropPointer = event.target === galleryDialog && isOutsidePanel(event);
    });
    galleryDialog.addEventListener('click', event => {
      if (backdropPointer && event.target === galleryDialog && isOutsidePanel(event)) galleryDialog.close();
      backdropPointer = false;
    });
    galleryDialog.addEventListener('close', () => {
      document.body.classList.remove('gallery-opened');
      galleryImage.removeAttribute('src');
      galleryImage.alt = '';
      galleryTrigger?.focus({ preventScroll: true });
      galleryTrigger = null;
    });
  }


  // On small screens, content and input controls take priority over the floating link.
  const floatingWhatsApp = document.querySelector('.whatsapp-float');
  const mobileLayout = window.matchMedia('(max-width: 800px)');
  if (floatingWhatsApp) {
    const protectedElements = [...document.querySelectorAll(
      'h1, h2, h3, p, a, button, input, select, textarea, label, figcaption, .hero-meta, .hero-photo-label, .ribbon-grid, .about-values, .notice-inner, .service-diagram, .gallery-image, .hero-photo-wrap, .footer-bottom, .contact-links'
    )].filter(element => element !== floatingWhatsApp && !floatingWhatsApp.contains(element));
    let floatingUpdate = 0;
    const updateFloatingLink = () => {
      floatingUpdate = 0;
      let obstructing = false;
      if (mobileLayout.matches) {
        const bounds = floatingWhatsApp.getBoundingClientRect();
        const overlaps = rect => rect.width > 0 && rect.height > 0 &&
          rect.right > bounds.left - 8 && rect.left < bounds.right + 8 &&
          rect.bottom > bounds.top - 8 && rect.top < bounds.bottom + 8;
        const quoteBounds = form?.getBoundingClientRect();
        obstructing = document.body.classList.contains('menu-open') ||
          document.body.classList.contains('gallery-opened') ||
          (quoteBounds && quoteBounds.bottom > 0 && quoteBounds.top < window.innerHeight) ||
          protectedElements.some(element => overlaps(element.getBoundingClientRect()));
      }
      floatingWhatsApp.classList.toggle('is-obstructing', Boolean(obstructing));
      if (obstructing) {
        floatingWhatsApp.setAttribute('aria-hidden', 'true');
        floatingWhatsApp.setAttribute('tabindex', '-1');
      } else {
        floatingWhatsApp.removeAttribute('aria-hidden');
        floatingWhatsApp.removeAttribute('tabindex');
      }
    };
    const scheduleFloatingUpdate = () => {
      if (!floatingUpdate) floatingUpdate = window.requestAnimationFrame(updateFloatingLink);
    };
    window.addEventListener('scroll', scheduleFloatingUpdate, { passive: true });
    window.addEventListener('resize', scheduleFloatingUpdate);
    window.visualViewport?.addEventListener('resize', scheduleFloatingUpdate);
    document.addEventListener('focusin', scheduleFloatingUpdate);
    document.addEventListener('focusout', scheduleFloatingUpdate);
    document.addEventListener('load', scheduleFloatingUpdate, true);
    new MutationObserver(scheduleFloatingUpdate).observe(document.body, {
      attributes: true, attributeFilter: ['class']
    });
    mobileLayout.addEventListener('change', scheduleFloatingUpdate);
    document.fonts?.ready.then(scheduleFloatingUpdate);
    scheduleFloatingUpdate();
  }

  const navigationLayout = window.matchMedia('(max-width: 800px)');
  navigationLayout.addEventListener('change', closeMenu);
  menuButton?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && menuButton.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      nav?.querySelector('a')?.focus();
    }
  });


  // Complete diagrams remain visible without JavaScript or when motion is reduced.
  const surveyFigures = [...document.querySelectorAll('[data-survey-animation]')];
  const surveyReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const surveySeen = new WeakSet();
  const playSurvey = (figure, requested = false) => {
    figure.classList.remove('is-playing', 'is-paused');
    const status = figure.querySelector('.survey-status');
    status.textContent = '';
    figure.dataset.replayed = String(requested);
    if (surveyReducedMotion.matches || document.hidden) {
      figure.dataset.animationState = 'complete';
      if (requested) status.textContent = 'Esquema completo. La animación está desactivada por la preferencia de movimiento reducido.';
      return;
    }
    // Reset only this illustration, so repeat works even while it is playing.
    void figure.querySelector('svg').getBoundingClientRect();
    figure.dataset.animationState = 'playing';
    figure.classList.add('is-playing');
  };
  surveyFigures.forEach(figure => {
    const button = figure.querySelector('.survey-replay');
    button.hidden = false;
    button.addEventListener('click', () => {
      surveySeen.add(figure);
      playSurvey(figure, true);
    });
    figure.addEventListener('animationend', event => {
      if (!event.target.hasAttribute('data-animation-end')) return;
      figure.classList.remove('is-playing', 'is-paused');
      figure.dataset.animationState = 'complete';
      if (figure.dataset.replayed === 'true') {
        figure.querySelector('.survey-status').textContent = 'Animación terminada. Esquema completo.';
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const surveyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const figure = entry.target;
        const visible = entry.isIntersecting && entry.intersectionRatio >= .35;
        figure.dataset.inView = String(visible);
        if (visible && !surveySeen.has(figure)) {
          surveySeen.add(figure);
          playSurvey(figure);
        }
        figure.classList.toggle('is-paused', figure.classList.contains('is-playing') && (!visible || document.hidden));
      });
    }, { threshold: [0, .35] });
    surveyFigures.forEach(figure => surveyObserver.observe(figure));
  }
  document.addEventListener('visibilitychange', () => {
    surveyFigures.forEach(figure => figure.classList.toggle('is-paused',
      figure.classList.contains('is-playing') && (document.hidden || figure.dataset.inView === 'false')));
  });
  surveyReducedMotion.addEventListener('change', () => {
    if (surveyReducedMotion.matches) {
      surveyFigures.forEach(figure => {
        figure.classList.remove('is-playing', 'is-paused');
        figure.dataset.animationState = 'complete';
      });
    }
  });

})();
