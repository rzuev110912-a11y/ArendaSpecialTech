/* Карточка техники: machine.html?id=<id из data.js> */
'use strict';

const CATEGORY_TEXT = {
  excavators: [
    'Экскаватор подходит для рытья котлованов и траншей, планировки участков, демонтажа и погрузки грунта в самосвалы.',
    'По запросу комплектуем гидромолотом, планировочным или скальным ковшом. Машинист со стажем от 7 лет, техника проходит ТО каждые 250 моточасов.'
  ],
  cranes: [
    'Автокран для монтажа металлоконструкций, ЖБИ и инженерного оборудования, погрузочно-разгрузочных работ на стройке и складе.',
    'Выезжаем с опытным крановщиком и стропальщиком, при необходимости готовим ППР. Кран зарегистрирован в Ростехнадзоре.'
  ],
  'dump-trucks': [
    'Самосвал для вывоза грунта и строительного мусора, доставки песка, щебня и асфальта на объект.',
    'Работаем в связке с нашими экскаваторами и погрузчиками — один договор на всю технику. Пропуска в центр Москвы оформляем сами.'
  ],
  loaders: [
    'Погрузчик для погрузки сыпучих материалов, уборки снега, планировки площадок и перемещения грузов на объекте.',
    'Доступны сменные рабочие органы: вилы, щётка, отвал, ковш повышенной ёмкости.'
  ],
  bulldozers: [
    'Бульдозер для планировки и выравнивания участков, срезки растительного слоя, засыпки траншей и рыхления мёрзлого грунта.',
    'Доставляем тралом, организуем сопровождение. Машинисты имеют опыт работы на дорожном строительстве.'
  ],
  manipulators: [
    'Манипулятор объединяет бортовой грузовик и кран: сам погрузит, перевезёт и разгрузит блоки, трубы, контейнеры и оборудование.',
    'Работаем по городу и области, водитель-оператор имеет допуск к работе с КМУ.'
  ]
};

const RENT_TERMS = [
  { icon: 'i-clock', title: 'Минимальный заказ — 4 часа', text: 'Плюс 1 час на подачу техники. Смена — 8 часов работы.' },
  { icon: 'i-headset', title: 'Машинист по запросу', text: 'Опытный оператор — 500 ₽/час или 3 800 ₽ за смену.' },
  { icon: 'i-truck-fast', title: 'Подача от 2 часов', text: 'Колёсная техника едет своим ходом, гусеничная — на трале.' },
  { icon: 'i-docs', title: 'Договор и закрывающие', text: 'Путевые листы, акты, УПД. Работаем с НДС и без.' },
  { icon: 'i-shield', title: 'Замена при поломке', text: 'Если техника вышла из строя — пришлём замену за 4 часа.' }
];

function renderNotFound(root) {
  $('#machine-title').textContent = 'Техника не найдена';
  document.title = 'Техника не найдена | LOGOTYPE';
  $('#machine-top').hidden = true;
  root.innerHTML = `
    <div class="container not-found">
      <p>Возможно, машина уже продана или ссылка устарела. Посмотрите похожие предложения в каталоге.</p>
      <a class="btn btn--lg" href="catalog.html">Перейти в каталог</a>
    </div>`;
}

function renderMachine(root, m) {
  const cat = getCategory(m.category);
  const specs = Object.entries(m.specs);
  const keySpecs = specs.slice(0, 4);
  const year = m.specs['Год выпуска'];

  // Заголовки, крошки, мета
  $('#machine-title').textContent = nbsp(m.name);
  document.title = `${m.name} — аренда от ${formatNumber(m.rentPerHour)} ₽/час | LOGOTYPE`;
  $('meta[name="description"]').setAttribute('content',
    `${m.name}: аренда от ${formatNumber(m.rentPerHour)} ₽/час, продажа ${formatNumber(m.buyPrice)} ₽. ${keySpecs.map(([k, v]) => `${k} — ${v}`).join(', ')}.`);
  $('#machine-crumbs').insertAdjacentHTML('beforeend', `
    <li><a href="catalog.html?cat=${cat.id}">${cat.name}</a></li>
    <li><span aria-current="page">${m.name}</span></li>`);

  const thumbs = m.gallery.map((src, i) => `
    <button class="gallery__thumb" type="button" data-thumb="${i}" aria-label="Фото ${i + 1} из ${m.gallery.length}" aria-current="${i === 0}">
      <img src="${thumbImage(src)}" width="240" height="165" alt="" loading="lazy" decoding="async">
    </button>`).join('');

  const similar = MACHINES.filter((x) => x.category === m.category && x.id !== m.id);
  // Если в категории мало машин — добавляем популярные из других
  if (similar.length < 3) similar.push(...MACHINES.filter((x) => x.popular && x.category !== m.category).slice(0, 4 - similar.length));

  // Каркас галереи и главное фото уже есть в HTML — дополняем его
  const img = $('#gallery-img');
  if (!img.getAttribute('src')) { img.srcset = imageSrcset(m.gallery[0]); img.src = m.gallery[0]; }
  img.alt = `${m.name} — фото 1`;
  $('.gallery__main').insertAdjacentHTML('beforeend', `
    <button class="gallery__zoom" type="button" aria-label="Открыть фото на весь экран">${icon('i-zoom')}</button>
    <div class="gallery__nav">
      <button class="arrow-btn" type="button" data-g="prev" aria-label="Предыдущее фото">${icon('i-arrow-left')}</button>
      <button class="arrow-btn" type="button" data-g="next" aria-label="Следующее фото">${icon('i-arrow-right')}</button>
    </div>`);
  $('#gallery-thumbs').innerHTML = thumbs;

  $('#machine-info').innerHTML = `
    <div class="machine__meta">
      <a class="plate" href="catalog.html?cat=${cat.id}">${cat.name}</a>
      <span class="status">В наличии на базе</span>
    </div>

    <div class="price-box">
      <dl>
        <div class="price-box__row"><dt>Аренда, 1 час</dt><dd>${rub(m.rentPerHour)}</dd></div>
        <div class="price-box__row"><dt>Аренда, смена (${SHIFT_HOURS} ч)</dt><dd>${rub(m.rentPerShift)}</dd></div>
        <div class="price-box__row price-box__row--buy"><dt>Продажа${year ? `, ${year} г.` : ''}</dt><dd>${rub(m.buyPrice)}</dd></div>
      </dl>
      <div class="price-box__actions">
        <button class="btn btn--lg" type="button" data-request="rent" data-id="${m.id}">Арендовать</button>
        <button class="btn btn--light btn--lg" type="button" data-request="buy" data-id="${m.id}">Купить</button>
      </div>
    </div>

    <dl class="key-specs">
      ${keySpecs.map(([k, v]) => `<div class="key-spec"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>

    <p class="machine__call">Нужна консультация по технике? <a href="tel:+70000000000">+7 (000) 000-00-00</a></p>`;

  root.innerHTML = `
    <section class="machine-details" aria-label="Подробности">
      <div class="container machine-details__grid">
        <div class="reveal">
          <h2>Характеристики</h2>
          <dl class="spec-table">
            <div><dt>Категория</dt><dd>${cat.name}</dd></div>
            ${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
            <div><dt>Состояние</dt><dd>отличное, ТО пройдено</dd></div>
            <div><dt>Местонахождение</dt><dd>Химки, база LOGOTYPE</dd></div>
          </dl>
          <div class="machine__desc">${CATEGORY_TEXT[m.category].map((p) => `<p>${p}</p>`).join('')}</div>
        </div>
        <div class="reveal" data-delay="1">
          <h2>Условия аренды</h2>
          <ul class="terms">
            ${RENT_TERMS.map((t) => `<li>${icon(t.icon)}<div><b>${t.title}</b><span>${t.text}</span></div></li>`).join('')}
          </ul>
        </div>
      </div>
    </section>

    <section class="section section--light similar" aria-labelledby="similar-title">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" id="similar-title">Похожая техника</h2>
          <div class="arrows">
            <button class="arrow-btn" type="button" data-sim="prev" aria-label="Предыдущие карточки" aria-controls="similar-track">${icon('i-arrow-left')}</button>
            <button class="arrow-btn" type="button" data-sim="next" aria-label="Следующие карточки" aria-controls="similar-track">${icon('i-arrow-right')}</button>
          </div>
        </div>
        <div class="scroller" id="similar-track">${similar.map((x) => cardHTML(x)).join('')}</div>
        <div class="scroller-progress" aria-hidden="true"><span data-sim="progress"></span></div>
      </div>
    </section>`;

  initGallery(m);
  initScroller($('#similar-track'), { prev: $('[data-sim="prev"]'), next: $('[data-sim="next"]'), progress: $('[data-sim="progress"]') });
  initReveal(root);
}

function initGallery(m) {
  const img = $('#gallery-img');
  const thumbs = $$('[data-thumb]');
  let index = 0;

  const show = (i) => {
    index = (i + m.gallery.length) % m.gallery.length;
    img.srcset = imageSrcset(m.gallery[index]);
    img.src = m.gallery[index];
    img.alt = `${m.name} — фото ${index + 1}`;
    thumbs.forEach((t, n) => t.setAttribute('aria-current', String(n === index)));
  };

  thumbs.forEach((t) => t.addEventListener('click', () => show(Number(t.dataset.thumb))));
  $('[data-g="prev"]').addEventListener('click', () => show(index - 1));
  $('[data-g="next"]').addEventListener('click', () => show(index + 1));

  const items = m.gallery.map((src, i) => ({ src, alt: `${m.name} — фото ${i + 1}`, title: m.name, text: `Фото ${i + 1} из ${m.gallery.length}` }));
  $('.gallery__zoom').addEventListener('click', (e) => openLightbox(items, index, e.currentTarget));

  // Свайп по главному фото
  const main = $('.gallery__main');
  let startX = null;
  main.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
  main.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = $('#machine-root');
  const m = getMachine(new URLSearchParams(location.search).get('id'));
  if (m) renderMachine(root, m); else renderNotFound(root);
  root.classList.add('is-ready');
});
