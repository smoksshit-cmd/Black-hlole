import { eventSource, event_types, saveSettingsDebounced, setExtensionPrompt, extension_prompt_types } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';

const EXT = 'black-market';
const PROMPT_KEY = EXT + '_injection';

/* ═══════════════════════════════════════════════════════════
   КАТАЛОГ
═══════════════════════════════════════════════════════════ */
const CATALOG = {
  drugs: {
    name: 'Наркотики', icon: '💊', color: '#a855f7',
    items: [
      { id: 'weed',        name: 'Марихуана',          price: 50,   desc: 'Вызывает расслабление и лёгкую эйфорию.',            addictionRate: 8,  effectDuration: 3, effectDesc: 'расслаблен, слегка заторможен, улыбается без причины' },
      { id: 'cocaine',     name: 'Кокаин',              price: 200,  desc: 'Мощный стимулятор. Резкий прилив энергии.',           addictionRate: 18, effectDuration: 2, effectDesc: 'гиперактивен, самоуверен, зрачки расширены, говорит быстро' },
      { id: 'heroin',      name: 'Героин',              price: 300,  desc: 'Сильнейший опиоид. Полная эйфория.',                 addictionRate: 30, effectDuration: 4, effectDesc: 'в состоянии блаженной апатии, реакции замедлены, зрачки-точки' },
      { id: 'ecstasy',     name: 'Экстази (MDMA)',       price: 150,  desc: 'Эмпатоген. Усиливает чувства и тактильность.',       addictionRate: 12, effectDuration: 4, effectDesc: 'крайне общителен, тактилен, испытывает эмпатию ко всему' },
      { id: 'lsd',         name: 'ЛСД',                 price: 120,  desc: 'Психоделик. Искажает восприятие реальности.',         addictionRate: 5,  effectDuration: 6, effectDesc: 'галлюцинирует, видит узоры и цвета, восприятие искажено' },
      { id: 'amphetamine', name: 'Амфетамин',           price: 100,  desc: 'Стимулятор ЦНС. Бодрость на часы.',                  addictionRate: 15, effectDuration: 4, effectDesc: 'бодр, сосредоточен, не чувствует голода и усталости' },
      { id: 'meth',        name: 'Метамфетамин',        price: 250,  desc: 'Мощнейший стимулятор с тяжёлыми последствиями.',      addictionRate: 28, effectDuration: 5, effectDesc: 'маниакально энергичен, параноидален, зрачки огромные' },
    ]
  },
  rare_drugs: {
    name: 'Редкие наркотики', icon: '🧬', color: '#c084fc',
    items: [
      { id: 'dmt',          name: 'DMT',                   price: 500,  desc: 'Молекула духа. Кратковременный мощный трип.',      addictionRate: 4,  effectDuration: 1, effectDesc: 'переживает мистический опыт, видит иные миры' },
      { id: 'mescaline',    name: 'Мескалин',              price: 400,  desc: 'Из кактуса пейот. Глубокий психоделик.',           addictionRate: 5,  effectDuration: 6, effectDesc: 'видит живые узоры, философствует, время искажено' },
      { id: 'shrooms',      name: 'Псилоцибиновые грибы',  price: 180,  desc: 'Магические грибы. Мягкий психоделический трип.',   addictionRate: 3,  effectDuration: 4, effectDesc: 'смеётся без причины, видит дыхание предметов, эмоционален' },
      { id: 'opium',        name: 'Опиум',                 price: 350,  desc: 'Классический наркотик. Тягучая эйфория.',          addictionRate: 22, effectDuration: 5, effectDesc: 'в блаженном полусне, расслаблен до предела, мечтателен' },
      { id: 'ayahuasca',    name: 'Аяуаска',               price: 600,  desc: 'Шаманский напиток. Духовное путешествие.',         addictionRate: 2,  effectDuration: 5, effectDesc: 'переживает видения, очищение, возможна тошнота и слёзы' },
      { id: 'adrenochrome', name: 'Адренохром',            price: 900,  desc: 'Легендарное вещество. Эффект непредсказуем.',      addictionRate: 10, effectDuration: 3, effectDesc: 'в состоянии изменённого сознания, непредсказуемые вспышки эмоций' },
    ]
  },
  weapons: {
    name: 'Оружие', icon: '🔫', color: '#ef4444',
    items: [
      { id: 'knife',   name: 'Нож',           price: 80,   desc: 'Складной нож. Компактный и смертоносный.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе нож — может использовать как угрозу или оружие' },
      { id: 'pistol',  name: 'Пистолет',      price: 500,  desc: 'Полуавтомат. 15 патронов в обойме.',            addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён пистолетом — это меняет баланс сил' },
      { id: 'shotgun', name: 'Дробовик',      price: 800,  desc: 'Разрушительная сила на близкой дистанции.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет дробовик — внушает страх одним видом' },
      { id: 'rifle',   name: 'Автомат',       price: 1500, desc: 'Полный автомат. Армейское оружие.',             addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён автоматом — крайне опасен' },
      { id: 'brass',   name: 'Кастет',        price: 60,   desc: 'Латунный кастет. Усиливает удар вчетверо.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кастет — удары рук значительно сильнее' },
      { id: 'taser',   name: 'Электрошокер',  price: 200,  desc: 'Обездвиживает цель электричеством.',            addictionRate: 0, effectDuration: 0, effectDesc: 'имеет электрошокер — может парализовать' },
      { id: 'katana',  name: 'Катана',        price: 1200, desc: 'Японский клинок. Смертоносная элегантность.',    addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён катаной — владеет смертоносным клинком' },
    ]
  },
  alcohol: {
    name: 'Алкоголь', icon: '🍷', color: '#f59e0b',
    items: [
      { id: 'beer',      name: 'Пиво',       price: 15,  desc: 'Холодное пиво. Лёгкое опьянение.',             addictionRate: 3,  effectDuration: 2, effectDesc: 'слегка навеселе, расслаблен' },
      { id: 'vodka',     name: 'Водка',      price: 50,  desc: 'Классика. 40 градусов решимости.',              addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, речь невнятная, раскрепощён' },
      { id: 'whiskey',   name: 'Виски',      price: 120, desc: 'Выдержанный виски. Обжигает и согревает.',       addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, самоуверен, чуть агрессивен' },
      { id: 'absinthe',  name: 'Абсент',     price: 150, desc: 'Зелёная фея. 70 градусов и туйон.',             addictionRate: 10, effectDuration: 4, effectDesc: 'сильно пьян, возможны лёгкие галлюцинации, дерзок' },
      { id: 'moonshine', name: 'Самогон',    price: 30,  desc: 'Домашний первач. Непредсказуемый градус.',       addictionRate: 6,  effectDuration: 3, effectDesc: 'пьян, может плохо себя чувствовать, непредсказуем' },
      { id: 'wine',      name: 'Вино',       price: 80,  desc: 'Красное вино. Романтика и расслабление.',        addictionRate: 4,  effectDuration: 2, effectDesc: 'приятно захмелел, романтично настроен' },
    ]
  },
  medications: {
    name: 'Медикаменты', icon: '💉', color: '#06b6d4',
    items: [
      { id: 'painkillers',      name: 'Обезболивающее',  price: 40,  desc: 'Снимает любую боль. Возможна сонливость.',       addictionRate: 10, effectDuration: 3, effectDesc: 'не чувствует боли, слегка заторможен' },
      { id: 'antidepressants',  name: 'Антидепрессанты', price: 80,  desc: 'Выравнивают настроение. Эффект постепенный.',    addictionRate: 12, effectDuration: 5, effectDesc: 'эмоции притуплены, стабильное ровное настроение' },
      { id: 'sleeping',         name: 'Снотворное',      price: 60,  desc: 'Мгновенный крепкий сон.',                        addictionRate: 14, effectDuration: 3, effectDesc: 'сонлив, может отключиться в любой момент' },
      { id: 'adrenaline',       name: 'Адреналин',       price: 200, desc: 'Инъекция чистого адреналина. Экстренная бодрость.', addictionRate: 5, effectDuration: 1, effectDesc: 'в состоянии боевой готовности, сердце колотится, зрение острое' },
      { id: 'morphine',         name: 'Морфин',          price: 250, desc: 'Сильнейшее обезболивающее. Опасно привыкание.',   addictionRate: 25, effectDuration: 4, effectDesc: 'в состоянии полного безразличия к боли, эйфория, зрачки сужены' },
      { id: 'steroids',         name: 'Стероиды',        price: 300, desc: 'Анаболики. Сила и агрессия.',                     addictionRate: 8,  effectDuration: 5, effectDesc: 'чувствует прилив силы, агрессивен, мышцы напряжены' },
    ]
  },
  poisons: {
    name: 'Яды', icon: '☠️', color: '#84cc16',
    items: [
      { id: 'cyanide',     name: 'Цианид',      price: 400, desc: 'Смерть в считанные минуты. Запах миндаля.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе смертельный яд — цианид' },
      { id: 'arsenic',     name: 'Мышьяк',      price: 300, desc: 'Классический яд. Действует постепенно.',        addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе мышьяк — медленный яд' },
      { id: 'ricin',       name: 'Рицин',       price: 600, desc: 'Биологический яд. Без противоядия.',            addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе рицин — смертельный биотоксин' },
      { id: 'snake_venom', name: 'Яд змеи',     price: 350, desc: 'Нейротоксин. Паралич и остановка дыхания.',      addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе змеиный яд' },
      { id: 'nightshade',  name: 'Белладонна',  price: 200, desc: 'Красавка. Галлюцинации и смерть.',               addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе экстракт белладонны' },
      { id: 'chloroform',  name: 'Хлороформ',   price: 250, desc: 'Отключает сознание. Действует быстро.',          addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе хлороформ — может усыпить кого угодно' },
    ]
  },
  explosives: {
    name: 'Взрывчатка', icon: '💣', color: '#f97316',
    items: [
      { id: 'grenade',   name: 'Граната',              price: 400,  desc: 'Осколочная граната. Радиус поражения 15м.',   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе гранату — одно движение и взрыв' },
      { id: 'dynamite',  name: 'Динамит',              price: 500,  desc: 'Классическая взрывчатка. Мощная.',            addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе динамит' },
      { id: 'c4',        name: 'C4',                   price: 1000, desc: 'Пластичная взрывчатка. Профессиональный снос.', addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе C4 — пластичную взрывчатку' },
      { id: 'molotov',   name: 'Коктейль Молотова',    price: 100,  desc: 'Бутылка с горючей смесью. Поджигает всё.',   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе коктейль Молотова' },
      { id: 'detonator', name: 'Детонатор',            price: 300,  desc: 'Дистанционный детонатор. Для подрыва зарядов.', addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе дистанционный детонатор' },
      { id: 'flashbang', name: 'Светошумовая',         price: 250,  desc: 'Ослепляет и оглушает. Нелетальная.',          addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе светошумовую гранату' },
    ]
  },
  contraband: {
    name: 'Контрабанда', icon: '📦', color: '#78716c',
    items: [
      { id: 'fake_docs',   name: 'Фальшивые документы',     price: 500, desc: 'Паспорт, права — любая личность.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет фальшивые документы — может выдать себя за другого' },
      { id: 'jewels',      name: 'Краденые драгоценности',  price: 800, desc: 'Ворованные камни и золото.',                 addictionRate: 0, effectDuration: 0, effectDesc: 'имеет краденые драгоценности — может подкупить или продать' },
      { id: 'banned_books', name: 'Запрещённые книги',      price: 200, desc: 'Тексты, которых не должно существовать.',    addictionRate: 0, effectDuration: 0, effectDesc: 'владеет запрещёнными знаниями из тайных книг' },
      { id: 'spy_gear',    name: 'Шпионское оборудование',  price: 600, desc: 'Жучки, камеры, дешифраторы.',               addictionRate: 0, effectDuration: 0, effectDesc: 'оснащён шпионским оборудованием — может прослушивать и следить' },
      { id: 'lockpicks',   name: 'Отмычки',                 price: 150, desc: 'Профессиональный набор для вскрытия замков.', addictionRate: 0, effectDuration: 0, effectDesc: 'имеет отмычки — может вскрыть почти любой замок' },
      { id: 'body_armor',  name: 'Бронежилет',              price: 700, desc: 'Скрытый бронежилет. Защита от пуль.',        addictionRate: 0, effectDuration: 0, effectDesc: 'носит скрытый бронежилет — защищён от пуль' },
    ]
  },
  magic: {
    name: 'Магические предметы', icon: '✨', color: '#8b5cf6',
    items: [
      { id: 'amulet',       name: 'Амулет защиты',      price: 300,  desc: 'Магическая защита от тёмных сил.',            addictionRate: 0, effectDuration: 0, effectDesc: 'носит амулет защиты — ощущается магическая аура' },
      { id: 'scroll',       name: 'Свиток заклинания',  price: 400,  desc: 'Одноразовое мощное заклинание.',               addictionRate: 0, effectDuration: 0, effectDesc: 'имеет магический свиток — может применить заклинание' },
      { id: 'crystal',      name: 'Магический кристалл', price: 500, desc: 'Концентрирует магическую энергию.',            addictionRate: 3, effectDuration: 0, effectDesc: 'владеет магическим кристаллом — чувствует потоки энергии' },
      { id: 'cursed_doll',  name: 'Проклятая кукла',    price: 350,  desc: 'Кукла вуду. Связывает с целью.',               addictionRate: 0, effectDuration: 0, effectDesc: 'имеет проклятую куклу вуду — может наложить проклятие' },
      { id: 'runes',        name: 'Руны',               price: 250,  desc: 'Древние руны. Предсказание и магия.',           addictionRate: 0, effectDuration: 0, effectDesc: 'владеет древними рунами — может прорицать или наводить чары' },
      { id: 'necronomicon', name: 'Некрономикон',       price: 1500, desc: 'Книга мёртвых. Запретное знание.',              addictionRate: 5, effectDuration: 0, effectDesc: 'изучает Некрономикон — тёмное знание меняет его' },
    ]
  },
  potions: {
    name: 'Зелья', icon: '🧪', color: '#10b981',
    items: [
      { id: 'health_pot',   name: 'Зелье здоровья',      price: 100, desc: 'Восстанавливает силы и лечит раны.',          addictionRate: 2, effectDuration: 2, effectDesc: 'раны затягиваются, чувствует прилив здоровья' },
      { id: 'strength_pot', name: 'Зелье силы',          price: 200, desc: 'Нечеловеческая сила на время.',                addictionRate: 5, effectDuration: 3, effectDesc: 'обладает сверхчеловеческой силой, мышцы вздуваются' },
      { id: 'invis_pot',    name: 'Зелье невидимости',   price: 500, desc: 'Полная невидимость. Растворяешься в воздухе.', addictionRate: 4, effectDuration: 2, effectDesc: 'невидим — тело прозрачное, можно остаться незамеченным' },
      { id: 'love_pot',     name: 'Приворотное зелье',   price: 300, desc: 'Вызывает влечение к тому, кто дал.',          addictionRate: 6, effectDuration: 4, effectDesc: 'под действием приворотного зелья — испытывает сильное влечение' },
      { id: 'forget_pot',   name: 'Зелье забвения',      price: 250, desc: 'Стирает последние воспоминания.',              addictionRate: 3, effectDuration: 1, effectDesc: 'теряет последние воспоминания, дезориентирован' },
      { id: 'rage_pot',     name: 'Зелье ярости',        price: 350, desc: 'Берсерк. Неудержимая агрессия.',               addictionRate: 7, effectDuration: 2, effectDesc: 'в состоянии берсерка — неконтролируемая ярость, глаза красные' },
    ]
  },
  sexshop: {
    name: 'Секс-шоп', icon: '🔞', color: '#ec4899',
    items: [
      { id: 'handcuffs',   name: 'Наручники',          price: 50,  desc: 'Мягкие наручники с мехом.',                    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет наручники — элемент бондажа' },
      { id: 'whip',        name: 'Плётка',             price: 80,  desc: 'Кожаная плётка. Для игр в доминирование.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кожаную плётку' },
      { id: 'blindfold',   name: 'Повязка на глаза',   price: 30,  desc: 'Шёлковая повязка. Обостряет другие чувства.',  addictionRate: 0, effectDuration: 0, effectDesc: 'имеет шёлковую повязку для глаз' },
      { id: 'rope',        name: 'Верёвки',            price: 40,  desc: 'Мягкие верёвки для шибари.',                   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет набор верёвок для связывания' },
      { id: 'costume',     name: 'Эротический костюм', price: 120, desc: 'Провокационный костюм. Привлекает внимание.',  addictionRate: 0, effectDuration: 0, effectDesc: 'одет в провокационный эротический костюм' },
      { id: 'candles',     name: 'Массажные свечи',    price: 25,  desc: 'Ароматные свечи. Тают в масло для тела.',      addictionRate: 0, effectDuration: 0, effectDesc: 'зажёг массажные свечи — атмосфера интимная' },
      { id: 'aphrodisiac', name: 'Афродизиак',         price: 180, desc: 'Сильный возбудитель. Повышает либидо.',         addictionRate: 8, effectDuration: 3, effectDesc: 'под действием афродизиака — возбуждение и повышенное либидо' },
      { id: 'collar',      name: 'Ошейник',            price: 90,  desc: 'Кожаный ошейник с поводком.',                  addictionRate: 0, effectDuration: 0, effectDesc: 'имеет ошейник с поводком — элемент подчинения' },
    ]
  }
};

/* ═══════════════════════════════════════════════════════════
   НАСТРОЙКИ
═══════════════════════════════════════════════════════════ */
const DEFAULT = {
  isEnabled: true,
  widgetVisible: true,
  widgetPos: null,
  widgetSize: 52,
  balance: 500,
  startBalance: 500,
  earnPerMessage: 5,
  applyMode: 'silent',
  inventory: [],
  activeEffects: [],
  addictions: {},
  addictionDecay: 2,
  totalSpent: 0,
  totalEarned: 0,
};

const cfg = () => extension_settings[EXT];

/* ═══════════════════════════════════════════════════════════
   УТИЛИТЫ
═══════════════════════════════════════════════════════════ */
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getItem(catId, itemId) {
  return CATALOG[catId]?.items.find(i => i.id === itemId) ?? null;
}

function getInvEntry(catId, itemId) {
  return cfg().inventory.find(i => i.itemId === itemId && i.catId === catId) ?? null;
}

function getAddiction(catId)     { return cfg().addictions[catId] || 0; }
function setAddiction(catId, v)  { cfg().addictions[catId] = Math.max(0, Math.min(100, v)); }

function addictionLabel(level) {
  if (level >= 80) return { text: 'Критическая', color: '#ef4444', icon: '🔴' };
  if (level >= 60) return { text: 'Тяжёлая',     color: '#f97316', icon: '🟠' };
  if (level >= 40) return { text: 'Средняя',      color: '#f59e0b', icon: '🟡' };
  if (level >= 20) return { text: 'Лёгкая',       color: '#84cc16', icon: '🟢' };
  if (level  >  0) return { text: 'Минимальная',  color: '#6b7280', icon: '⚪' };
  return { text: 'Нет', color: '#374151', icon: '' };
}

function withdrawalText(catId, level) {
  const cat = CATALOG[catId];
  if (!cat || level < 20) return null;
  const n = cat.name.toLowerCase();
  if (level >= 80) return `Тяжелейшая абстиненция от ${n}: тремор, холодный пот, боль во всём теле, не может думать ни о чём другом, готов на всё ради дозы.`;
  if (level >= 60) return `Сильная ломка от ${n}: тошнота, раздражительность, бессонница, навязчивые мысли о ${n}.`;
  if (level >= 40) return `Заметная тяга к ${n}: беспокойство, перепады настроения, периодически думает о ${n}.`;
  return `Лёгкое желание принять ${n}, небольшое беспокойство.`;
}

function toast(type, msg) {
  try { toastr?.[type]?.(msg, 'Black Market', { timeOut: 2500, positionClass: 'toast-top-center' }); } catch {}
}

function popupToast(title, name, sub) {
  let el = document.getElementById('bm-popup');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bm-popup';
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="bm-popup-icon">🏴‍☠️</div><div class="bm-popup-title">${esc(title)}</div><div class="bm-popup-name">${esc(name)}</div>${sub ? `<div class="bm-popup-sub">${esc(sub)}</div>` : ''}`;
  el.classList.remove('bm-popup-show');
  void el.offsetWidth;
  el.classList.add('bm-popup-show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('bm-popup-show'), 1800);
}

/* ═══════════════════════════════════════════════════════════
   СТИЛИ
═══════════════════════════════════════════════════════════ */
function injectStyles() {
  if (document.getElementById('bm-css')) return;
  const s = document.createElement('style');
  s.id = 'bm-css';
  s.textContent = `
/* ── Виджет ── */
#bm-widget {
  position: fixed; bottom: 90px; right: 16px;
  z-index: 999990;
  user-select: none; touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#bm-btn {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid rgba(139,92,246,.5);
  box-shadow: 0 4px 20px rgba(139,92,246,.3);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 24px; position: relative;
  transition: box-shadow .25s, border-color .25s, transform .15s;
  -webkit-tap-highlight-color: transparent;
}
#bm-btn:hover  { box-shadow: 0 6px 30px rgba(139,92,246,.55); border-color: rgba(139,92,246,.8); }
#bm-btn:active { transform: scale(.92); }
#bm-btn.bm-pulse { animation: bm-pulse .5s ease; }
@keyframes bm-pulse { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }

#bm-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 700; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #1a1a2e; line-height: 1;
}

/* ── Оверлей ── */
#bm-overlay {
  position: fixed; inset: 0; z-index: 999995;
  background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity .2s;
}
#bm-overlay.open { opacity: 1; pointer-events: auto; }

/* ── Панель ── */
#bm-panel {
  width: 100%; max-width: 420px; max-height: 85vh; min-height: 300px;
  background: linear-gradient(180deg, #0f0f1a, #1a1a2e);
  border: 1px solid rgba(139,92,246,.25); border-bottom: none;
  border-radius: 18px 18px 0 0;
  display: flex; flex-direction: column; overflow: hidden;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.32,.72,.37,1.1);
  box-shadow: 0 -8px 40px rgba(0,0,0,.5);
}
#bm-overlay.open #bm-panel { transform: translateY(0); }

/* ── Шапка ── */
.bm-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.2); flex-shrink: 0;
}
.bm-hdr-title { font-size: 16px; font-weight: 700; color: #e2e8f0; flex: 1; }
.bm-hdr-balance {
  display: flex; align-items: center; gap: 5px;
  background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.25);
  border-radius: 20px; padding: 5px 12px;
  font-size: 13px; font-weight: 600; color: #fbbf24;
}
.bm-icon-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
  color: #ccc; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s; flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.bm-icon-btn:hover { background: rgba(255,255,255,.12); color: #fff; }

/* ── Табы ── */
.bm-tabs {
  display: flex; border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.15); flex-shrink: 0;
}
.bm-tab {
  flex: 1; padding: 10px 0; text-align: center;
  font-size: 12px; font-weight: 600; color: #64748b;
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color .15s, border-color .15s;
  -webkit-tap-highlight-color: transparent;
}
.bm-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }
.bm-tab:hover  { color: #cbd5e1; }

/* ── Контент ── */
.bm-body { flex: 1; overflow-y: auto; padding: 10px 12px 16px; -webkit-overflow-scrolling: touch; }

/* ── Сетка категорий ── */
.bm-cat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
.bm-cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; border-radius: 14px; cursor: pointer;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  transition: background .15s, border-color .15s, transform .12s;
  -webkit-tap-highlight-color: transparent;
}
.bm-cat-card:hover   { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.12); }
.bm-cat-card:active  { transform: scale(.96); }
.bm-cat-icon  { font-size: 28px; line-height: 1; }
.bm-cat-name  { font-size: 12px; font-weight: 600; color: #cbd5e1; text-align: center; line-height: 1.3; }
.bm-cat-count { font-size: 10px; color: #64748b; }

/* ── Карточка товара ── */
.bm-item-card {
  display: flex; gap: 10px; padding: 12px; margin-bottom: 8px;
  border-radius: 12px; background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  transition: background .15s;
}
.bm-item-info  { flex: 1; min-width: 0; }
.bm-item-name  { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
.bm-item-desc  { font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 6px; }
.bm-item-tags  { display: flex; gap: 5px; flex-wrap: wrap; }
.bm-item-tag   { font-size: 9px; padding: 2px 7px; border-radius: 8px; font-weight: 600; line-height: 1.4; }
.bm-item-right { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-width: 72px; }
.bm-item-price { font-size: 14px; font-weight: 700; color: #fbbf24; }

/* ── Кнопки ── */
.bm-btn-buy, .bm-btn-use, .bm-btn-drop {
  padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700;
  border: none; cursor: pointer; transition: opacity .15s, transform .1s;
  -webkit-tap-highlight-color: transparent;
}
.bm-btn-buy          { background: linear-gradient(135deg,#8b5cf6,#6d28d9); color: #fff; }
.bm-btn-buy:disabled { opacity: .35; cursor: not-allowed; }
.bm-btn-buy:active:not(:disabled) { transform: scale(.94); }
.bm-btn-use  { background: linear-gradient(135deg,#10b981,#059669); color: #fff; }
.bm-btn-use:active  { transform: scale(.94); }
.bm-btn-drop { background: rgba(239,68,68,.15); color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
.bm-btn-drop:active { transform: scale(.94); }

/* ── Инвентарь ── */
.bm-empty { text-align: center; padding: 40px 20px; color: #475569; font-size: 13px; }
.bm-inv-row {
  display: flex; gap: 10px; align-items: center;
  padding: 10px 12px; margin-bottom: 6px;
  border-radius: 10px; background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
}
.bm-inv-info { flex: 1; min-width: 0; }
.bm-inv-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.bm-inv-cat  { font-size: 10px; color: #64748b; }
.bm-inv-qty  { font-size: 12px; font-weight: 700; color: #a78bfa; min-width: 28px; text-align: center; }
.bm-inv-acts { display: flex; gap: 5px; }

/* ── Зависимости ── */
.bm-add-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; margin-bottom: 5px;
  border-radius: 8px; background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.04);
}
.bm-add-name  { font-size: 11px; font-weight: 600; color: #cbd5e1; min-width: 50px; }
.bm-add-track { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,.06); overflow: hidden; }
.bm-add-fill  { height: 100%; border-radius: 3px; transition: width .4s; }
.bm-add-pct   { font-size: 11px; font-weight: 700; min-width: 32px; text-align: right; }
.bm-add-label { font-size: 10px; color: #94a3b8; min-width: 50px; }

/* ── Всплывашка ── */
#bm-popup {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%,-50%) scale(.8);
  background: rgba(15,15,26,.96); border: 1px solid rgba(139,92,246,.4);
  border-radius: 16px; padding: 20px 28px; z-index: 1000001;
  text-align: center; opacity: 0; pointer-events: none;
  transition: opacity .25s, transform .25s;
  box-shadow: 0 12px 40px rgba(0,0,0,.5); max-width: 280px;
}
#bm-popup.bm-popup-show { opacity: 1; transform: translate(-50%,-50%) scale(1); }
.bm-popup-icon  { font-size: 36px; margin-bottom: 8px; }
.bm-popup-title { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.bm-popup-name  { font-size: 14px; font-weight: 700; color: #e2e8f0; }
.bm-popup-sub   { font-size: 11px; color: #64748b; margin-top: 4px; }

/* ── Панель настроек ── */
#bm-settings-panel .bm-s-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
#bm-settings-panel .bm-s-lbl { font-size: 12px; color: var(--SmartThemeBodyColor,#aaa); opacity: .6; min-width: 80px; }
#bm-settings-panel .bm-s-inp {
  background: var(--input-background-fill, rgba(255,255,255,.04));
  border: 1px solid var(--border-color, rgba(255,255,255,.12));
  border-radius: 4px; color: var(--SmartThemeBodyColor,#eee);
  padding: 4px 8px; font-size: 13px; width: 80px; text-align: center;
}
#bm-settings-panel .bm-s-sel {
  background: var(--input-background-fill, rgba(255,255,255,.04));
  border: 1px solid var(--border-color, rgba(255,255,255,.12));
  border-radius: 4px; color: var(--SmartThemeBodyColor,#eee);
  padding: 4px 8px; font-size: 12px; flex: 1;
}
#bm-settings-panel .bm-s-sec {
  font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
  color: var(--SmartThemeBodyColor,#aaa); opacity: .5;
  margin: 14px 0 5px; padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,.08));
}
#bm-settings-panel .bm-s-hint {
  font-size: 11px; color: var(--SmartThemeBodyColor,#aaa); opacity: .35;
  line-height: 1.5; margin-bottom: 6px;
}

@media (max-width: 480px) {
  #bm-panel { border-radius: 16px 16px 0 0; max-height: 90vh; }
  #bm-widget { bottom: 80px; right: 10px; }
}
`;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   ВИДЖЕТ — КНОПКА С DRAG-ом
   Ключевая концепция:
   - Открытие/закрытие только по событию 'click' (не pointerup).
   - Drag отслеживается через pointer events.
   - Если было перетаскивание — следующий click подавляется один раз,
     чтобы drag-конец не открыл панель.
   - Никаких глобальных capture-перехватчиков после открытия не нужно.
═══════════════════════════════════════════════════════════ */
function createWidget() {
  if (document.getElementById('bm-widget')) return;
  injectStyles();

  const c = cfg();

  // ── Основной контейнер (позиционируемый) ──
  const wrap = document.createElement('div');
  wrap.id = 'bm-widget';

  // ── Кнопка ──
  const btn = document.createElement('button');
  btn.id = 'bm-btn';
  btn.setAttribute('aria-label', 'Чёрный рынок');
  btn.innerHTML = '🏴‍☠️<span id="bm-badge" style="display:none">0</span>';
  wrap.appendChild(btn);
  document.body.appendChild(wrap);

  // ── Размер и позиция ──
  const sz = c.widgetSize || 52;
  btn.style.width = btn.style.height = sz + 'px';

  if (c.widgetPos?.top != null) {
    wrap.style.top    = c.widgetPos.top;
    wrap.style.left   = c.widgetPos.left;
    wrap.style.bottom = wrap.style.right = 'auto';
  }
  clampToViewport(wrap);
  window.addEventListener('resize', () => clampToViewport(wrap));

  // ── Drag ──
  makeDraggable(wrap, btn);
  updateBadge();
}

function clampToViewport(wrap) {
  const r = wrap.getBoundingClientRect();
  const cs = window.getComputedStyle(wrap);
  if (cs.left === 'auto' || cs.top === 'auto') {
    wrap.style.left   = r.left + 'px';
    wrap.style.top    = r.top + 'px';
    wrap.style.right  = wrap.style.bottom = 'auto';
  }
  const mxL = Math.max(4, window.innerWidth  - wrap.offsetWidth  - 4);
  const mxT = Math.max(4, window.innerHeight - wrap.offsetHeight - 4);
  wrap.style.left = Math.max(4, Math.min(mxL, parseFloat(wrap.style.left))) + 'px';
  wrap.style.top  = Math.max(4, Math.min(mxT, parseFloat(wrap.style.top)))  + 'px';
}

function makeDraggable(wrap, btn) {
  let dragging = false;   // сейчас тащим?
  let wasDragged = false; // это действие закончилось как drag?
  let ox = 0, oy = 0;

  // pointerdown — запомнить смещение
  wrap.addEventListener('pointerdown', (e) => {
    const r = wrap.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    dragging  = false;
    wasDragged = false;
    wrap.setPointerCapture(e.pointerId);
    btn.style.transition = 'none';
  });

  // pointermove — перемещать если сдвинулись больше 6px
  wrap.addEventListener('pointermove', (e) => {
    if (!wrap.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - ox - parseFloat(wrap.style.left || 0);
    const dy = e.clientY - oy - parseFloat(wrap.style.top  || 0);
    if (!dragging && Math.hypot(dx, dy) < 6) return;
    dragging = wasDragged = true;

    const mxL = Math.max(4, window.innerWidth  - wrap.offsetWidth  - 4);
    const mxT = Math.max(4, window.innerHeight - wrap.offsetHeight - 4);
    wrap.style.left   = Math.max(4, Math.min(mxL, e.clientX - ox)) + 'px';
    wrap.style.top    = Math.max(4, Math.min(mxT, e.clientY - oy)) + 'px';
    wrap.style.right  = wrap.style.bottom = 'auto';
    e.preventDefault();
  }, { passive: false });

  // pointerup — сохранить позицию если таскали
  wrap.addEventListener('pointerup', () => {
    btn.style.transition = '';
    if (wasDragged) {
      cfg().widgetPos = { top: wrap.style.top, left: wrap.style.left };
      saveSettingsDebounced();
    }
    dragging = false;
  });

  // click — открыть/закрыть (ТОЛЬКО здесь, никакого pointerup-toggle)
  // Если drag закончился, браузер всё равно пришлёт click — подавляем его один раз.
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // не уходим дальше в DOM
    if (wasDragged) {
      wasDragged = false; // сбросить флаг, проглотить click
      return;
    }
    togglePanel();
  });
}

function updateBadge() {
  const b = document.getElementById('bm-badge');
  if (!b) return;
  const n = cfg().inventory.reduce((s, i) => s + i.qty, 0);
  b.textContent = n > 99 ? '99+' : n;
  b.style.display = n > 0 ? 'flex' : 'none';
}

function pulseWidget() {
  const b = document.getElementById('bm-btn');
  if (!b) return;
  b.classList.remove('bm-pulse');
  void b.offsetWidth;
  b.classList.add('bm-pulse');
  b.addEventListener('animationend', () => b.classList.remove('bm-pulse'), { once: true });
}

/* ═══════════════════════════════════════════════════════════
   ПАНЕЛЬ
═══════════════════════════════════════════════════════════ */
let state = { tab: 'shop', view: 'main', catId: null };

function ensureOverlay() {
  if (document.getElementById('bm-overlay')) return;

  const ov = document.createElement('div');
  ov.id = 'bm-overlay';
  ov.innerHTML = '<div id="bm-panel"></div>';
  document.body.appendChild(ov);

  // Закрытие по клику на фон — ТОЛЬКО click, не pointerdown.
  // Виджет открывается тоже по click и stopPropagation-ит его,
  // поэтому никакого «открыл-тут-же-закрыл» нет.
  ov.addEventListener('click', (e) => {
    if (e.target === ov) closePanel();
  });
}

function togglePanel() {
  ensureOverlay();
  const ov = document.getElementById('bm-overlay');
  if (ov.classList.contains('open')) {
    closePanel();
  } else {
    state = { tab: 'shop', view: 'main', catId: null };
    renderPanel();
    ov.classList.add('open');
  }
}

function closePanel() {
  document.getElementById('bm-overlay')?.classList.remove('open');
}

function renderPanel() {
  const panel = document.getElementById('bm-panel');
  if (!panel) return;
  const c = cfg();
  const bal = `<span class="bm-hdr-balance">💰 ${c.balance}</span>`;

  // ── Шапка ──
  let hdr;
  if (state.tab === 'shop' && state.view === 'category') {
    const cat = CATALOG[state.catId] || {};
    hdr = `<div class="bm-hdr">
      <button class="bm-icon-btn" id="bm-back">←</button>
      <span class="bm-hdr-title">${cat.icon || ''} ${esc(cat.name || '')}</span>
      ${bal}
    </div>`;
  } else {
    const titles = { shop: '🏴‍☠️ Чёрный рынок', inventory: '🎒 Инвентарь', addictions: '🩺 Здоровье' };
    hdr = `<div class="bm-hdr">
      <span class="bm-hdr-title">${titles[state.tab] || ''}</span>
      ${bal}
      <button class="bm-icon-btn" id="bm-close">✕</button>
    </div>`;
  }

  // ── Табы ──
  const tabs = ['shop','inventory','addictions'].map(t =>
    `<div class="bm-tab${state.tab === t ? ' active' : ''}" data-tab="${t}">${
      { shop: '🏪 Магазин', inventory: '🎒 Инвентарь', addictions: '🩺 Здоровье' }[t]
    }</div>`
  ).join('');

  // ── Контент ──
  let body;
  if (state.tab === 'shop') {
    body = state.view === 'category' ? renderItems(state.catId) : renderCategories();
  } else if (state.tab === 'inventory') {
    body = renderInventory();
  } else {
    body = renderAddictions();
  }

  panel.innerHTML = hdr + `<div class="bm-tabs">${tabs}</div><div class="bm-body">${body}</div>`;
  bindPanelEvents(panel);
}

function renderCategories() {
  return '<div class="bm-cat-grid">' +
    Object.entries(CATALOG).map(([id, cat]) =>
      `<div class="bm-cat-card" data-cat="${id}">
        <span class="bm-cat-icon">${cat.icon}</span>
        <span class="bm-cat-name">${esc(cat.name)}</span>
        <span class="bm-cat-count">${cat.items.length} товаров</span>
      </div>`
    ).join('') + '</div>';
}

function renderItems(catId) {
  const cat = CATALOG[catId];
  if (!cat) return '<div class="bm-empty">Категория не найдена</div>';
  const c = cfg();
  return cat.items.map(item => {
    const owned = getInvEntry(catId, item.id)?.qty || 0;
    const canBuy = c.balance >= item.price;
    let tags = '';
    if (item.effectDuration > 0) tags += `<span class="bm-item-tag" style="background:rgba(16,185,129,.12);color:#34d399;">⏱ ${item.effectDuration} ход.</span>`;
    if (item.addictionRate > 15) tags += `<span class="bm-item-tag" style="background:rgba(239,68,68,.12);color:#f87171;">⚠ Выс. завис.</span>`;
    else if (item.addictionRate > 5) tags += `<span class="bm-item-tag" style="background:rgba(245,158,11,.12);color:#fbbf24;">⚡ Завис.</span>`;
    if (owned > 0) tags += `<span class="bm-item-tag" style="background:rgba(139,92,246,.12);color:#a78bfa;">×${owned}</span>`;
    return `<div class="bm-item-card">
      <div class="bm-item-info">
        <div class="bm-item-name">${esc(item.name)}</div>
        <div class="bm-item-desc">${esc(item.desc)}</div>
        <div class="bm-item-tags">${tags}</div>
      </div>
      <div class="bm-item-right">
        <div class="bm-item-price">💰 ${item.price}</div>
        <button class="bm-btn-buy" data-cat="${catId}" data-item="${item.id}"${canBuy ? '' : ' disabled'}>Купить</button>
      </div>
    </div>`;
  }).join('');
}

function renderInventory() {
  const inv = cfg().inventory;
  if (!inv.length) return `<div class="bm-empty">🎒<br>Инвентарь пуст<br><span style="font-size:11px;opacity:.5;margin-top:4px;display:block;">Загляни в магазин!</span></div>`;
  return inv.map((entry, idx) => {
    const item = getItem(entry.catId, entry.itemId);
    if (!item) return '';
    const cat = CATALOG[entry.catId];
    const canUse = item.effectDuration > 0 || item.addictionRate > 0 || item.effectDesc;
    return `<div class="bm-inv-row">
      <span style="font-size:20px">${cat?.icon || '📦'}</span>
      <div class="bm-inv-info">
        <div class="bm-inv-name">${esc(item.name)}</div>
        <div class="bm-inv-cat">${esc(cat?.name || '')}</div>
      </div>
      <span class="bm-inv-qty">×${entry.qty}</span>
      <div class="bm-inv-acts">
        ${canUse ? `<button class="bm-btn-use" data-idx="${idx}">Применить</button>` : ''}
        <button class="bm-btn-drop" data-idx="${idx}">✕</button>
      </div>
    </div>`;
  }).join('');
}

function renderAddictions() {
  const adds = cfg().addictions;
  const cats = Object.keys(adds).filter(k => adds[k] > 0).sort((a,b) => adds[b] - adds[a]);
  if (!cats.length) return `<div class="bm-empty">🩺<br>Зависимостей нет<br><span style="font-size:11px;opacity:.5;margin-top:4px;display:block;">Пока всё чисто...</span></div>`;
  return cats.map(catId => {
    const level = adds[catId];
    const cat   = CATALOG[catId];
    const lb    = addictionLabel(level);
    return `<div class="bm-add-row">
      <span class="bm-add-name">${cat?.icon || ''} ${esc(cat?.name || catId)}</span>
      <div class="bm-add-track"><div class="bm-add-fill" style="width:${level}%;background:${lb.color}"></div></div>
      <span class="bm-add-pct" style="color:${lb.color}">${level}%</span>
      <span class="bm-add-label">${lb.icon} ${lb.text}</span>
    </div>`;
  }).join('');
}

function bindPanelEvents(panel) {
  // Табы
  panel.querySelectorAll('.bm-tab').forEach(el => {
    el.addEventListener('click', () => {
      state.tab = el.dataset.tab;
      if (state.tab === 'shop') { state.view = 'main'; state.catId = null; }
      renderPanel();
    });
  });
  // Закрыть / назад
  panel.querySelector('#bm-close')?.addEventListener('click', closePanel);
  panel.querySelector('#bm-back')?.addEventListener('click', () => {
    state.view = 'main'; state.catId = null; renderPanel();
  });
  // Категории
  panel.querySelectorAll('.bm-cat-card').forEach(el => {
    el.addEventListener('click', () => { state.view = 'category'; state.catId = el.dataset.cat; renderPanel(); });
  });
  // Купить
  panel.querySelectorAll('.bm-btn-buy').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); buyItem(el.dataset.cat, el.dataset.item); });
  });
  // Применить
  panel.querySelectorAll('.bm-btn-use').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); useItem(+el.dataset.idx); });
  });
  // Выбросить
  panel.querySelectorAll('.bm-btn-drop').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); dropItem(+el.dataset.idx); });
  });
}

/* ═══════════════════════════════════════════════════════════
   ДЕЙСТВИЯ
═══════════════════════════════════════════════════════════ */
function buyItem(catId, itemId) {
  const c = cfg(), item = getItem(catId, itemId);
  if (!item || c.balance < item.price) { toast('warning', 'Недостаточно средств!'); return; }
  c.balance -= item.price;
  c.totalSpent = (c.totalSpent || 0) + item.price;
  const ex = getInvEntry(catId, itemId);
  if (ex) ex.qty++;
  else c.inventory.push({ itemId, catId, qty: 1, boughtAt: Date.now() });
  saveSettingsDebounced();
  pulseWidget(); updateBadge(); renderPanel(); syncSettings();
  popupToast('💰 Куплено!', item.name, `Списано: ${item.price} | Баланс: ${c.balance}`);
  toast('success', item.name + ' куплен(а)!');
}

function useItem(idx) {
  const c = cfg(), entry = c.inventory[idx];
  if (!entry) return;
  const item = getItem(entry.catId, entry.itemId);
  if (!item) return;

  entry.qty--;
  if (entry.qty <= 0) c.inventory.splice(idx, 1);

  if (item.effectDuration > 0 || item.effectDesc) {
    const ex = c.activeEffects.find(e => e.itemId === item.id && e.catId === entry.catId);
    if (ex) ex.turnsLeft = Math.max(ex.turnsLeft, item.effectDuration);
    else c.activeEffects.push({ itemId: item.id, catId: entry.catId, turnsLeft: item.effectDuration || 1, effectDesc: item.effectDesc });
  }

  if (item.addictionRate > 0) setAddiction(entry.catId, getAddiction(entry.catId) + item.addictionRate);

  if (cfg().applyMode === 'visible') sendVisibleUse(item);

  saveSettingsDebounced(); updatePromptInjection();
  updateBadge(); renderPanel(); syncSettings();
  popupToast('✅ Применено!', item.name, item.effectDuration > 0 ? `Эффект: ${item.effectDuration} ходов` : '');
  toast('info', item.name + ' применён(а)!');
}

function dropItem(idx) {
  const c = cfg(), entry = c.inventory[idx];
  if (!entry) return;
  const item = getItem(entry.catId, entry.itemId);
  entry.qty--;
  if (entry.qty <= 0) c.inventory.splice(idx, 1);
  saveSettingsDebounced(); updateBadge(); renderPanel(); syncSettings();
  toast('info', (item?.name || 'Предмет') + ' выброшен');
}

function sendVisibleUse(item) {
  try {
    const ctx = SillyTavern?.getContext?.();
    if (!ctx) return;
    const msg = `*достаёт ${item.name} и применяет*`;
    if (typeof ctx.sendMessage === 'function') ctx.sendMessage(msg);
    else if (typeof ctx.sendSystemMessage === 'function') ctx.sendSystemMessage('generic', msg);
  } catch {}
}

/* ═══════════════════════════════════════════════════════════
   ПРОМПТ
═══════════════════════════════════════════════════════════ */
function buildPrompt() {
  const c = cfg();
  if (!c.isEnabled) return '';
  const parts = ['[OOC — BLACK MARKET SYSTEM]'];

  const effects = (c.activeEffects || []).filter(e => e.turnsLeft > 0);
  if (effects.length) {
    parts.push('\nACTIVE EFFECTS on the player character:');
    effects.forEach(e => {
      const item = getItem(e.catId, e.itemId);
      parts.push(`- ${item?.name || e.itemId}: ${e.effectDesc || 'активен'} (осталось ходов: ${e.turnsLeft})`);
    });
    parts.push('Portray the player character accordingly — reflect these effects naturally in RP.');
  }

  const carried = (c.inventory || []).filter(en => {
    const it = getItem(en.catId, en.itemId);
    return it && !it.effectDuration;
  });
  if (carried.length) {
    parts.push('\nPLAYER CURRENTLY CARRIES:');
    carried.forEach(en => {
      const it = getItem(en.catId, en.itemId);
      if (it) parts.push(`- ${it.name} ×${en.qty}: ${it.effectDesc || ''}`);
    });
  }

  const withdrawals = Object.entries(c.addictions)
    .map(([catId, level]) => withdrawalText(catId, level))
    .filter(Boolean);
  if (withdrawals.length) {
    parts.push('\nWITHDRAWAL / ADDICTION EFFECTS — portray these symptoms:');
    withdrawals.forEach(w => parts.push('- ' + w));
  }

  if (parts.length <= 1) return '';
  parts.push('\n[/OOC]');
  return parts.join('\n');
}

function updatePromptInjection() {
  try {
    setExtensionPrompt(PROMPT_KEY, cfg().isEnabled ? buildPrompt() : '', extension_prompt_types.IN_CHAT, 0);
  } catch {}
}

/* ═══════════════════════════════════════════════════════════
   СООБЩЕНИЯ
═══════════════════════════════════════════════════════════ */
function onMessageReceived() {
  const c = cfg();
  if (!c.isEnabled) return;

  c.balance += c.earnPerMessage;
  c.totalEarned = (c.totalEarned || 0) + c.earnPerMessage;

  c.activeEffects = (c.activeEffects || [])
    .map(e => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter(e => e.turnsLeft > 0);

  const decay = c.addictionDecay || 2;
  for (const catId of Object.keys(c.addictions)) {
    const hasActive = c.activeEffects.some(e => e.catId === catId);
    if (!hasActive) c.addictions[catId] = Math.max(0, (c.addictions[catId] || 0) - decay);
  }

  saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettings();
}

function onMessageSent() { updatePromptInjection(); }

/* ═══════════════════════════════════════════════════════════
   ПАНЕЛЬ НАСТРОЕК
═══════════════════════════════════════════════════════════ */
function settingsPanelHTML() {
  const c = cfg();
  return `<div id="bm-settings-panel" class="extension-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>🏴‍☠️ Black Market</b>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">

      <div class="bm-s-row">
        <label class="checkbox_label" for="bm-enabled">
          <input type="checkbox" id="bm-enabled"${c.isEnabled ? ' checked' : ''}>
          <span>Включено</span>
        </label>
      </div>
      <div class="bm-s-row">
        <label class="checkbox_label" for="bm-widget-vis">
          <input type="checkbox" id="bm-widget-vis"${c.widgetVisible ? ' checked' : ''}>
          <span>Показывать виджет</span>
        </label>
      </div>

      <div class="bm-s-sec">Баланс</div>
      <div class="bm-s-hint">Текущий баланс, начальный и сколько зарабатывается за каждый ответ бота.</div>
      <div class="bm-s-row">
        <span class="bm-s-lbl">Баланс:</span>
        <input type="number" id="bm-balance" class="bm-s-inp" value="${c.balance}">
        <button id="bm-reset-balance" class="menu_button">Сбросить</button>
      </div>
      <div class="bm-s-row">
        <span class="bm-s-lbl">Начальный:</span>
        <input type="number" id="bm-start-bal" class="bm-s-inp" value="${c.startBalance}">
      </div>
      <div class="bm-s-row">
        <span class="bm-s-lbl">За ответ:</span>
        <input type="number" id="bm-earn" class="bm-s-inp" value="${c.earnPerMessage}">
      </div>

      <div class="bm-s-sec">Режим применения</div>
      <div class="bm-s-hint">«Скрытый» — бот узнаёт через скрытый промпт. «Видимый» — отправляет сообщение в чат.</div>
      <div class="bm-s-row">
        <select id="bm-apply-mode" class="bm-s-sel">
          <option value="silent"${c.applyMode === 'silent' ? ' selected' : ''}>🔇 Скрытый (через промпт)</option>
          <option value="visible"${c.applyMode === 'visible' ? ' selected' : ''}>💬 Видимый (сообщение в чат)</option>
        </select>
      </div>

      <div class="bm-s-sec">Зависимости</div>
      <div class="bm-s-hint">Спад зависимости за каждый ход без приёма вещества.</div>
      <div class="bm-s-row">
        <span class="bm-s-lbl">Спад/ход:</span>
        <input type="number" id="bm-decay" class="bm-s-inp" min="0" max="20" value="${c.addictionDecay || 2}">
      </div>
      <div class="bm-s-row">
        <button id="bm-reset-addictions" class="menu_button">Сбросить зависимости</button>
      </div>

      <div class="bm-s-sec">Виджет</div>
      <div class="bm-s-row">
        <span class="bm-s-lbl">Размер:</span>
        <input type="range" id="bm-wsize" min="36" max="80" step="2" value="${c.widgetSize || 52}" style="flex:1;accent-color:#8b5cf6;">
        <span id="bm-wsize-label" style="font-size:12px;min-width:36px;text-align:right;opacity:.5;">${c.widgetSize || 52}px</span>
      </div>
      <div class="bm-s-row">
        <button id="bm-reset-pos" class="menu_button">Сбросить позицию</button>
      </div>

      <div class="bm-s-sec">Данные</div>
      <div class="bm-s-row">
        <button id="bm-clear-inv" class="menu_button">Очистить инвентарь</button>
        <button id="bm-reset-all" class="menu_button" style="background:rgba(239,68,68,.15);color:#ef4444;">Сбросить всё</button>
      </div>

      <div class="bm-s-sec">Статистика</div>
      <div class="bm-s-hint" id="bm-stats">
        Потрачено: ${c.totalSpent || 0} | Заработано: ${c.totalEarned || 0} | Предметов: ${c.inventory.reduce((s,i)=>s+i.qty,0)}
      </div>

    </div>
  </div>
</div>`;
}

function syncSettings() {
  const c = cfg();
  const b = document.getElementById('bm-balance');
  if (b && document.activeElement !== b) b.value = c.balance;
  const st = document.getElementById('bm-stats');
  if (st) st.textContent = `Потрачено: ${c.totalSpent||0} | Заработано: ${c.totalEarned||0} | Предметов: ${c.inventory.reduce((s,i)=>s+i.qty,0)}`;
}

function bindSettingsEvents() {
  const $ = jQuery;
  $(document).off('.bm');

  $(document).on('change.bm', '#bm-enabled', function() {
    cfg().isEnabled = this.checked; saveSettingsDebounced(); updatePromptInjection();
    const w = document.getElementById('bm-widget');
    if (w) w.style.display = (cfg().widgetVisible && cfg().isEnabled) ? '' : 'none';
  });
  $(document).on('change.bm', '#bm-widget-vis', function() {
    cfg().widgetVisible = this.checked; saveSettingsDebounced();
    const w = document.getElementById('bm-widget');
    if (w) w.style.display = (this.checked && cfg().isEnabled) ? '' : 'none';
  });
  $(document).on('change.bm', '#bm-balance', function() {
    cfg().balance = Math.max(0, parseInt(this.value) || 0); saveSettingsDebounced();
  });
  $(document).on('change.bm', '#bm-start-bal', function() {
    cfg().startBalance = Math.max(0, parseInt(this.value) || 500); saveSettingsDebounced();
  });
  $(document).on('change.bm', '#bm-earn', function() {
    cfg().earnPerMessage = Math.max(0, parseInt(this.value) || 0); saveSettingsDebounced();
  });
  $(document).on('change.bm', '#bm-apply-mode', function() {
    cfg().applyMode = this.value; saveSettingsDebounced();
  });
  $(document).on('change.bm', '#bm-decay', function() {
    cfg().addictionDecay = Math.max(0, parseInt(this.value) || 2); saveSettingsDebounced();
  });
  $(document).on('input.bm', '#bm-wsize', function() {
    const sz = parseInt(this.value);
    const lb = document.getElementById('bm-wsize-label');
    if (lb) lb.textContent = sz + 'px';
    cfg().widgetSize = sz; saveSettingsDebounced();
    const btn = document.getElementById('bm-btn');
    if (btn) btn.style.width = btn.style.height = sz + 'px';
  });
  $(document).on('click.bm', '#bm-reset-balance', () => {
    cfg().balance = cfg().startBalance; saveSettingsDebounced(); syncSettings();
    toast('info', 'Баланс сброшен на ' + cfg().startBalance);
  });
  $(document).on('click.bm', '#bm-reset-pos', () => {
    cfg().widgetPos = null; saveSettingsDebounced();
    const w = document.getElementById('bm-widget');
    if (w) { w.style.top = 'auto'; w.style.bottom = '90px'; w.style.left = 'auto'; w.style.right = '16px'; }
    toast('info', 'Позиция виджета сброшена');
  });
  $(document).on('click.bm', '#bm-reset-addictions', () => {
    cfg().addictions = {}; saveSettingsDebounced(); updatePromptInjection();
    toast('info', 'Зависимости сброшены');
  });
  $(document).on('click.bm', '#bm-clear-inv', () => {
    cfg().inventory = []; cfg().activeEffects = []; saveSettingsDebounced();
    updatePromptInjection(); updateBadge(); syncSettings();
    toast('info', 'Инвентарь очищен');
  });
  $(document).on('click.bm', '#bm-reset-all', () => {
    const d = structuredClone(DEFAULT);
    Object.entries(d).forEach(([k,v]) => cfg()[k] = structuredClone(v));
    saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettings();
    const btn = document.getElementById('bm-btn');
    if (btn) btn.style.width = btn.style.height = '52px';
    toast('info', 'Все данные сброшены');
  });
}

/* ═══════════════════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════ */
jQuery(() => {
  try {
    if (!extension_settings[EXT]) extension_settings[EXT] = structuredClone(DEFAULT);
    const c = cfg();
    Object.entries(DEFAULT).forEach(([k,v]) => { if (c[k] === undefined) c[k] = structuredClone(v); });
    if (!Array.isArray(c.inventory))     c.inventory     = [];
    if (!Array.isArray(c.activeEffects)) c.activeEffects = [];
    if (typeof c.addictions !== 'object' || !c.addictions) c.addictions = {};

    $('#extensions_settings').append(settingsPanelHTML());
    createWidget();
    bindSettingsEvents();
    updatePromptInjection();

    eventSource.on(event_types.MESSAGE_SENT,     onMessageSent);
    eventSource.on(event_types.MESSAGE_RECEIVED,  onMessageReceived);
    if (event_types.CHAT_CHANGED) {
      eventSource.on(event_types.CHAT_CHANGED, () => { syncSettings(); updatePromptInjection(); });
    }
  } catch(e) {
    toast('error', 'Black Market: ошибка инициализации — ' + e.message);
  }
});
