/* Справочник техники. Цены в рублях, смена = 8 часов.
   image — основное фото 960px; рядом лежит версия -480.webp для srcset.
   capacity — грузоподъёмность, т (null — параметр не применим, например у экскаватора). */

const CATEGORIES = [
  { id: 'excavators',   name: 'Экскаваторы',  icon: 'i-excavator',   text: 'Гусеничные и колёсные, от 17 до 32 т' },
  { id: 'cranes',       name: 'Автокраны',    icon: 'i-crane',       text: 'Грузоподъёмность от 16 до 60 т' },
  { id: 'dump-trucks',  name: 'Самосвалы',    icon: 'i-dump',        text: 'Кузов от 16 до 22 м³, 6×4 и 8×4' },
  { id: 'loaders',      name: 'Погрузчики',   icon: 'i-loader',      text: 'Фронтальные и мини-погрузчики' },
  { id: 'bulldozers',   name: 'Бульдозеры',   icon: 'i-bulldozer',   text: 'Тяговый класс от 10 до 25 т' },
  { id: 'manipulators', name: 'Манипуляторы', icon: 'i-manipulator', text: 'Борт с КМУ от 5 до 10 т' }
];

const MACHINES = [
  /* ---------- Экскаваторы ---------- */
  {
    id: 'komatsu-pc300', name: 'Гусеничный экскаватор Komatsu PC300-8', category: 'excavators',
    image: 'img/machines/komatsu-pc300-960.webp',
    gallery: ['img/machines/komatsu-pc300-960.webp', 'img/machines/komatsu-pc220-960.webp', 'img/machines/hyundai-r300-960.webp'],
    specs: { 'Эксплуатационная масса': '31,5 т', 'Объём ковша': '1,6 м³', 'Глубина копания': '7,4 м', 'Мощность двигателя': '242 л.с.', 'Радиус копания': '11,1 м', 'Ходовая часть': 'гусеничная', 'Год выпуска': '2021' },
    rentPerHour: 3200, rentPerShift: 24000, buyPrice: 14900000, capacity: null, popular: true
  },
  {
    id: 'doosan-dx300', name: 'Гусеничный экскаватор Doosan DX300LCA', category: 'excavators',
    image: 'img/machines/doosan-dx300-960.webp',
    gallery: ['img/machines/doosan-dx300-960.webp', 'img/machines/volvo-ec220-960.webp', 'img/machines/komatsu-pc300-960.webp'],
    specs: { 'Эксплуатационная масса': '30 т', 'Объём ковша': '1,4 м³', 'Глубина копания': '7,3 м', 'Мощность двигателя': '202 л.с.', 'Радиус копания': '10,8 м', 'Ходовая часть': 'гусеничная', 'Год выпуска': '2020' },
    rentPerHour: 2900, rentPerShift: 22000, buyPrice: 12400000, capacity: null, popular: true
  },
  {
    id: 'volvo-ec220', name: 'Гусеничный экскаватор Volvo EC220DL', category: 'excavators',
    image: 'img/machines/volvo-ec220-960.webp',
    gallery: ['img/machines/volvo-ec220-960.webp', 'img/machines/doosan-dx300-960.webp', 'img/machines/komatsu-pc220-960.webp'],
    specs: { 'Эксплуатационная масса': '22,5 т', 'Объём ковша': '1,2 м³', 'Глубина копания': '6,7 м', 'Мощность двигателя': '174 л.с.', 'Радиус копания': '9,9 м', 'Ходовая часть': 'гусеничная', 'Год выпуска': '2019' },
    rentPerHour: 2500, rentPerShift: 19000, buyPrice: 9800000, capacity: null, popular: false
  },
  {
    id: 'hyundai-r300', name: 'Гусеничный экскаватор Hyundai R300LC-9S', category: 'excavators',
    image: 'img/machines/hyundai-r300-960.webp',
    gallery: ['img/machines/hyundai-r300-960.webp', 'img/machines/komatsu-pc300-960.webp', 'img/machines/volvo-ec220-960.webp'],
    specs: { 'Эксплуатационная масса': '30,1 т', 'Объём ковша': '1,5 м³', 'Глубина копания': '7,2 м', 'Мощность двигателя': '246 л.с.', 'Радиус копания': '10,9 м', 'Ходовая часть': 'гусеничная', 'Год выпуска': '2018' },
    rentPerHour: 2700, rentPerShift: 20500, buyPrice: 8900000, capacity: null, popular: false
  },
  {
    id: 'hyundai-r170w', name: 'Колёсный экскаватор Hyundai R170W-9S', category: 'excavators',
    image: 'img/machines/hyundai-r170w-960.webp',
    gallery: ['img/machines/hyundai-r170w-960.webp', 'img/machines/liebherr-a918-960.webp', 'img/machines/doosan-dx300-960.webp'],
    specs: { 'Эксплуатационная масса': '17,5 т', 'Объём ковша': '0,8 м³', 'Глубина копания': '5,8 м', 'Мощность двигателя': '150 л.с.', 'Радиус копания': '9,1 м', 'Ходовая часть': 'колёсная', 'Год выпуска': '2020' },
    rentPerHour: 2100, rentPerShift: 16000, buyPrice: 7600000, capacity: null, popular: true
  },
  {
    id: 'liebherr-a918', name: 'Колёсный экскаватор Liebherr A 918 Compact', category: 'excavators',
    image: 'img/machines/liebherr-a918-960.webp',
    gallery: ['img/machines/liebherr-a918-960.webp', 'img/machines/hyundai-r170w-960.webp', 'img/machines/hyundai-r300-960.webp'],
    specs: { 'Эксплуатационная масса': '19 т', 'Объём ковша': '0,9 м³', 'Глубина копания': '5,4 м', 'Мощность двигателя': '156 л.с.', 'Радиус копания': '8,9 м', 'Ходовая часть': 'колёсная', 'Год выпуска': '2019' },
    rentPerHour: 2400, rentPerShift: 18000, buyPrice: 11200000, capacity: null, popular: false
  },
  {
    id: 'komatsu-pc220', name: 'Гусеничный экскаватор Komatsu PC220-8', category: 'excavators',
    image: 'img/machines/komatsu-pc220-960.webp',
    gallery: ['img/machines/komatsu-pc220-960.webp', 'img/machines/komatsu-pc300-960.webp', 'img/machines/volvo-ec220-960.webp'],
    specs: { 'Эксплуатационная масса': '22,9 т', 'Объём ковша': '1,2 м³', 'Глубина копания': '6,9 м', 'Мощность двигателя': '168 л.с.', 'Радиус копания': '10,2 м', 'Ходовая часть': 'гусеничная', 'Год выпуска': '2017' },
    rentPerHour: 2300, rentPerShift: 17500, buyPrice: 7200000, capacity: null, popular: false
  },

  /* ---------- Автокраны ---------- */
  {
    id: 'ivanovets-16', name: 'Автокран Ивановец КС-35714К-3, 16 т', category: 'cranes',
    image: 'img/machines/ivanovets-16-960.webp',
    gallery: ['img/machines/ivanovets-16-960.webp', 'img/machines/galichanin-25-960.webp', 'img/machines/xcmg-50-960.webp'],
    specs: { 'Грузоподъёмность': '16 т', 'Длина стрелы': '18 м', 'Высота подъёма': '19,6 м', 'Колёсная формула': '4×2', 'Мощность двигателя': '240 л.с.', 'Год выпуска': '2016' },
    rentPerHour: 1700, rentPerShift: 12500, buyPrice: 1900000, capacity: 16, popular: true
  },
  {
    id: 'galichanin-25', name: 'Автокран Галичанин КС-55713-1В, 25 т', category: 'cranes',
    image: 'img/machines/galichanin-25-960.webp',
    gallery: ['img/machines/galichanin-25-960.webp', 'img/machines/ivanovets-16-960.webp', 'img/machines/liebherr-60-960.webp'],
    specs: { 'Грузоподъёмность': '25 т', 'Длина стрелы': '28 м', 'Высота подъёма': '29,5 м', 'Колёсная формула': '6×4', 'Мощность двигателя': '300 л.с.', 'Год выпуска': '2021' },
    rentPerHour: 2400, rentPerShift: 18000, buyPrice: 9600000, capacity: 25, popular: true
  },
  {
    id: 'xcmg-50', name: 'Автокран XCMG QY50KA, 50 т', category: 'cranes',
    image: 'img/machines/xcmg-50-960.webp',
    gallery: ['img/machines/xcmg-50-960.webp', 'img/machines/liebherr-60-960.webp', 'img/machines/galichanin-25-960.webp'],
    specs: { 'Грузоподъёмность': '50 т', 'Длина стрелы': '44,5 м', 'Высота подъёма': '46 м', 'Колёсная формула': '8×4', 'Мощность двигателя': '340 л.с.', 'Год выпуска': '2022' },
    rentPerHour: 3800, rentPerShift: 29000, buyPrice: 21500000, capacity: 50, popular: true
  },
  {
    id: 'liebherr-60', name: 'Автокран Liebherr LTM 1060-3.1, 60 т', category: 'cranes',
    image: 'img/machines/liebherr-60-960.webp',
    gallery: ['img/machines/liebherr-60-960.webp', 'img/machines/xcmg-50-960.webp', 'img/machines/ivanovets-16-960.webp'],
    specs: { 'Грузоподъёмность': '60 т', 'Длина стрелы': '48 м', 'Высота подъёма': '64 м', 'Колёсная формула': '6×6', 'Мощность двигателя': '408 л.с.', 'Год выпуска': '2018' },
    rentPerHour: 5200, rentPerShift: 40000, buyPrice: 39000000, capacity: 60, popular: false
  },

  /* ---------- Самосвалы ---------- */
  {
    id: 'kamaz-6520', name: 'Самосвал КАМАЗ 6520, 20 т', category: 'dump-trucks',
    image: 'img/machines/kamaz-6520-960.webp',
    gallery: ['img/machines/kamaz-6520-960.webp', 'img/machines/shacman-25-960.webp', 'img/machines/howo-25-960.webp'],
    specs: { 'Грузоподъёмность': '20 т', 'Объём кузова': '16 м³', 'Колёсная формула': '6×4', 'Мощность двигателя': '400 л.с.', 'Разгрузка': 'назад', 'Год выпуска': '2022' },
    rentPerHour: 1600, rentPerShift: 12000, buyPrice: 7900000, capacity: 20, popular: true
  },
  {
    id: 'shacman-25', name: 'Самосвал Shacman SX3258DR384, 25 т', category: 'dump-trucks',
    image: 'img/machines/shacman-25-960.webp',
    gallery: ['img/machines/shacman-25-960.webp', 'img/machines/kamaz-6520-960.webp', 'img/machines/volvo-fmx-960.webp'],
    specs: { 'Грузоподъёмность': '25 т', 'Объём кузова': '20 м³', 'Колёсная формула': '6×4', 'Мощность двигателя': '380 л.с.', 'Разгрузка': 'назад', 'Год выпуска': '2021' },
    rentPerHour: 1700, rentPerShift: 12800, buyPrice: 8300000, capacity: 25, popular: false
  },
  {
    id: 'howo-25', name: 'Самосвал HOWO ZZ3257N3847A, 25 т', category: 'dump-trucks',
    image: 'img/machines/howo-25-960.webp',
    gallery: ['img/machines/howo-25-960.webp', 'img/machines/volvo-fmx-960.webp', 'img/machines/kamaz-6520-960.webp'],
    specs: { 'Грузоподъёмность': '25 т', 'Объём кузова': '18 м³', 'Колёсная формула': '6×4', 'Мощность двигателя': '371 л.с.', 'Разгрузка': 'назад', 'Год выпуска': '2020' },
    rentPerHour: 1600, rentPerShift: 12000, buyPrice: 6900000, capacity: 25, popular: true
  },
  {
    id: 'volvo-fmx', name: 'Самосвал Volvo FMX 8×4, 32 т', category: 'dump-trucks',
    image: 'img/machines/volvo-fmx-960.webp',
    gallery: ['img/machines/volvo-fmx-960.webp', 'img/machines/howo-25-960.webp', 'img/machines/shacman-25-960.webp'],
    specs: { 'Грузоподъёмность': '32 т', 'Объём кузова': '22 м³', 'Колёсная формула': '8×4', 'Мощность двигателя': '500 л.с.', 'Разгрузка': 'назад', 'Год выпуска': '2019' },
    rentPerHour: 2200, rentPerShift: 16500, buyPrice: 12700000, capacity: 32, popular: false
  },

  /* ---------- Погрузчики ---------- */
  {
    id: 'cat-950', name: 'Фронтальный погрузчик CAT 950GC', category: 'loaders',
    image: 'img/machines/cat-950-960.webp',
    gallery: ['img/machines/cat-950-960.webp', 'img/machines/lonking-855-960.webp', 'img/machines/sdlg-956-960.webp'],
    specs: { 'Грузоподъёмность': '5 т', 'Объём ковша': '3,1 м³', 'Высота выгрузки': '2,9 м', 'Мощность двигателя': '225 л.с.', 'Эксплуатационная масса': '18,6 т', 'Год выпуска': '2021' },
    rentPerHour: 2300, rentPerShift: 17500, buyPrice: 16400000, capacity: 5, popular: true
  },
  {
    id: 'lonking-855', name: 'Фронтальный погрузчик Lonking CDM855N', category: 'loaders',
    image: 'img/machines/lonking-855-960.webp',
    gallery: ['img/machines/lonking-855-960.webp', 'img/machines/cat-950-960.webp', 'img/machines/sdlg-956-960.webp'],
    specs: { 'Грузоподъёмность': '5 т', 'Объём ковша': '3 м³', 'Высота выгрузки': '3,1 м', 'Мощность двигателя': '220 л.с.', 'Эксплуатационная масса': '17,2 т', 'Год выпуска': '2022' },
    rentPerHour: 1800, rentPerShift: 13500, buyPrice: 6900000, capacity: 5, popular: false
  },
  {
    id: 'bobcat-s530', name: 'Мини-погрузчик Bobcat S530', category: 'loaders',
    image: 'img/machines/bobcat-s530-960.webp',
    gallery: ['img/machines/bobcat-s530-960.webp', 'img/machines/cat-950-960.webp', 'img/machines/lonking-855-960.webp'],
    specs: { 'Грузоподъёмность': '0,9 т', 'Объём ковша': '0,4 м³', 'Высота выгрузки': '2,4 м', 'Мощность двигателя': '49 л.с.', 'Эксплуатационная масса': '2,8 т', 'Год выпуска': '2020' },
    rentPerHour: 1400, rentPerShift: 10500, buyPrice: 4300000, capacity: 0.9, popular: true
  },
  {
    id: 'sdlg-956', name: 'Фронтальный погрузчик SDLG L956F', category: 'loaders',
    image: 'img/machines/sdlg-956-960.webp',
    gallery: ['img/machines/sdlg-956-960.webp', 'img/machines/lonking-855-960.webp', 'img/machines/cat-950-960.webp'],
    specs: { 'Грузоподъёмность': '5,6 т', 'Объём ковша': '3,2 м³', 'Высота выгрузки': '3,1 м', 'Мощность двигателя': '220 л.с.', 'Эксплуатационная масса': '17,5 т', 'Год выпуска': '2019' },
    rentPerHour: 1900, rentPerShift: 14000, buyPrice: 5800000, capacity: 5.6, popular: false
  },

  /* ---------- Бульдозеры ---------- */
  {
    id: 'shantui-sd16', name: 'Бульдозер Shantui SD16', category: 'bulldozers',
    image: 'img/machines/shantui-sd16-960.webp',
    gallery: ['img/machines/shantui-sd16-960.webp', 'img/machines/komatsu-d65-960.webp', 'img/machines/cat-d6n-960.webp'],
    specs: { 'Эксплуатационная масса': '17 т', 'Мощность двигателя': '160 л.с.', 'Объём отвала': '4,5 м³', 'Ширина отвала': '3,4 м', 'Рыхлитель': 'однозубый', 'Год выпуска': '2021' },
    rentPerHour: 2200, rentPerShift: 16500, buyPrice: 9200000, capacity: null, popular: true
  },
  {
    id: 'cat-d6n', name: 'Бульдозер CAT D6N LGP', category: 'bulldozers',
    image: 'img/machines/cat-d6n-960.webp',
    gallery: ['img/machines/cat-d6n-960.webp', 'img/machines/shantui-sd16-960.webp', 'img/machines/komatsu-d65-960.webp'],
    specs: { 'Эксплуатационная масса': '18,4 т', 'Мощность двигателя': '150 л.с.', 'Объём отвала': '3,9 м³', 'Ширина отвала': '4,1 м', 'Рыхлитель': 'трёхзубый', 'Год выпуска': '2017' },
    rentPerHour: 2600, rentPerShift: 19500, buyPrice: 13600000, capacity: null, popular: false
  },
  {
    id: 'komatsu-d65', name: 'Бульдозер Komatsu D65EX-16', category: 'bulldozers',
    image: 'img/machines/komatsu-d65-960.webp',
    gallery: ['img/machines/komatsu-d65-960.webp', 'img/machines/cat-d6n-960.webp', 'img/machines/shantui-sd16-960.webp'],
    specs: { 'Эксплуатационная масса': '21,4 т', 'Мощность двигателя': '220 л.с.', 'Объём отвала': '5,6 м³', 'Ширина отвала': '3,9 м', 'Рыхлитель': 'однозубый', 'Год выпуска': '2018' },
    rentPerHour: 2800, rentPerShift: 21000, buyPrice: 15800000, capacity: null, popular: false
  },

  /* ---------- Манипуляторы ---------- */
  {
    id: 'hyundai-hd170', name: 'Манипулятор Hyundai HD170 с КМУ Kanglim, 7 т', category: 'manipulators',
    image: 'img/machines/hyundai-hd170-960.webp',
    gallery: ['img/machines/hyundai-hd170-960.webp', 'img/machines/kamaz-65117-960.webp', 'img/machines/isuzu-giga-960.webp'],
    specs: { 'Грузоподъёмность КМУ': '7 т', 'Вылет стрелы': '20 м', 'Грузоподъёмность борта': '10 т', 'Длина платформы': '7,2 м', 'Колёсная формула': '6×4', 'Год выпуска': '2019' },
    rentPerHour: 1900, rentPerShift: 14500, buyPrice: 8400000, capacity: 7, popular: true
  },
  {
    id: 'kamaz-65117', name: 'Манипулятор КАМАЗ 65117 с КМУ Palfinger, 10 т', category: 'manipulators',
    image: 'img/machines/kamaz-65117-960.webp',
    gallery: ['img/machines/kamaz-65117-960.webp', 'img/machines/hyundai-hd170-960.webp', 'img/machines/isuzu-giga-960.webp'],
    specs: { 'Грузоподъёмность КМУ': '10 т', 'Вылет стрелы': '22 м', 'Грузоподъёмность борта': '14 т', 'Длина платформы': '7,8 м', 'Колёсная формула': '6×4', 'Год выпуска': '2021' },
    rentPerHour: 2300, rentPerShift: 17000, buyPrice: 11900000, capacity: 10, popular: false
  },
  {
    id: 'isuzu-giga', name: 'Манипулятор Isuzu Giga с КМУ Unic, 5 т', category: 'manipulators',
    image: 'img/machines/isuzu-giga-960.webp',
    gallery: ['img/machines/isuzu-giga-960.webp', 'img/machines/hyundai-hd170-960.webp', 'img/machines/kamaz-65117-960.webp'],
    specs: { 'Грузоподъёмность КМУ': '5 т', 'Вылет стрелы': '18 м', 'Грузоподъёмность борта': '12 т', 'Длина платформы': '6,5 м', 'Колёсная формула': '6×4', 'Год выпуска': '2018' },
    rentPerHour: 1700, rentPerShift: 12800, buyPrice: 6700000, capacity: 5, popular: false
  }
];
