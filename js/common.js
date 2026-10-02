/* Общий код для всех страниц: шапка, модалки, формы, маска телефона,
   появление при скролле, рендер карточки техники и слайдеры. */
'use strict';

const SHIFT_HOURS = 8;

/* ---------- Утилиты ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const formatNumber = (n) => Math.round(n).toLocaleString('ru-RU');
const rub = (n) => `${formatNumber(n)} ₽`;
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="img/icons.svg#${id}"></use></svg>`;
const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
const getMachine = (id) => MACHINES.find((m) => m.id === id);
const smallImage = (src) => src.replace('-960.webp', '-480.webp');
const thumbImage = (src) => src.replace('-960.webp', '-240.webp');
const imageSrcset = (src) => ['480', '640', '720'].map((w) => `${src.replace('-960.webp', `-${w}.webp`)} ${w}w`).concat(`${src} 960w`).join(', ');
const countByCategory = (catId) => MACHINES.filter((m) => m.category === catId).length;
// «16 т» не должно разрываться на две строки
const nbsp = (text) => text.replace(/(\d) (?=(т|м³|м|л\.с\.)(?![А-Яа-яЁё]))/g, '$1 ');

/* Склонение: plural(5, ['единица', 'единицы', 'единиц']) */
function plural(n, forms) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}
const unitsLabel = (n) => `${n} ${plural(n, ['единица', 'единицы', 'единиц'])}`;

/* ---------- Карточка техники ---------- */
function cardHTML(m, { mode = 'rent', lazy = true } = {}) {
  const cat = getCategory(m.category);
  const specs = Object.entries(m.specs).slice(0, 4)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const small = smallImage(m.image);
  const url = `machine.html?id=${m.id}`;

  const prices = mode === 'buy'
    ? `<p class="card__price-main"><small>Цена</small> ${rub(m.buyPrice)}</p>
       <p class="card__price-sub">Аренда от <b>${rub(m.rentPerHour)}/час</b></p>`
    : `<p class="card__price-main"><small>Аренда от</small> ${rub(m.rentPerHour)}/час</p>
       <p class="card__price-sub">Купить от <b>${rub(m.buyPrice)}</b></p>`;

  const action = mode === 'buy'
    ? `<button class="btn" type="button" data-request="buy" data-id="${m.id}">Купить</button>`
    : `<button class="btn" type="button" data-request="rent" data-id="${m.id}">Арендовать</button>`;

  return `
    <article class="card">
      <div class="card__media">
        <img src="${small}" srcset="${imageSrcset(m.image)}"
             sizes="(max-width: 575px) 88vw, (max-width: 991px) 46vw, 400px"
             width="480" height="330" ${lazy ? 'loading="lazy"' : ''} decoding="async" alt="${m.name}">
        <span class="plate card__badge">${cat.name}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title"><a href="${url}">${nbsp(m.name)}</a></h3>
        <dl class="card__specs">${specs}</dl>
        <div class="card__prices">${prices}</div>
        <div class="card__actions">
          ${action}
          <a class="btn btn--dark" href="${url}" aria-label="Подробнее: ${m.name}">Подробнее</a>
        </div>
      </div>
    </article>`;
}

/* Выпадающий список техники, сгруппированный по категориям */
function fillMachineSelect(select, { withPlaceholder = true, selected = '' } = {}) {
  const groups = CATEGORIES.map((c) => {
    const opts = MACHINES.filter((m) => m.category === c.id)
      .map((m) => `<option value="${m.id}"${m.id === selected ? ' selected' : ''}>${m.name}</option>`).join('');
    return `<optgroup label="${c.name}">${opts}</optgroup>`;
  }).join('');
  select.innerHTML = (withPlaceholder ? '<option value="">Выберите технику</option>' : '') + groups;
}

/* ---------- Блокировка прокрутки ---------- */
let lockCount = 0;
function lockScroll() {
  if (lockCount++ === 0) {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw ? `${sbw}px` : '';
    document.documentElement.classList.add('is-locked');
  }
}
function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('is-locked');
    document.body.style.paddingRight = '';
  }
}

/* Удержание фокуса внутри контейнера */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const items = $$(FOCUSABLE, container).filter((el) => el.getClientRects().length > 0);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------- Шапка: липкость, бургер, каталог ---------- */
function initHeader() {
  const header = $('.header');
  if (!header) return;

  // Тень у прилипшей навигации
  const top = $('.header__top');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > top.offsetHeight);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Количество единиц в выпадающем меню каталога
  $$('[data-cat-count]').forEach((el) => { el.textContent = `${countByCategory(el.dataset.catCount)} ед.`; });

  // Бургер-меню
  const nav = $('#site-nav');
  const burger = $('.burger');
  const backdrop = $('.nav-backdrop');
  const mqMobile = window.matchMedia('(max-width: 991px)');

  const openNav = () => {
    nav.classList.add('is-open');
    backdrop.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    lockScroll();
    setTimeout(() => $('.nav__close', nav).focus(), 50);
  };
  const closeNav = (restoreFocus = true) => {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    unlockScroll();
    if (restoreFocus) burger.focus();
  };
  burger.addEventListener('click', openNav);
  $('.nav__close', nav).addEventListener('click', () => closeNav());
  backdrop.addEventListener('click', () => closeNav());
  nav.addEventListener('keydown', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeNav();
    trapFocus(nav, e);
  });
  // Переход по ссылке внутри меню закрывает панель
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a[href]') && nav.classList.contains('is-open')) closeNav(false);
  });
  mqMobile.addEventListener('change', () => { if (!mqMobile.matches) closeNav(false); });

  // Выпадающий каталог
  const dd = $('.catalog-dd');
  if (dd) {
    const btn = $('.catalog-dd__btn', dd);
    const setOpen = (open) => {
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(!dd.classList.contains('is-open')));
    dd.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dd.classList.contains('is-open')) { e.stopPropagation(); setOpen(false); btn.focus(); }
    });
    document.addEventListener('click', (e) => { if (!mqMobile.matches && !dd.contains(e.target)) setOpen(false); });
    dd.addEventListener('focusout', (e) => { if (!mqMobile.matches && e.relatedTarget && !dd.contains(e.relatedTarget)) setOpen(false); });
    // Наведение открывает меню на десктопе с мышью
    const canHover = window.matchMedia('(hover: hover) and (min-width: 992px)');
    let hoverTimer;
    dd.addEventListener('mouseenter', () => { if (canHover.matches) { clearTimeout(hoverTimer); setOpen(true); } });
    dd.addEventListener('mouseleave', () => { if (canHover.matches) hoverTimer = setTimeout(() => setOpen(false), 180); });
  }
}

/* ---------- Модальные окна ---------- */
const fieldHTML = ({ id, name, label, type = 'text', required = true, placeholder = '', autocomplete = '', extra = '' }) => `
  <div class="field">
    <label class="field__label" for="${id}">${label}${required ? ' <b aria-hidden="true">*</b>' : ''}</label>
    <input class="input" id="${id}" name="${name}" type="${type}" placeholder="${placeholder}"
      ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${required ? 'required' : ''} ${extra}
      aria-describedby="${id}-error">
    <p class="field__error" id="${id}-error" aria-live="polite"></p>
  </div>`;

const consentHTML = (id) => `
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" name="consent" id="${id}" required checked aria-describedby="${id}-error">
      <span class="checkbox__box">${icon('i-check')}</span>
      <span>Согласен на обработку персональных данных согласно <a href="#" data-policy>политике конфиденциальности</a></span>
    </label>
    <p class="field__error" id="${id}-error" aria-live="polite"></p>
  </div>`;

function injectModals() {
  const html = `
  <div class="modal" id="modal-callback" hidden>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-callback-title">
      <button class="modal__close" type="button" data-close aria-label="Закрыть окно">${icon('i-close')}</button>
      <h2 class="modal__title" id="modal-callback-title">Заказать звонок</h2>
      <p class="modal__text">Оставьте номер — менеджер перезвонит в течение 15 минут и подберёт технику под вашу задачу.</p>
      <form class="form" data-validate novalidate>
        <input type="hidden" name="form" value="Обратный звонок">
        ${fieldHTML({ id: 'cb-name', name: 'name', label: 'Ваше имя', placeholder: 'Иван', autocomplete: 'name' })}
        ${fieldHTML({ id: 'cb-phone', name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', autocomplete: 'tel', extra: 'inputmode="tel"' })}
        ${consentHTML('cb-consent')}
        <button class="btn btn--lg btn--block" type="submit">Жду звонка</button>
      </form>
    </div>
  </div>

  <div class="modal" id="modal-request" hidden>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-request-title">
      <button class="modal__close" type="button" data-close aria-label="Закрыть окно">${icon('i-close')}</button>
      <h2 class="modal__title" id="modal-request-title">Заявка на аренду</h2>
      <p class="modal__text" data-request-text>Заполните форму — пришлём расчёт и договор.</p>
      <div class="modal__machine" data-request-machine hidden></div>
      <form class="form" data-validate novalidate>
        <input type="hidden" name="form" value="Заявка">
        <input type="hidden" name="mode" value="rent">
        <input type="hidden" name="machine" value="">
        ${fieldHTML({ id: 'rq-name', name: 'name', label: 'Ваше имя', placeholder: 'Иван', autocomplete: 'name' })}
        ${fieldHTML({ id: 'rq-phone', name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', autocomplete: 'tel', extra: 'inputmode="tel"' })}
        <div class="field">
          <label class="field__label" for="rq-comment">Комментарий</label>
          <textarea class="textarea" id="rq-comment" name="comment" rows="3" placeholder="Адрес объекта, даты, объём работ"></textarea>
        </div>
        ${consentHTML('rq-consent')}
        <button class="btn btn--lg btn--block" type="submit">Отправить заявку</button>
      </form>
    </div>
  </div>

  <div class="modal modal--thanks" id="modal-thanks" hidden>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-thanks-title" aria-describedby="modal-thanks-text">
      <button class="modal__close" type="button" data-close aria-label="Закрыть окно">${icon('i-close')}</button>
      <div class="thanks__icon">${icon('i-check')}</div>
      <h2 class="modal__title" id="modal-thanks-title">Спасибо!</h2>
      <p class="modal__text" id="modal-thanks-text">Заявка принята. Перезвоним <b>за 15 минут</b>.</p>
      <button class="btn btn--block" type="button" data-close>Хорошо</button>
    </div>
  </div>

  <div class="modal modal--lightbox" id="modal-lightbox" hidden>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-label="Просмотр фото">
      <button class="modal__close" type="button" data-close aria-label="Закрыть просмотр">${icon('i-close')}</button>
      <figure class="lightbox__figure">
        <img alt="" width="1100" height="740">
        <figcaption><b></b><span></span></figcaption>
      </figure>
      <div class="lightbox__nav">
        <button class="arrow-btn" type="button" data-lb="prev" aria-label="Предыдущее фото">${icon('i-arrow-left')}</button>
        <button class="arrow-btn" type="button" data-lb="next" aria-label="Следующее фото">${icon('i-arrow-right')}</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

let activeModal = null;
let modalOpener = null;

function openModal(id, opener) {
  const modal = document.getElementById(id);
  if (!modal) return;
  if (activeModal) closeModal({ chained: true });
  else modalOpener = opener || document.activeElement;

  modal.hidden = false;
  // даём браузеру применить display, чтобы сработала анимация появления
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
  activeModal = modal;
  lockScroll();
  setTimeout(() => {
    const target = $('input:not([type="hidden"]), textarea, select', modal)
      || $('[data-close]:not(.modal__close)', modal) || $('.modal__close', modal);
    target?.focus();
  }, 60);
}

function closeModal({ chained = false } = {}) {
  if (!activeModal) return;
  const modal = activeModal;
  modal.classList.remove('is-open');
  activeModal = null;
  unlockScroll();
  setTimeout(() => { if (!modal.classList.contains('is-open')) modal.hidden = true; }, 260);
  if (chained) return;
  if (modalOpener && document.contains(modalOpener)) modalOpener.focus();
  modalOpener = null;
}

function initModals() {
  injectModals();

  document.addEventListener('click', (e) => {
    const cb = e.target.closest('[data-modal="callback"]');
    if (cb) { e.preventDefault(); openModal('modal-callback', cb); return; }

    const req = e.target.closest('[data-request]');
    if (req) { e.preventDefault(); openRequest(req.dataset.request, req.dataset.id, req); return; }

    if (e.target.closest('[data-policy]')) { e.preventDefault(); return; }

    if (activeModal && (e.target.closest('[data-close]') || e.target === activeModal)) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!activeModal) return;
    if (e.key === 'Escape') { closeModal(); return; }
    trapFocus(activeModal, e);
  });

  initLightboxControls();
}

/* Модалка заявки: аренда или покупка конкретной техники */
function openRequest(mode = 'rent', machineId, opener) {
  const modal = $('#modal-request');
  const m = machineId ? getMachine(machineId) : null;
  const isBuy = mode === 'buy';
  $('#modal-request-title').textContent = isBuy ? 'Заявка на покупку' : 'Заявка на аренду';
  $('[data-request-text]', modal).textContent = isBuy
    ? 'Подготовим коммерческое предложение, условия лизинга и организуем осмотр техники.'
    : 'Уточним даты и адрес объекта, пришлём расчёт и договор.';
  const form = $('form', modal);
  form.elements.mode.value = mode;
  form.elements.machine.value = m ? m.name : '';
  form.elements.form.value = isBuy ? 'Покупка техники' : 'Аренда техники';

  const box = $('[data-request-machine]', modal);
  if (m) {
    box.innerHTML = `<img src="${thumbImage(m.image)}" alt="" width="88" height="60">
      <div><b>${m.name}</b><span>${isBuy ? rub(m.buyPrice) : `от ${rub(m.rentPerHour)}/час`}</span></div>`;
    box.hidden = false;
  } else {
    box.hidden = true;
  }
  openModal('modal-request', opener);
}

/* ---------- Лайтбокс ---------- */
let lbItems = [];
let lbIndex = 0;

function openLightbox(items, index, opener) {
  lbItems = items;
  lbIndex = index;
  renderLightbox();
  $$('#modal-lightbox [data-lb]').forEach((b) => { b.hidden = items.length < 2; });
  openModal('modal-lightbox', opener);
}
function renderLightbox() {
  const item = lbItems[lbIndex];
  const modal = $('#modal-lightbox');
  const img = $('img', modal);
  img.src = item.src;
  img.alt = item.alt || item.title || '';
  $('figcaption b', modal).textContent = item.title || '';
  $('figcaption span', modal).textContent = item.text || `${lbIndex + 1} / ${lbItems.length}`;
}
function stepLightbox(dir) {
  if (lbItems.length < 2) return;
  lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
  renderLightbox();
}
function initLightboxControls() {
  const modal = $('#modal-lightbox');
  modal.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]');
    if (b) stepLightbox(b.dataset.lb === 'next' ? 1 : -1);
  });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });
}

/* ---------- Маска телефона ---------- */
/* Разделители добавляются только перед следующей цифрой — поэтому Backspace стирает цифры, а не упирается в скобки */
function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (!d) return '';
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  const r = d.slice(1, 11);
  let out = '+7';
  if (r.length > 0) out += ' (' + r.slice(0, 3);
  if (r.length >= 4) out += ') ' + r.slice(3, 6);
  if (r.length >= 7) out += '-' + r.slice(6, 8);
  if (r.length >= 9) out += '-' + r.slice(8, 10);
  return out;
}
const phoneDigits = (value) => value.replace(/\D/g, '');

function initPhoneMask(root = document) {
  $$('input[type="tel"]', root).forEach((input) => {
    if (input.dataset.masked) return;
    input.dataset.masked = '1';
    input.addEventListener('input', () => { input.value = formatPhone(input.value); });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => { if (phoneDigits(input.value).length <= 1) input.value = ''; });
  });
}

/* ---------- Валидация форм ---------- */
const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s\-']+$/;

function validateField(el) {
  if (el.type === 'hidden' || el.disabled) return '';
  if (el.type === 'checkbox') return el.required && !el.checked ? 'Нужно согласие на обработку данных' : '';
  const value = el.value.trim();
  if (el.required && !value) return el.tagName === 'SELECT' ? 'Выберите технику из списка' : 'Заполните это поле';
  if (!value) return '';
  if (el.type === 'tel' && phoneDigits(value).length !== 11) return 'Введите номер полностью: +7 (XXX) XXX-XX-XX';
  if (el.name === 'name' && !NAME_RE.test(value)) return 'Имя — минимум 2 буквы';
  return '';
}

function showFieldError(el, message) {
  const field = el.closest('.field');
  if (!field) return;
  field.classList.toggle('is-invalid', Boolean(message));
  if (message) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  const err = $('.field__error', field);
  if (err) err.textContent = message;
}

function initForms(root = document) {
  $$('form[data-validate]', root).forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    const controls = () => $$('input:not([type="hidden"]), select, textarea', form);

    controls().forEach((el) => {
      const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        if (el.closest('.field')?.classList.contains('is-invalid')) showFieldError(el, validateField(el));
      });
      el.addEventListener('blur', () => {
        if (form.dataset.touched) showFieldError(el, validateField(el));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.dataset.touched = '1';
      let firstInvalid = null;
      controls().forEach((el) => {
        const msg = validateField(el);
        showFieldError(el, msg);
        if (msg && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Бэкенда нет — имитируем отправку
      const btn = $('button[type="submit"]', form);
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = label;
        form.reset();
        delete form.dataset.touched;
        controls().forEach((el) => showFieldError(el, ''));
        form.dispatchEvent(new CustomEvent('form:sent'));
        openModal('modal-thanks', btn);
      }, 700);
    });
  });
}

/* ---------- Появление при скролле и счётчики ---------- */
function animateCount(el) {
  const target = Number(el.dataset.count);
  if (reducedMotion) { el.textContent = formatNumber(target); return; }
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = formatNumber(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initReveal(root = document) {
  const items = $$('.reveal:not(.is-visible)', root);
  const counters = $$('[data-count]', root);
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    counters.forEach((el) => { el.textContent = formatNumber(Number(el.dataset.count)); });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.count) animateCount(el); else el.classList.add('is-visible');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
  counters.forEach((el) => io.observe(el));
}

/* ---------- Горизонтальный слайдер (scroll-snap + стрелки) ---------- */
function initScroller(track, { prev, next, progress } = {}) {
  const step = () => {
    const first = track.firstElementChild;
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
    if (progress) {
      const ratio = track.clientWidth / track.scrollWidth;
      progress.style.width = `${Math.min(100, ratio * 100)}%`;
      progress.style.transform = `translateX(${(track.scrollLeft / track.clientWidth) * 100}%)`;
      progress.parentElement.style.visibility = ratio >= 0.999 ? 'hidden' : '';
    }
  };
  let raf;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  prev?.addEventListener('click', () => track.scrollBy({ left: -step() }));
  next?.addEventListener('click', () => track.scrollBy({ left: step() }));
  update();
  return { update, reset: () => { track.scrollTo({ left: 0, behavior: 'auto' }); update(); } };
}

/* ---------- Старт ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initModals();
  initPhoneMask();
  initForms();
  initReveal();
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
});
