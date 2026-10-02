/* Каталог: фильтры по категории, цене и грузоподъёмности, аренда/продажа, сортировка.
   Состояние фильтров хранится в URL, поэтому ссылкой на подборку можно поделиться. */
'use strict';

const CAPACITY_RULES = {
  any: () => true,
  lt5: (c) => c !== null && c < 5,
  '5-20': (c) => c !== null && c >= 5 && c <= 20,
  '20-40': (c) => c !== null && c > 20 && c <= 40,
  gt40: (c) => c !== null && c > 40
};

const priceOf = (m, mode) => (mode === 'buy' ? m.buyPrice : m.rentPerHour);

const SORTERS = {
  popular: () => (a, b) => Number(b.popular) - Number(a.popular),
  'price-asc': (mode) => (a, b) => priceOf(a, mode) - priceOf(b, mode),
  'price-desc': (mode) => (a, b) => priceOf(b, mode) - priceOf(a, mode),
  name: () => (a, b) => a.name.localeCompare(b.name, 'ru')
};

function initCatalog() {
  const form = $('#filters-form');
  if (!form) return;
  const grid = $('#catalog-grid');
  const empty = $('#catalog-empty');
  const sortSel = $('#sort');
  const priceMin = form.elements.priceMin;
  const priceMax = form.elements.priceMax;

  $('#filter-cats').innerHTML = CATEGORIES.map((c) => `
    <label class="checkbox">
      <input type="checkbox" name="cat" value="${c.id}">
      <span class="checkbox__box">${icon('i-check')}</span>
      <span>${c.name}</span><span class="count">${countByCategory(c.id)}</span>
    </label>`).join('');

  /* Восстанавливаем фильтры из адресной строки */
  const params = new URLSearchParams(location.search);
  const urlCats = (params.get('cat') || '').split(',').filter(Boolean);
  $$('input[name="cat"]', form).forEach((i) => { i.checked = urlCats.includes(i.value); });
  if (params.get('mode') === 'buy') form.elements.mode.value = 'buy';
  if (CAPACITY_RULES[params.get('cap')]) form.elements.cap.value = params.get('cap');
  if (params.get('min')) priceMin.value = params.get('min');
  if (params.get('max')) priceMax.value = params.get('max');
  if (SORTERS[params.get('sort')]) sortSel.value = params.get('sort');

  const readNumber = (input) => (input.value === '' ? null : Number(input.value));
  const getState = () => ({
    mode: form.elements.mode.value,
    cats: $$('input[name="cat"]:checked', form).map((i) => i.value),
    cap: form.elements.cap.value,
    min: readNumber(priceMin),
    max: readNumber(priceMax),
    sort: sortSel.value
  });

  const render = () => {
    const s = getState();
    const list = MACHINES
      .filter((m) => (!s.cats.length || s.cats.includes(m.category))
        && CAPACITY_RULES[s.cap](m.capacity)
        && (s.min === null || priceOf(m, s.mode) >= s.min)
        && (s.max === null || priceOf(m, s.mode) <= s.max))
      .sort(SORTERS[s.sort](s.mode));

    grid.innerHTML = list.map((m, i) => cardHTML(m, { mode: s.mode, lazy: i > 2 })).join('');
    grid.hidden = !list.length;
    empty.hidden = list.length > 0;
    $('#catalog-count').textContent = list.length;
    $('#catalog-count-label').textContent = plural(list.length, ['единица техники', 'единицы техники', 'единиц техники']);
    $('.filters__apply').textContent = list.length ? `Показать ${unitsLabel(list.length)}` : 'Ничего не найдено';

    // Подсказка по диапазону цен для выбранного режима и категорий
    const isBuy = s.mode === 'buy';
    const unit = isBuy ? '₽' : '₽/час';
    const pool = MACHINES.filter((m) => !s.cats.length || s.cats.includes(m.category)).map((m) => priceOf(m, s.mode));
    const lo = Math.min(...pool), hi = Math.max(...pool);
    $('[data-price-unit]').textContent = unit;
    $('#price-hint').textContent = `${isBuy ? 'Продажа' : 'Аренда'}: от ${formatNumber(lo)} до ${formatNumber(hi)} ${unit}`;
    priceMin.placeholder = `от ${formatNumber(lo)}`;
    priceMax.placeholder = `до ${formatNumber(hi)}`;
    [priceMin, priceMax].forEach((el) => { el.step = isBuy ? 100000 : 100; });

    // Заголовки и крошки под выбранную категорию
    const single = s.cats.length === 1 ? getCategory(s.cats[0]) : null;
    const heading = single ? single.name : 'Каталог спецтехники';
    $('#catalog-title').textContent = heading;
    $('#crumb-current').textContent = single ? single.name : 'Каталог техники';
    $('#catalog-lead').textContent = single
      ? `${single.text}. ${isBuy ? 'Продажа с гарантией и помощью в лизинге.' : 'Аренда с машинистом, подача от 2 часов.'}`
      : 'Аренда с машинистом и продажа. Отфильтруйте технику по типу, цене и грузоподъёмности.';
    document.title = `${heading} — ${isBuy ? 'продажа' : 'аренда'} | LOGOTYPE`;
    $$('[data-nav-mode]').forEach((a) => {
      if (a.dataset.navMode === s.mode) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    // Синхронизация с адресной строкой
    const q = new URLSearchParams();
    if (s.cats.length) q.set('cat', s.cats.join(','));
    if (isBuy) q.set('mode', 'buy');
    if (s.cap !== 'any') q.set('cap', s.cap);
    if (s.min !== null) q.set('min', s.min);
    if (s.max !== null) q.set('max', s.max);
    if (s.sort !== 'popular') q.set('sort', s.sort);
    const qs = q.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'mode') { priceMin.value = ''; priceMax.value = ''; }
    if (e.target === priceMin || e.target === priceMax) return; // цены обрабатываются по input
    render();
  });
  let priceTimer;
  [priceMin, priceMax].forEach((el) => el.addEventListener('input', () => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(render, 350);
  }));
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => { sortSel.value = 'popular'; setTimeout(render); });
  sortSel.addEventListener('change', render);
  $('[data-reset]').addEventListener('click', () => form.reset());

  initFiltersDrawer();
  render();
}

/* Фильтры на планшете и телефоне — выезжающая панель */
function initFiltersDrawer() {
  const panel = $('#filters');
  const toggle = $('.filters-toggle');
  const backdrop = $('.nav-backdrop--filters');
  const mq = window.matchMedia('(max-width: 991px)');
  const isOpen = () => panel.classList.contains('is-open');

  const open = () => {
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    lockScroll();
    setTimeout(() => $('.filters__close button', panel).focus(), 50);
  };
  const close = (restoreFocus = true) => {
    if (!isOpen()) return;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    unlockScroll();
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', open);
  $$('[data-filters-close]').forEach((el) => el.addEventListener('click', () => close()));
  panel.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    trapFocus(panel, e);
  });
  mq.addEventListener('change', () => { if (!mq.matches) close(false); });
}

document.addEventListener('DOMContentLoaded', initCatalog);
