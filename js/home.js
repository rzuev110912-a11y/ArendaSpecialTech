/* Главная: hero-слайдер, популярная техника, калькулятор, объекты, отзывы. */
'use strict';

/* ---------- Hero-слайдер ---------- */
function initHeroSlider() {
  const root = $('.hero-slider');
  if (!root) return;
  const slides = $$('.hero-slide', root);
  const current = $('[data-hero-current]', root);
  const pad = (n) => String(n).padStart(2, '0');
  let index = 0;
  let timer = null;

  $('[data-hero-total]', root).textContent = pad(slides.length);

  // Слайды 2+ грузим после загрузки страницы, чтобы не мешать первому экрану
  const loadSlide = (slide) => {
    const img = $('img[data-srcset]', slide);
    if (!img) return;
    img.srcset = img.dataset.srcset;
    img.removeAttribute('data-srcset');
  };
  window.addEventListener('load', () => setTimeout(() => slides.forEach(loadSlide), 1200));

  const go = (i) => {
    slides[index].classList.remove('is-active');
    slides[index].inert = true;
    index = (i + slides.length) % slides.length;
    loadSlide(slides[index]);
    slides[index].classList.add('is-active');
    slides[index].inert = false;
    current.textContent = pad(index + 1);
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (reducedMotion || timer) return;
    timer = setInterval(() => go(index + 1), 6000);
  };
  const restart = () => { stop(); start(); };

  $('[data-hero="prev"]', root).addEventListener('click', () => { go(index - 1); restart(); });
  $('[data-hero="next"]', root).addEventListener('click', () => { go(index + 1); restart(); });

  // Пауза при наведении, фокусе и скрытой вкладке
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // Свайп
  const frame = $('.hero-slider__frame', root);
  let startX = null;
  frame.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
  frame.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });

  start();
}

/* ---------- Популярная техника: табы + слайдер ---------- */
// Чередуем категории, чтобы во вкладке «Все» не шли подряд одни экскаваторы
function interleaveByCategory(list) {
  const buckets = CATEGORIES.map((c) => list.filter((m) => m.category === c.id));
  const out = [];
  for (let i = 0; out.length < list.length; i++) buckets.forEach((b) => { if (b[i]) out.push(b[i]); });
  return out;
}

function initPopular() {
  const track = $('#popular-track');
  if (!track) return;
  const status = $('#popular-status');
  const tabs = $$('.popular__tabs .tab');
  const scroller = initScroller(track, {
    prev: $('[data-pop="prev"]'),
    next: $('[data-pop="next"]'),
    progress: $('[data-pop="progress"]')
  });

  const render = (filter) => {
    const list = filter === 'all'
      ? interleaveByCategory(MACHINES.filter((m) => m.popular))
      : MACHINES.filter((m) => m.category === filter);
    track.innerHTML = list.map((m) => cardHTML(m)).join('');
    status.textContent = `Показано: ${unitsLabel(list.length)}`;
    scroller.reset();
    if (!reducedMotion) {
      track.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
      render(tab.dataset.filter);
    });
  });

  render('all');
}

/* ---------- Калькулятор аренды ---------- */
const OPERATOR_RATE = { hour: 500, shift: 3800 };
const QTY_LIMITS = {
  hour: { min: 4, max: 200, label: 'Количество часов', unit: 'ч' },
  shift: { min: 1, max: 60, label: 'Количество смен', unit: 'см.' }
};
const TRAWL_FACTOR = 1.5;

// Гусеничную технику возят тралом
const needsTrawl = (m) => m.category === 'bulldozers' || m.specs['Ходовая часть'] === 'гусеничная';

function volumeDiscount(unit, qty) {
  const hours = unit === 'hour' ? qty : qty * SHIFT_HOURS;
  if (hours >= 160) return 0.10;
  if (hours >= 80) return 0.05;
  return 0;
}

function initCalc() {
  const form = $('#calc-form');
  if (!form) return;
  const machineSel = $('#calc-machine');
  const qty = $('#calc-qty');
  const range = $('#calc-qty-range');
  const deliverySel = $('#calc-delivery');
  const lines = $('#calc-lines');
  const total = $('#calc-total');
  const hint = $('#calc-hint');
  let state = null;

  fillMachineSelect(machineSel, { withPlaceholder: false, selected: 'komatsu-pc300' });

  const unit = () => form.elements.unit.value;
  const clamp = (v, { min, max }) => Math.min(max, Math.max(min, Math.round(v) || min));

  const applyLimits = (u) => {
    const lim = QTY_LIMITS[u];
    [qty, range].forEach((el) => { el.min = lim.min; el.max = lim.max; });
    $('#calc-qty-label').textContent = lim.label;
    $('#calc-qty-unit').textContent = lim.unit;
    $('#calc-min').textContent = `${lim.min} ${lim.unit}`;
    $('#calc-max').textContent = `${lim.max} ${lim.unit}`;
  };

  const paintRange = (v) => {
    const { min, max } = QTY_LIMITS[unit()];
    range.style.setProperty('--fill', `${((v - min) / (max - min)) * 100}%`);
  };

  const setQty = (v) => {
    const val = clamp(v, QTY_LIMITS[unit()]);
    qty.value = val;
    range.value = val;
    paintRange(val);
  };

  const unitWord = (u, n) => (u === 'hour'
    ? plural(n, ['час', 'часа', 'часов'])
    : plural(n, ['смена', 'смены', 'смен']));

  const compute = () => {
    const m = getMachine(machineSel.value);
    const u = unit();
    const n = Number(qty.value);
    const withOperator = form.elements.operator.value === 'yes';
    const deliveryBase = Number(deliverySel.value);
    const trawl = needsTrawl(m);

    const rate = u === 'hour' ? m.rentPerHour : m.rentPerShift;
    const rent = rate * n;
    const operator = withOperator ? OPERATOR_RATE[u] * n : 0;
    const discountPct = volumeDiscount(u, n);
    const discount = Math.round((rent + operator) * discountPct);
    const delivery = deliveryBase * (trawl ? TRAWL_FACTOR : 1);
    const sum = rent + operator - discount + delivery;

    const rows = [
      [`Аренда: ${n} ${unitWord(u, n)} × ${rub(rate)}`, rub(rent)],
      withOperator
        ? [`Машинист: ${n} ${unitWord(u, n)} × ${rub(OPERATOR_RATE[u])}`, rub(operator)]
        : ['Машинист', 'не нужен'],
      [trawl ? 'Доставка тралом' : 'Подача на объект', deliveryBase ? rub(delivery) : 'самовывоз']
    ];
    if (discount) rows.push([`Скидка за объём −${discountPct * 100}%`, `−${rub(discount)}`, 'is-discount']);

    lines.innerHTML = rows
      .map(([dt, dd, cls]) => `<div${cls ? ` class="${cls}"` : ''}><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
    total.textContent = rub(sum);
    hint.textContent = (trawl
      ? 'Гусеничная техника перевозится тралом — стоимость доставки ×1,5. '
      : 'Колёсная техника приезжает на объект своим ходом. ')
      + 'Скидка 5% от 80 часов работы, 10% — от 160 часов.';

    state = { m, u, n, withOperator, sum, delivery: deliverySel.selectedOptions[0].textContent.split(' — ')[0] };
  };

  // Переключение часы/смены с пересчётом количества
  let prevUnit = unit();
  form.addEventListener('change', (e) => {
    if (e.target.name === 'unit') {
      const u = unit();
      const n = Number(qty.value);
      applyLimits(u);
      if (u === 'shift' && prevUnit === 'hour') setQty(Math.ceil(n / SHIFT_HOURS));
      else if (u === 'hour' && prevUnit === 'shift') setQty(n * SHIFT_HOURS);
      prevUnit = u;
    }
    if (e.target === qty) setQty(qty.value);
    compute();
  });
  range.addEventListener('input', () => { setQty(range.value); compute(); });
  qty.addEventListener('input', () => {
    const { min, max } = QTY_LIMITS[unit()];
    const v = Number(qty.value);
    if (Number.isInteger(v) && v >= min && v <= max) { range.value = v; paintRange(v); compute(); }
  });
  qty.addEventListener('blur', () => { setQty(qty.value); compute(); });
  form.addEventListener('submit', (e) => e.preventDefault());

  // «Оформить заявку» — переносим расчёт в форму заявки
  $('#calc-order').addEventListener('click', () => {
    const reqForm = $('#request-form');
    if (!reqForm || !state) return;
    const { m, u, n, withOperator, sum, delivery } = state;
    reqForm.elements.machine.value = m.id;
    reqForm.elements.machine.dispatchEvent(new Event('change'));
    reqForm.elements.comment.value = `Расчёт с сайта: ${m.name}, ${n} ${unitWord(u, n)}, `
      + `${withOperator ? 'с машинистом' : 'без машиниста'}, ${delivery.charAt(0).toLowerCase() + delivery.slice(1)} — итого ${rub(sum)}`;
    setTimeout(() => $('#req-name').focus({ preventScroll: true }), 700);
  });

  applyLimits(unit());
  setQty(qty.value);
  compute();
}

/* ---------- Наши объекты: лайтбокс ---------- */
function initObjects() {
  const buttons = $$('[data-object]');
  if (!buttons.length) return;
  const items = buttons.map((btn) => ({
    src: $('img', btn).getAttribute('src'),
    alt: $('img', btn).alt,
    title: $('.object__caption b', btn).textContent,
    text: $('.object__caption span', btn).textContent
  }));
  buttons.forEach((btn, i) => btn.addEventListener('click', () => openLightbox(items, i, btn)));
}

/* ---------- Старт ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initPopular();
  $$('[data-cat-units]').forEach((el) => { el.textContent = unitsLabel(countByCategory(el.dataset.catUnits)); });
  initCalc();
  initObjects();
  const reviews = $('#reviews-track');
  if (reviews) initScroller(reviews, { prev: $('[data-rev="prev"]'), next: $('[data-rev="next"]'), progress: $('[data-rev="progress"]') });
  const reqSelect = $('#req-machine');
  if (reqSelect) fillMachineSelect(reqSelect);
});
