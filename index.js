import { eventSource, event_types, saveSettingsDebounced, setExtensionPrompt, extension_prompt_types } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';

const EXT_NAME = 'black-market';
const PROMPT_KEY = EXT_NAME + '_injection';

/* ═══════════════════════════════════════════
   КАТАЛОГ ТОВАРОВ
   ═══════════════════════════════════════════ */
const CATALOG = {
  drugs: {
    name: 'Наркотики', icon: '💊', color: '#a855f7',
    items: [
      { id: 'weed',        name: 'Марихуана',     price: 50,   desc: 'Вызывает расслабление и лёгкую эйфорию.',           addictionRate: 8,  effectDuration: 3, effectDesc: 'расслаблен, слегка заторможен, улыбается без причины' },
      { id: 'cocaine',     name: 'Кокаин',        price: 200,  desc: 'Мощный стимулятор. Резкий прилив энергии.',          addictionRate: 18, effectDuration: 2, effectDesc: 'гиперактивен, самоуверен, зрачки расширены, говорит быстро' },
      { id: 'heroin',      name: 'Героин',        price: 300,  desc: 'Сильнейший опиоид. Полная эйфория.',                addictionRate: 30, effectDuration: 4, effectDesc: 'в состоянии блаженной апатии, реакции замедлены, зрачки-точки' },
      { id: 'ecstasy',     name: 'Экстази (MDMA)', price: 150, desc: 'Эмпатоген. Усиливает чувства и тактильность.',      addictionRate: 12, effectDuration: 4, effectDesc: 'крайне общителен, тактилен, испытывает эмпатию ко всему' },
      { id: 'lsd',         name: 'ЛСД',           price: 120,  desc: 'Психоделик. Искажает восприятие реальности.',        addictionRate: 5,  effectDuration: 6, effectDesc: 'галлюцинирует, видит узоры и цвета, восприятие искажено' },
      { id: 'amphetamine', name: 'Амфетамин',     price: 100,  desc: 'Стимулятор ЦНС. Бодрость на часы.',                 addictionRate: 15, effectDuration: 4, effectDesc: 'бодр, сосредоточен, не чувствует голода и усталости' },
      { id: 'meth',        name: 'Метамфетамин',  price: 250,  desc: 'Мощнейший стимулятор с тяжёлыми последствиями.',     addictionRate: 28, effectDuration: 5, effectDesc: 'маниакально энергичен, параноидален, зрачки огромные' },
    ]
  },
  rare_drugs: {
    name: 'Редкие наркотики', icon: '🧬', color: '#c084fc',
    items: [
      { id: 'dmt',         name: 'DMT',                  price: 500,  desc: 'Молекула духа. Кратковременный мощный трип.',     addictionRate: 4,  effectDuration: 1, effectDesc: 'переживает мистический опыт, видит иные миры' },
      { id: 'mescaline',   name: 'Мескалин',             price: 400,  desc: 'Из кактуса пейот. Глубокий психоделик.',          addictionRate: 5,  effectDuration: 6, effectDesc: 'видит живые узоры, философствует, время искажено' },
      { id: 'shrooms',     name: 'Псилоцибиновые грибы', price: 180,  desc: 'Магические грибы. Мягкий психоделический трип.',  addictionRate: 3,  effectDuration: 4, effectDesc: 'смеётся без причины, видит дыхание предметов, эмоционален' },
      { id: 'opium',       name: 'Опиум',                price: 350,  desc: 'Классический наркотик. Тягучая эйфория.',         addictionRate: 22, effectDuration: 5, effectDesc: 'в блаженном полусне, расслаблен до предела, мечтателен' },
      { id: 'ayahuasca',   name: 'Аяуаска',              price: 600,  desc: 'Шаманский напиток. Глубокое духовное путешествие.',addictionRate: 2,  effectDuration: 5, effectDesc: 'переживает видения, очищение, возможна тошнота и слёзы' },
      { id: 'adrenochrome', name: 'Адренохром',           price: 900,  desc: 'Легендарное вещество. Эффект непредсказуем.',     addictionRate: 10, effectDuration: 3, effectDesc: 'в состоянии изменённого сознания, непредсказуемые вспышки эмоций' },
    ]
  },
  weapons: {
    name: 'Оружие', icon: '🔫', color: '#ef4444',
    items: [
      { id: 'knife',       name: 'Нож',           price: 80,   desc: 'Складной нож. Компактный и смертоносный.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе нож — может использовать как угрозу или оружие' },
      { id: 'pistol',      name: 'Пистолет',      price: 500,  desc: 'Полуавтомат. 15 патронов в обойме.',           addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён пистолетом — это меняет баланс сил' },
      { id: 'shotgun',     name: 'Дробовик',      price: 800,  desc: 'Разрушительная сила на близкой дистанции.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет дробовик — внушает страх одним видом' },
      { id: 'rifle',       name: 'Автомат',       price: 1500, desc: 'Полный автомат. Армейское оружие.',            addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён автоматом — крайне опасен' },
      { id: 'brass',       name: 'Кастет',        price: 60,   desc: 'Латунный кастет. Усиливает удар вчетверо.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кастет — удары рук значительно сильнее' },
      { id: 'taser',       name: 'Электрошокер',  price: 200,  desc: 'Обездвиживает цель электричеством.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет электрошокер — может парализовать' },
      { id: 'katana',      name: 'Катана',        price: 1200, desc: 'Японский клинок. Смертоносная элегантность.',   addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён катаной — владеет смертоносным клинком' },
    ]
  },
  alcohol: {
    name: 'Алкоголь', icon: '🍷', color: '#f59e0b',
    items: [
      { id: 'beer',        name: 'Пиво',          price: 15,   desc: 'Холодное пиво. Лёгкое опьянение.',             addictionRate: 3,  effectDuration: 2, effectDesc: 'слегка навеселе, расслаблен' },
      { id: 'vodka',       name: 'Водка',         price: 50,   desc: 'Классика. 40 градусов решимости.',              addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, речь невнятная, раскрепощён' },
      { id: 'whiskey',     name: 'Виски',         price: 120,  desc: 'Выдержанный виски. Обжигает и согревает.',       addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, самоуверен, чуть агрессивен' },
      { id: 'absinthe',    name: 'Абсент',        price: 150,  desc: 'Зелёная фея. 70 градусов и туйон.',             addictionRate: 10, effectDuration: 4, effectDesc: 'сильно пьян, возможны лёгкие галлюцинации, дерзок' },
      { id: 'moonshine',   name: 'Самогон',       price: 30,   desc: 'Домашний первач. Непредсказуемый градус.',       addictionRate: 6,  effectDuration: 3, effectDesc: 'пьян, может плохо себя чувствовать, непредсказуем' },
      { id: 'wine',        name: 'Вино',          price: 80,   desc: 'Красное вино. Романтика и расслабление.',        addictionRate: 4,  effectDuration: 2, effectDesc: 'приятно захмелел, романтично настроен' },
    ]
  },
  medications: {
    name: 'Медикаменты', icon: '💉', color: '#06b6d4',
    items: [
      { id: 'painkillers', name: 'Обезболивающее', price: 40,   desc: 'Снимает любую боль. Возможна сонливость.',      addictionRate: 10, effectDuration: 3, effectDesc: 'не чувствует боли, слегка заторможен' },
      { id: 'antidepressants', name: 'Антидепрессанты', price: 80, desc: 'Выравнивают настроение. Эффект постепенный.', addictionRate: 12, effectDuration: 5, effectDesc: 'эмоции притуплены, стабильное ровное настроение' },
      { id: 'sleeping',    name: 'Снотворное',    price: 60,   desc: 'Мгновенный крепкий сон.',                        addictionRate: 14, effectDuration: 3, effectDesc: 'сонлив, может отключиться в любой момент' },
      { id: 'adrenaline',  name: 'Адреналин',     price: 200,  desc: 'Инъекция чистого адреналина. Экстренная бодрость.',addictionRate: 5, effectDuration: 1, effectDesc: 'в состоянии боевой готовности, сердце колотится, зрение острое' },
      { id: 'morphine',    name: 'Морфин',        price: 250,  desc: 'Сильнейшее обезболивающее. Опасно привыкание.',   addictionRate: 25, effectDuration: 4, effectDesc: 'в состоянии полного безразличия к боли, эйфория, зрачки сужены' },
      { id: 'steroids',    name: 'Стероиды',      price: 300,  desc: 'Анаболики. Сила и агрессия.',                     addictionRate: 8,  effectDuration: 5, effectDesc: 'чувствует прилив силы, агрессивен, мышцы напряжены' },
    ]
  },
  poisons: {
    name: 'Яды', icon: '☠️', color: '#84cc16',
    items: [
      { id: 'cyanide',     name: 'Цианид',        price: 400,  desc: 'Смерть в считанные минуты. Запах миндаля.',      addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе смертельный яд — цианид' },
      { id: 'arsenic',     name: 'Мышьяк',        price: 300,  desc: 'Классический яд. Действует постепенно.',         addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе мышьяк — медленный яд' },
      { id: 'ricin',       name: 'Рицин',         price: 600,  desc: 'Биологический яд. Без противоядия.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе рицин — смертельный биотоксин' },
      { id: 'snake_venom', name: 'Яд змеи',       price: 350,  desc: 'Нейротоксин. Паралич и остановка дыхания.',       addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе змеиный яд' },
      { id: 'nightshade',  name: 'Белладонна',    price: 200,  desc: 'Красавка. Галлюцинации и смерть.',                addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе экстракт белладонны' },
      { id: 'chloroform',  name: 'Хлороформ',     price: 250,  desc: 'Отключает сознание. Действует быстро.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе хлороформ — может усыпить кого угодно' },
    ]
  },
  explosives: {
    name: 'Взрывчатка', icon: '💣', color: '#f97316',
    items: [
      { id: 'grenade',     name: 'Граната',       price: 400,  desc: 'Осколочная граната. Радиус поражения 15м.',       addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе гранату — одно движение и взрыв' },
      { id: 'dynamite',    name: 'Динамит',       price: 500,  desc: 'Классическая взрывчатка. Мощная.',                addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе динамит' },
      { id: 'c4',          name: 'C4',            price: 1000, desc: 'Пластичная взрывчатка. Профессиональный снос.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе C4 — пластичную взрывчатку' },
      { id: 'molotov',     name: 'Коктейль Молотова', price: 100, desc: 'Бутылка с горючей смесью. Поджигает всё.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе коктейль Молотова' },
      { id: 'detonator',   name: 'Детонатор',     price: 300,  desc: 'Дистанционный детонатор. Для подрыва зарядов.',   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе дистанционный детонатор' },
      { id: 'flashbang',   name: 'Светошумовая',  price: 250,  desc: 'Ослепляет и оглушает. Нелетальная.',              addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе светошумовую гранату' },
    ]
  },
  contraband: {
    name: 'Контрабанда', icon: '📦', color: '#78716c',
    items: [
      { id: 'fake_docs',   name: 'Фальшивые документы', price: 500, desc: 'Паспорт, права — любая личность.',          addictionRate: 0, effectDuration: 0, effectDesc: 'имеет фальшивые документы — может выдать себя за другого' },
      { id: 'jewels',      name: 'Краденые драгоценности', price: 800, desc: 'Ворованные камни и золото.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет краденые драгоценности — может подкупить или продать' },
      { id: 'banned_books', name: 'Запрещённые книги', price: 200, desc: 'Тексты, которых не должно существовать.',    addictionRate: 0, effectDuration: 0, effectDesc: 'владеет запрещёнными знаниями из тайных книг' },
      { id: 'spy_gear',    name: 'Шпионское оборудование', price: 600, desc: 'Жучки, камеры, дешифраторы.',            addictionRate: 0, effectDuration: 0, effectDesc: 'оснащён шпионским оборудованием — может прослушивать и следить' },
      { id: 'lockpicks',   name: 'Отмычки',       price: 150,  desc: 'Профессиональный набор для вскрытия замков.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет отмычки — может вскрыть почти любой замок' },
      { id: 'body_armor',  name: 'Бронежилет',    price: 700,  desc: 'Скрытый бронежилет. Защита от пуль.',             addictionRate: 0, effectDuration: 0, effectDesc: 'носит скрытый бронежилет — защищён от пуль' },
    ]
  },
  magic: {
    name: 'Магические предметы', icon: '✨', color: '#8b5cf6',
    items: [
      { id: 'amulet',      name: 'Амулет защиты',      price: 300,  desc: 'Магическая защита от тёмных сил.',            addictionRate: 0, effectDuration: 0, effectDesc: 'носит амулет защиты — ощущается магическая аура' },
      { id: 'scroll',      name: 'Свиток заклинания',   price: 400,  desc: 'Одноразовое мощное заклинание.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет магический свиток — может применить заклинание' },
      { id: 'crystal',     name: 'Магический кристалл', price: 500,  desc: 'Концентрирует магическую энергию.',           addictionRate: 3, effectDuration: 0, effectDesc: 'владеет магическим кристаллом — чувствует потоки энергии' },
      { id: 'cursed_doll', name: 'Проклятая кукла',     price: 350,  desc: 'Кукла вуду. Связывает с целью.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет проклятую куклу вуду — может наложить проклятие' },
      { id: 'runes',       name: 'Руны',                price: 250,  desc: 'Древние руны. Предсказание и магия.',         addictionRate: 0, effectDuration: 0, effectDesc: 'владеет древними рунами — может прорицать или наводить чары' },
      { id: 'necronomicon', name: 'Некрономикон',       price: 1500, desc: 'Книга мёртвых. Запретное знание.',            addictionRate: 5, effectDuration: 0, effectDesc: 'изучает Некрономикон — тёмное знание меняет его' },
    ]
  },
  potions: {
    name: 'Зелья', icon: '🧪', color: '#10b981',
    items: [
      { id: 'health_pot',  name: 'Зелье здоровья',      price: 100,  desc: 'Восстанавливает силы и лечит раны.',         addictionRate: 2,  effectDuration: 2, effectDesc: 'раны затягиваются, чувствует прилив здоровья' },
      { id: 'strength_pot', name: 'Зелье силы',         price: 200,  desc: 'Нечеловеческая сила на время.',               addictionRate: 5,  effectDuration: 3, effectDesc: 'обладает сверхчеловеческой силой, мышцы вздуваются' },
      { id: 'invis_pot',   name: 'Зелье невидимости',   price: 500,  desc: 'Полная невидимость. Растворяешься в воздухе.', addictionRate: 4,  effectDuration: 2, effectDesc: 'невидим — тело прозрачное, можно остаться незамеченным' },
      { id: 'love_pot',    name: 'Приворотное зелье',    price: 300,  desc: 'Вызывает влечение к тому, кто дал.',         addictionRate: 6,  effectDuration: 4, effectDesc: 'под действием приворотного зелья — испытывает сильное влечение' },
      { id: 'forget_pot',  name: 'Зелье забвения',      price: 250,  desc: 'Стирает последние воспоминания.',             addictionRate: 3,  effectDuration: 1, effectDesc: 'теряет последние воспоминания, дезориентирован' },
      { id: 'rage_pot',    name: 'Зелье ярости',        price: 350,  desc: 'Берсерк. Неудержимая агрессия.',              addictionRate: 7,  effectDuration: 2, effectDesc: 'в состоянии берсерка — неконтролируемая ярость, глаза красные' },
    ]
  },
  sexshop: {
    name: 'Секс-шоп', icon: '🔞', color: '#ec4899',
    items: [
      { id: 'handcuffs',   name: 'Наручники',         price: 50,   desc: 'Мягкие наручники с мехом.',                    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет наручники — элемент бондажа' },
      { id: 'whip',        name: 'Плётка',            price: 80,   desc: 'Кожаная плётка. Для игр в доминирование.',      addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кожаную плётку' },
      { id: 'blindfold',   name: 'Повязка на глаза',  price: 30,   desc: 'Шёлковая повязка. Обостряет другие чувства.',   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет шёлковую повязку для глаз' },
      { id: 'rope',        name: 'Верёвки',           price: 40,   desc: 'Мягкие верёвки для шибари.',                    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет набор верёвок для связывания' },
      { id: 'costume',     name: 'Эротический костюм', price: 120, desc: 'Провокационный костюм. Привлекает внимание.',   addictionRate: 0, effectDuration: 0, effectDesc: 'одет в провокационный эротический костюм' },
      { id: 'candles',     name: 'Массажные свечи',   price: 25,   desc: 'Ароматные свечи. Тают в масло для тела.',       addictionRate: 0, effectDuration: 0, effectDesc: 'зажёг массажные свечи — атмосфера интимная' },
      { id: 'aphrodisiac', name: 'Афродизиак',        price: 180,  desc: 'Сильный возбудитель. Повышает либидо.',          addictionRate: 8, effectDuration: 3, effectDesc: 'под действием афродизиака — возбуждение и повышенное либидо' },
      { id: 'collar',      name: 'Ошейник',           price: 90,   desc: 'Кожаный ошейник с поводком.',                   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет ошейник с поводком — элемент подчинения' },
    ]
  }
};

/* ═══════════════════════════════════════════
   НАСТРОЙКИ ПО УМОЛЧАНИЮ
   ═══════════════════════════════════════════ */
const defaultSettings = {
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
  chatData: {},
  totalSpent: 0,
  totalEarned: 0,
};

const cfg = () => extension_settings[EXT_NAME] || (extension_settings[EXT_NAME] = { ...defaultSettings });

function toast(type, msg) {
  try { toastr?.[type]?.(msg, 'Black Market', { timeOut: 2500, positionClass: 'toast-top-center' }); } catch {}
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getItem(catId, itemId) {
  const cat = CATALOG[catId];
  return cat ? cat.items.find(i => i.id === itemId) : null;
}

function getInventoryItem(catId, itemId) {
  return cfg().inventory.find(i => i.itemId === itemId && i.catId === catId) || null;
}

function getAddiction(catId) {
  return cfg().addictions[catId] || 0;
}

function setAddiction(catId, val) {
  cfg().addictions[catId] = Math.max(0, Math.min(100, val));
}

function getAddictionLabel(level) {
  if (level >= 80) return { text: 'Критическая', color: '#ef4444', icon: '🔴' };
  if (level >= 60) return { text: 'Тяжёлая',     color: '#f97316', icon: '🟠' };
  if (level >= 40) return { text: 'Средняя',      color: '#f59e0b', icon: '🟡' };
  if (level >= 20) return { text: 'Лёгкая',       color: '#84cc16', icon: '🟢' };
  if (level > 0)   return { text: 'Минимальная',   color: '#6b7280', icon: '⚪' };
  return { text: 'Нет', color: '#374151', icon: '' };
}

function getWithdrawalText(catId, level) {
  const cat = CATALOG[catId];
  if (!cat || level < 20) return null;
  const name = cat.name.toLowerCase();
  if (level >= 80) return `Тяжелейшая абстиненция от ${name}: тремор, холодный пот, боль во всём теле, не может думать ни о чём другом, готов на всё ради дозы.`;
  if (level >= 60) return `Сильная ломка от ${name}: тошнота, раздражительность, бессонница, навязчивые мысли о ${name}.`;
  if (level >= 40) return `Заметная тяга к ${name}: беспокойство, перепады настроения, периодически думает о ${name}.`;
  return `Лёгкое желание принять ${name}, небольшое беспокойство.`;
}

/* ═══════════════════════════════════════════
   СТИЛИ (без изменений)
   ═══════════════════════════════════════════ */
function injectStyles() {
  if (document.getElementById('bm-styles')) return;
  const style = document.createElement('style');
  style.id = 'bm-styles';
  style.textContent = `/* ... весь ваш CSS без изменений ... */`;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════
   ВИДЖЕТ
   ═══════════════════════════════════════════ */

function clampWidgetToViewport(w) {
  if (!w) return;
  let { left, top } = w.getBoundingClientRect();
  const maxL = window.innerWidth - w.offsetWidth - 4;
  const maxT = window.innerHeight - w.offsetHeight - 4;
  left = Math.max(4, Math.min(maxL, left));
  top  = Math.max(4, Math.min(maxT, top));
  w.style.left   = left + 'px';
  w.style.top    = top + 'px';
  w.style.right  = 'auto';
  w.style.bottom = 'auto';
  if (Math.abs(left - w.getBoundingClientRect().left) > 1 || Math.abs(top - w.getBoundingClientRect().top) > 1) {
    cfg().widgetPos = { left: w.style.left, top: w.style.top };
    saveSettingsDebounced();
  }
}

function createWidget() {
  if (document.getElementById('bm-widget')) return;
  injectStyles();
  const c = cfg();
  const w = document.createElement('div');
  w.id = 'bm-widget';
  w.innerHTML = `
    <button id="bm-open-btn" type="button" aria-label="Открыть чёрный рынок" title="Открыть">☰</button>
    <span class="bm-icon">🏴‍☠️</span>
    <span class="bm-badge" id="bm-inv-badge" style="display:none;">0</span>
  `;
  w.style.display = (c.widgetVisible && c.isEnabled) ? 'flex' : 'none';
  document.body.appendChild(w);

  const sz = c.widgetSize || 52;
  w.style.width = w.style.height = sz + 'px';

  if (c.widgetPos) {
    w.style.left = c.widgetPos.left;
    w.style.top  = c.widgetPos.top;
    w.style.right = w.style.bottom = 'auto';
  }
  clampWidgetToViewport(w);
  window.addEventListener('resize', () => clampWidgetToViewport(w));
  makeDraggable(w);
  updateBadge();

  const btn = w.querySelector('#bm-open-btn');
  btn?.addEventListener('pointerdown', e => {
    e.stopPropagation();
    e.preventDefault();
  }, { passive: false });

  btn?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    toggleShop();
  }, { passive: false });
}

function makeDraggable(w) {
  let drag = false, moved = false, startX, startY, origX, origY;

  const onDown = e => {
    if (e.target.closest('#bm-open-btn')) return;
    const t = e.touches?.[0] || e;
    drag = true;
    moved = false;
    startX = t.clientX;
    startY = t.clientY;
    origX = parseFloat(w.style.left) || 0;
    origY = parseFloat(w.style.top) || 0;
    w.style.transition = 'none';
    if (e.pointerId) w.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onMove = e => {
    if (!drag) return;
    const t = e.touches?.[0] || e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) moved = true;

    if (moved) {
      let newX = origX + dx;
      let newY = origY + dy;
      newX = Math.max(4, Math.min(window.innerWidth - w.offsetWidth - 4, newX));
      newY = Math.max(4, Math.min(window.innerHeight - w.offsetHeight - 4, newY));
      w.style.left = newX + 'px';
      w.style.top  = newY + 'px';
      w.style.right = w.style.bottom = 'auto';
    }
    e.preventDefault();
  };

  const onUp = () => {
    if (!drag) return;
    drag = false;
    w.style.transition = '';
    if (moved) {
      cfg().widgetPos = { left: w.style.left, top: w.style.top };
      saveSettingsDebounced();
    }
  };

  w.addEventListener('pointerdown', onDown, { passive: false });
  w.addEventListener('pointermove',  onMove,  { passive: false });
  w.addEventListener('pointerup',    onUp);
  w.addEventListener('pointercancel', onUp);
}

/* остальной код без изменений (updateBadge, pulseWidget, createOverlay, toggleShop, renderShop и т.д.) */

let lastOpenTime = 0;
let ignoreClicksUntil = 0;

function swallowNextClick() {
  const handler = e => {
    document.removeEventListener('click', handler, true);
    e.preventDefault();
    e.stopPropagation();
  };
  document.addEventListener('click', handler, true);
}

function toggleShop() {
  const now = Date.now();
  if (now < ignoreClicksUntil) return;
  ignoreClicksUntil = now + 600;

  const overlay = document.getElementById('bm-overlay') || createOverlay();

  if (overlay.classList.contains('bm-open')) {
    overlay.classList.remove('bm-open');
  } else {
    shopState = { view: 'main', catId: null, tab: 'shop' };
    renderShop();
    lastOpenTime = now;
    swallowNextClick();
    overlay.classList.add('bm-open');
  }
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'bm-overlay';
  overlay.innerHTML = '<div id="bm-shop"></div>';
  document.body.appendChild(overlay);

  const closeOnBg = e => {
    if (Date.now() - lastOpenTime < 1200) return;
    if (e.target === overlay) {
      overlay.classList.remove('bm-open');
    }
  };

  overlay.addEventListener('click', closeOnBg);
  overlay.addEventListener('pointerup', closeOnBg);

  return overlay;
}

/* ... остальной код (render, buyItem, useItem, prompt injection и т.д.) остаётся без изменений ... */

jQuery(() => {
  // инициализация
  if (!extension_settings[EXT_NAME]) extension_settings[EXT_NAME] = { ...defaultSettings };
  createWidget();
  // ... остальные привязки событий ...
});
