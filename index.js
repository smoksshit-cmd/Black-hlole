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
  applyMode: 'silent', // 'silent' | 'visible'
  inventory: [],        // [ { itemId, catId, qty, boughtAt } ]
  activeEffects: [],    // [ { itemId, catId, turnsLeft, effectDesc } ]
  addictions: {},       // { catId: level(0-100) }
  addictionDecay: 2,
  chatData: {},
  totalSpent: 0,
  totalEarned: 0,
};

const cfg = () => extension_settings[EXT_NAME];

function toast(type, msg) {
  try { if (typeof toastr !== 'undefined') toastr[type]?.(msg, 'Black Market', { timeOut: 2500, positionClass: 'toast-top-center' }); } catch {}
}

function getChatId() {
  try { const x = SillyTavern?.getContext?.() ?? {}; return x.chatId ?? x.chat_metadata?.chat_id ?? '__global__'; }
  catch { return '__global__'; }
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getItem(catId, itemId) {
  const cat = CATALOG[catId]; if (!cat) return null;
  return cat.items.find(i => i.id === itemId) || null;
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
  if (level >= 80) return 'Тяжелейшая абстиненция от ' + name + ': тремор, холодный пот, боль во всём теле, не может думать ни о чём другом, готов на всё ради дозы.';
  if (level >= 60) return 'Сильная ломка от ' + name + ': тошнота, раздражительность, бессонница, навязчивые мысли о ' + name + '.';
  if (level >= 40) return 'Заметная тяга к ' + name + ': беспокойство, перепады настроения, периодически думает о ' + name + '.';
  if (level >= 20) return 'Лёгкое желание принять ' + name + ', небольшое беспокойство.';
  return null;
}

/* ═══════════════════════════════════════════
   СТИЛИ
   ═══════════════════════════════════════════ */
function injectStyles() {
  if (document.getElementById('bm-styles')) return;
  const el = document.createElement('style');
  el.id = 'bm-styles';
  el.textContent = `
/* === Floating Widget === */
#bm-widget {
  position:fixed; bottom:90px; right:16px; top:auto; left:auto;
  width:52px; height:52px; cursor:grab; z-index:999998;
  user-select:none; touch-action:none;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  border:2px solid rgba(139,92,246,.5);
  box-shadow:0 4px 20px rgba(139,92,246,.3);
  transition:box-shadow .25s,transform .25s,border-color .25s;
  -webkit-tap-highlight-color:transparent;
}
#bm-widget:hover { box-shadow:0 6px 30px rgba(139,92,246,.55); border-color:rgba(139,92,246,.8); }
#bm-widget:active { cursor:grabbing; transform:scale(.93); }
#bm-widget .bm-icon { font-size:24px; pointer-events:none; line-height:1; }
#bm-widget .bm-badge {
  position:absolute; top:-4px; right:-4px; min-width:18px; height:18px;
  background:#ef4444; color:#fff; font-size:10px; font-weight:700;
  border-radius:9px; display:flex; align-items:center; justify-content:center;
  padding:0 4px; border:2px solid #1a1a2e; line-height:1;
}
#bm-widget.bm-pulse { animation:bm-pulse .5s ease; }
@keyframes bm-pulse { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }

/* === Shop Overlay === */
#bm-overlay {
  position:fixed; inset:0; z-index:999999;
  background:rgba(0,0,0,.6); backdrop-filter:blur(4px);
  display:flex; align-items:flex-end; justify-content:center;
  opacity:0; pointer-events:none;
  transition:opacity .2s ease;
}
#bm-overlay.bm-open { opacity:1; pointer-events:auto; }

#bm-shop {
  width:100%; max-width:420px; max-height:85vh; min-height:300px;
  background:linear-gradient(180deg,#0f0f1a 0%,#1a1a2e 100%);
  border:1px solid rgba(139,92,246,.25);
  border-bottom:none; border-radius:18px 18px 0 0;
  display:flex; flex-direction:column; overflow:hidden;
  transform:translateY(100%); transition:transform .3s cubic-bezier(.32,.72,.37,1.1);
  box-shadow:0 -8px 40px rgba(0,0,0,.5);
}
#bm-overlay.bm-open #bm-shop { transform:translateY(0); }

/* Header */
.bm-header {
  display:flex; align-items:center; padding:14px 16px 12px; gap:10px;
  border-bottom:1px solid rgba(255,255,255,.06); flex-shrink:0;
  background:rgba(0,0,0,.2);
}
.bm-back-btn {
  width:34px; height:34px; border-radius:50%;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  color:#ccc; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:background .15s,color .15s; flex-shrink:0;
  -webkit-tap-highlight-color:transparent;
}
.bm-back-btn:hover { background:rgba(255,255,255,.12); color:#fff; }
.bm-title { font-size:16px; font-weight:700; color:#e2e8f0; flex:1; }
.bm-balance-chip {
  display:flex; align-items:center; gap:5px;
  background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.25);
  border-radius:20px; padding:5px 12px; font-size:13px; font-weight:600;
  color:#fbbf24; white-space:nowrap;
}

/* Content */
.bm-content { flex:1; overflow-y:auto; padding:10px 12px 16px; -webkit-overflow-scrolling:touch; }

/* Category grid */
.bm-cat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.bm-cat-card {
  display:flex; flex-direction:column; align-items:center; gap:6px;
  padding:16px 8px; border-radius:14px; cursor:pointer;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
  transition:background .15s,border-color .15s,transform .12s;
  -webkit-tap-highlight-color:transparent;
}
.bm-cat-card:hover { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); }
.bm-cat-card:active { transform:scale(.96); }
.bm-cat-icon { font-size:28px; line-height:1; }
.bm-cat-name { font-size:12px; font-weight:600; color:#cbd5e1; text-align:center; line-height:1.3; }
.bm-cat-count { font-size:10px; color:#64748b; }

/* Item list */
.bm-item-card {
  display:flex; gap:10px; padding:12px; margin-bottom:8px;
  border-radius:12px; background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);
  transition:background .15s,border-color .15s;
  -webkit-tap-highlight-color:transparent;
}
.bm-item-card:active { background:rgba(255,255,255,.06); }
.bm-item-info { flex:1; min-width:0; }
.bm-item-name { font-size:14px; font-weight:600; color:#e2e8f0; margin-bottom:2px; }
.bm-item-desc { font-size:11px; color:#94a3b8; line-height:1.4; margin-bottom:6px; }
.bm-item-tags { display:flex; gap:5px; flex-wrap:wrap; }
.bm-item-tag { font-size:9px; padding:2px 7px; border-radius:8px; font-weight:600; line-height:1.4; }
.bm-item-right { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; min-width:72px; }
.bm-item-price { font-size:14px; font-weight:700; color:#fbbf24; white-space:nowrap; }

.bm-buy-btn, .bm-use-btn, .bm-drop-btn {
  padding:6px 14px; border-radius:8px; font-size:11px; font-weight:700;
  border:none; cursor:pointer; transition:opacity .15s,transform .1s;
  -webkit-tap-highlight-color:transparent; white-space:nowrap;
}
.bm-buy-btn { background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; }
.bm-buy-btn:disabled { opacity:.35; cursor:not-allowed; }
.bm-buy-btn:active:not(:disabled) { transform:scale(.94); }
.bm-use-btn { background:linear-gradient(135deg,#10b981,#059669); color:#fff; }
.bm-use-btn:active { transform:scale(.94); }
.bm-drop-btn { background:rgba(239,68,68,.15); color:#ef4444; border:1px solid rgba(239,68,68,.2); }
.bm-drop-btn:active { transform:scale(.94); }

/* Inventory */
.bm-inv-empty { text-align:center; padding:40px 20px; color:#475569; font-size:13px; }
.bm-inv-item {
  display:flex; gap:10px; align-items:center; padding:10px 12px; margin-bottom:6px;
  border-radius:10px; background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);
}
.bm-inv-item-info { flex:1; min-width:0; }
.bm-inv-item-name { font-size:13px; font-weight:600; color:#e2e8f0; }
.bm-inv-item-cat { font-size:10px; color:#64748b; }
.bm-inv-qty { font-size:12px; font-weight:700; color:#a78bfa; min-width:28px; text-align:center; }
.bm-inv-actions { display:flex; gap:5px; }

/* Tabs */
.bm-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,.06); flex-shrink:0; background:rgba(0,0,0,.15); }
.bm-tab {
  flex:1; padding:10px 0; text-align:center; font-size:12px; font-weight:600;
  color:#64748b; cursor:pointer; border-bottom:2px solid transparent;
  transition:color .15s,border-color .15s;
  -webkit-tap-highlight-color:transparent;
}
.bm-tab.bm-active { color:#a78bfa; border-bottom-color:#a78bfa; }
.bm-tab:hover { color:#cbd5e1; }

/* Addiction section */
.bm-addiction-item {
  display:flex; align-items:center; gap:8px; padding:8px 10px; margin-bottom:5px;
  border-radius:8px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04);
}
.bm-addiction-bar-wrap { flex:1; height:6px; border-radius:3px; background:rgba(255,255,255,.06); overflow:hidden; }
.bm-addiction-bar { height:100%; border-radius:3px; transition:width .4s ease; }
.bm-addiction-label { font-size:10px; color:#94a3b8; min-width:50px; text-align:center; }
.bm-addiction-cat { font-size:11px; font-weight:600; color:#cbd5e1; min-width:50px; }
.bm-addiction-pct { font-size:11px; font-weight:700; min-width:32px; text-align:right; }

/* Notification toast */
.bm-toast {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(.8);
  background:rgba(15,15,26,.96); border:1px solid rgba(139,92,246,.4);
  border-radius:16px; padding:20px 28px; z-index:1000001;
  text-align:center; opacity:0; pointer-events:none;
  transition:opacity .25s,transform .25s;
  box-shadow:0 12px 40px rgba(0,0,0,.5);
  max-width:280px;
}
.bm-toast.bm-show { opacity:1; transform:translate(-50%,-50%) scale(1); pointer-events:auto; }
.bm-toast-icon { font-size:36px; margin-bottom:8px; }
.bm-toast-text { font-size:14px; font-weight:600; color:#e2e8f0; line-height:1.4; }
.bm-toast-sub { font-size:11px; color:#64748b; margin-top:4px; }

/* Settings panel */
#bm-settings-panel .bm-s-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
#bm-settings-panel .bm-s-label { font-size:12px; color:var(--SmartThemeBodyColor,#aaa); opacity:.6; min-width:80px; }
#bm-settings-panel .bm-s-input {
  background:var(--input-background-fill,rgba(255,255,255,.04));
  border:1px solid var(--border-color,rgba(255,255,255,.12));
  border-radius:4px; color:var(--SmartThemeBodyColor,#eee);
  padding:4px 8px; font-size:13px; width:80px; text-align:center;
}
#bm-settings-panel .bm-s-select {
  background:var(--input-background-fill,rgba(255,255,255,.04));
  border:1px solid var(--border-color,rgba(255,255,255,.12));
  border-radius:4px; color:var(--SmartThemeBodyColor,#eee);
  padding:4px 8px; font-size:12px; flex:1;
}
#bm-settings-panel .bm-s-section {
  font-size:11px; font-weight:600; letter-spacing:.5px; text-transform:uppercase;
  color:var(--SmartThemeBodyColor,#aaa); opacity:.5;
  margin:14px 0 5px; padding-bottom:4px;
  border-bottom:1px solid var(--border-color,rgba(255,255,255,.08));
}
#bm-settings-panel .bm-s-hint { font-size:11px; color:var(--SmartThemeBodyColor,#aaa); opacity:.35; line-height:1.5; margin-bottom:6px; }

/* Mobile & touch */
@media(max-width:480px) {
  #bm-shop { max-width:100%; border-radius:16px 16px 0 0; max-height:90vh; }
  .bm-cat-grid { grid-template-columns:repeat(2,1fr); gap:8px; }
  .bm-header { padding:12px 12px 10px; }
  .bm-content { padding:8px 10px 14px; }
  #bm-widget { bottom:80px; right:10px; }
}
@media(max-width:360px) {
  .bm-cat-grid { grid-template-columns:repeat(2,1fr); gap:6px; }
  .bm-cat-card { padding:12px 6px; }
  .bm-cat-icon { font-size:24px; }
}
`;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════
   ВИДЖЕТ (Плавающая кнопка)
   ═══════════════════════════════════════════ */

function clampWidgetToViewport(w) {
  if (!w) return;
  const rect = w.getBoundingClientRect();
  let left = rect.left;
  let top = rect.top;

  // If positioned via bottom/right, convert to left/top once so we can clamp
  const computed = window.getComputedStyle(w);
  const hasLeft = computed.left !== 'auto';
  const hasTop = computed.top !== 'auto';

  if (!hasLeft || !hasTop) {
    left = rect.left;
    top = rect.top;
    w.style.left = left + 'px';
    w.style.top = top + 'px';
    w.style.right = 'auto';
    w.style.bottom = 'auto';
  }

  const maxL = Math.max(4, window.innerWidth - w.offsetWidth - 4);
  const maxT = Math.max(4, window.innerHeight - w.offsetHeight - 4);
  const newL = Math.max(4, Math.min(maxL, left));
  const newT = Math.max(4, Math.min(maxT, top));

  w.style.left = newL + 'px';
  w.style.top = newT + 'px';
  w.style.right = 'auto';
  w.style.bottom = 'auto';

  // Persist if something was off-screen
  if (Math.abs(newL - left) > 0.5 || Math.abs(newT - top) > 0.5) {
    cfg().widgetPos = { top: w.style.top, left: w.style.left };
    saveSettingsDebounced();
  }
}

function createWidget() {
  if (document.getElementById('bm-widget')) return;
  injectStyles();
  const c = cfg();
  const w = document.createElement('div');
  w.id = 'bm-widget';
  w.innerHTML = '<span class="bm-icon">🏴‍☠️</span><span class="bm-badge" id="bm-inv-badge" style="display:none;">0</span>';
  w.style.display = (c.widgetVisible && c.isEnabled) ? 'flex' : 'none';
  document.body.appendChild(w);

  const sz = c.widgetSize || 52;
  w.style.width = sz + 'px'; w.style.height = sz + 'px';

  if (c.widgetPos?.top != null) {
    w.style.top = c.widgetPos.top; w.style.bottom = 'auto';
    w.style.left = c.widgetPos.left; w.style.right = 'auto';
  }
  clampWidgetToViewport(w);
  window.addEventListener('resize', () => clampWidgetToViewport(w));
  makeDraggable(w);
  updateBadge();
}

function makeDraggable(w) {
  let drag = false, moved = false, gX = 0, gY = 0, startTime = 0;
  const onDown = (e) => {
    const t = e.touches ? e.touches[0] : e;
    const r = w.getBoundingClientRect();
    gX = t.clientX - r.left; gY = t.clientY - r.top;
    drag = true; moved = false; startTime = Date.now();
    w.style.transition = 'none';
    if (e.type === 'pointerdown') w.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!drag) return;
    const t = e.touches ? e.touches[0] : e;
    if (!moved) {
      const dx = Math.abs(t.clientX - (w.getBoundingClientRect().left + gX));
      const dy = Math.abs(t.clientY - (w.getBoundingClientRect().top + gY));
      if (dx > 5 || dy > 5) moved = true; else return;
    }
    const nL = Math.max(4, Math.min(window.innerWidth - w.offsetWidth - 4, t.clientX - gX));
    const nT = Math.max(4, Math.min(window.innerHeight - w.offsetHeight - 4, t.clientY - gY));
    w.style.left = nL + 'px'; w.style.right = 'auto';
    w.style.top = nT + 'px'; w.style.bottom = 'auto';
    e.preventDefault();
  };
  const onUp = () => {
    if (!drag) return; drag = false;
    w.style.transition = 'box-shadow .25s,transform .25s,border-color .25s';
    if (moved) { cfg().widgetPos = { top: w.style.top, left: w.style.left }; saveSettingsDebounced(); }
    else if (Date.now() - startTime < 300) toggleShop();
  };
  w.addEventListener('pointerdown', onDown);
  w.addEventListener('pointermove', onMove);
  w.addEventListener('pointerup', onUp);
}

function updateBadge() {
  const b = document.getElementById('bm-inv-badge'); if (!b) return;
  const total = cfg().inventory.reduce((s, i) => s + i.qty, 0);
  if (total > 0) { b.textContent = total > 99 ? '99+' : total; b.style.display = 'flex'; }
  else b.style.display = 'none';
}

function pulseWidget() {
  const w = document.getElementById('bm-widget'); if (!w) return;
  w.classList.remove('bm-pulse'); void w.offsetWidth; w.classList.add('bm-pulse');
  w.addEventListener('animationend', () => w.classList.remove('bm-pulse'), { once: true });
}

/* ═══════════════════════════════════════════
   МАГАЗИН (Popup)
   ═══════════════════════════════════════════ */
let shopState = { view: 'main', catId: null, tab: 'shop' }; // main | category | inventory | addictions
// На мобильных после pointer/touch часто прилетает «догоняющий» click.
// Если мы открываем оверлей на tap по виджету, этот click может попасть в фон-оверлей
// и тут же закрыть меню. Поэтому игнорируем фоновые клики короткое окно времени.
let lastShopOpenAt = 0;

// На мобильных часто после pointer/touch прилетает «догоняющий» click.
// Он может закрыть оверлей (или триггернуть глобальные обработчики ST) сразу после открытия.
// Мы «проглатываем» следующий click в capture-фазе, ровно один раз.
let toggleLockUntil = 0;

function swallowNextClickOnce() {
  const h = (e) => {
    // Только один раз
    document.removeEventListener('click', h, true);
    e.preventDefault();
    e.stopPropagation();
  };
  document.addEventListener('click', h, true);
}


function createOverlay() {
  if (document.getElementById('bm-overlay')) return;
  const o = document.createElement('div');
  o.id = 'bm-overlay';
  o.innerHTML = '<div id="bm-shop"></div>';
  document.body.appendChild(o);
  // Закрытие по тапу на фоне (но не сразу после открытия)
  const onBg = (e) => {
    // Защита от «мгновенного закрытия» после открытия по tap
    if (Date.now() - lastShopOpenAt < 900) return;
    if (e.target === o) closeShop();
  };
  o.addEventListener('pointerdown', onBg);
  o.addEventListener('click', onBg);
}

function toggleShop() {
  const now = Date.now();
  // Защита от двойного срабатывания (pointerup + click/другие хендлеры)
  if (now < toggleLockUntil) return;
  toggleLockUntil = now + 450;

  createOverlay();
  const o = document.getElementById('bm-overlay');
  if (o.classList.contains('bm-open')) closeShop();
  else {
    shopState = { view: 'main', catId: null, tab: 'shop' };
    renderShop();
    lastShopOpenAt = Date.now();
    swallowNextClickOnce();
    o.classList.add('bm-open');
  }
}

function closeShop() {
  const o = document.getElementById('bm-overlay'); if (o) o.classList.remove('bm-open');
}

function renderShop() {
  const shop = document.getElementById('bm-shop'); if (!shop) return;
  const c = cfg();
  let header = '', tabs = '', content = '';

  // Header
  const balStr = '💰 ' + c.balance;
  if (shopState.tab === 'shop' && shopState.view === 'main') {
    header = '<div class="bm-header">'
      + '<div class="bm-title">🏴‍☠️ Чёрный рынок</div>'
      + '<div class="bm-balance-chip">' + balStr + '</div>'
      + '<button class="bm-back-btn" id="bm-close-btn" title="Закрыть">✕</button>'
      + '</div>';
  } else if (shopState.tab === 'shop' && shopState.view === 'category') {
    const cat = CATALOG[shopState.catId] || {};
    header = '<div class="bm-header">'
      + '<button class="bm-back-btn" id="bm-back-btn">←</button>'
      + '<div class="bm-title">' + (cat.icon || '') + ' ' + escHtml(cat.name || '') + '</div>'
      + '<div class="bm-balance-chip">' + balStr + '</div>'
      + '</div>';
  } else if (shopState.tab === 'inventory') {
    header = '<div class="bm-header">'
      + '<div class="bm-title">🎒 Инвентарь</div>'
      + '<div class="bm-balance-chip">' + balStr + '</div>'
      + '<button class="bm-back-btn" id="bm-close-btn" title="Закрыть">✕</button>'
      + '</div>';
  } else if (shopState.tab === 'addictions') {
    header = '<div class="bm-header">'
      + '<div class="bm-title">💊 Зависимости</div>'
      + '<button class="bm-back-btn" id="bm-close-btn" title="Закрыть">✕</button>'
      + '</div>';
  }

  // Tabs
  const t = shopState.tab;
  tabs = '<div class="bm-tabs">'
    + '<div class="bm-tab' + (t === 'shop' ? ' bm-active' : '') + '" data-tab="shop">🏪 Магазин</div>'
    + '<div class="bm-tab' + (t === 'inventory' ? ' bm-active' : '') + '" data-tab="inventory">🎒 Инвентарь</div>'
    + '<div class="bm-tab' + (t === 'addictions' ? ' bm-active' : '') + '" data-tab="addictions">🩺 Здоровье</div>'
    + '</div>';

  // Content
  if (t === 'shop') {
    if (shopState.view === 'main') content = renderCategories();
    else if (shopState.view === 'category') content = renderCategoryItems(shopState.catId);
  } else if (t === 'inventory') {
    content = renderInventory();
  } else if (t === 'addictions') {
    content = renderAddictions();
  }

  shop.innerHTML = header + tabs + '<div class="bm-content">' + content + '</div>';
  bindShopEvents();
}

function renderCategories() {
  let html = '<div class="bm-cat-grid">';
  for (const [catId, cat] of Object.entries(CATALOG)) {
    const count = cat.items.length;
    html += '<div class="bm-cat-card" data-cat="' + catId + '">'
      + '<span class="bm-cat-icon">' + cat.icon + '</span>'
      + '<span class="bm-cat-name">' + escHtml(cat.name) + '</span>'
      + '<span class="bm-cat-count">' + count + ' товаров</span>'
      + '</div>';
  }
  html += '</div>';
  return html;
}

function renderCategoryItems(catId) {
  const cat = CATALOG[catId]; if (!cat) return '<div style="text-align:center;color:#475569;">Категория не найдена</div>';
  const c = cfg();
  let html = '';
  cat.items.forEach(item => {
    const canBuy = c.balance >= item.price;
    const invItem = getInventoryItem(catId, item.id);
    const owned = invItem ? invItem.qty : 0;
    const addRate = item.addictionRate;
    let tags = '';
    if (item.effectDuration > 0) tags += '<span class="bm-item-tag" style="background:rgba(16,185,129,.12);color:#34d399;">⏱ ' + item.effectDuration + ' ход.</span>';
    if (addRate > 15) tags += '<span class="bm-item-tag" style="background:rgba(239,68,68,.12);color:#f87171;">⚠ Выс. завис.</span>';
    else if (addRate > 5) tags += '<span class="bm-item-tag" style="background:rgba(245,158,11,.12);color:#fbbf24;">⚡ Завис.</span>';
    if (owned > 0) tags += '<span class="bm-item-tag" style="background:rgba(139,92,246,.12);color:#a78bfa;">×' + owned + '</span>';

    html += '<div class="bm-item-card">'
      + '<div class="bm-item-info">'
      + '<div class="bm-item-name">' + escHtml(item.name) + '</div>'
      + '<div class="bm-item-desc">' + escHtml(item.desc) + '</div>'
      + '<div class="bm-item-tags">' + tags + '</div>'
      + '</div>'
      + '<div class="bm-item-right">'
      + '<div class="bm-item-price">💰 ' + item.price + '</div>'
      + '<button class="bm-buy-btn" data-cat="' + catId + '" data-item="' + item.id + '"' + (canBuy ? '' : ' disabled') + '>Купить</button>'
      + '</div></div>';
  });
  return html;
}

function renderInventory() {
  const inv = cfg().inventory;
  if (!inv.length) return '<div class="bm-inv-empty">🎒<br>Инвентарь пуст<br><span style="font-size:11px;opacity:.5;margin-top:4px;display:block;">Загляни в магазин!</span></div>';
  let html = '';
  inv.forEach((entry, idx) => {
    const item = getItem(entry.catId, entry.itemId);
    if (!item) return;
    const cat = CATALOG[entry.catId];
    const canUse = item.effectDuration > 0 || item.addictionRate > 0 || item.effectDesc;
    html += '<div class="bm-inv-item">'
      + '<span style="font-size:20px;">' + (cat?.icon || '📦') + '</span>'
      + '<div class="bm-inv-item-info">'
      + '<div class="bm-inv-item-name">' + escHtml(item.name) + '</div>'
      + '<div class="bm-inv-item-cat">' + escHtml(cat?.name || '') + '</div>'
      + '</div>'
      + '<span class="bm-inv-qty">×' + entry.qty + '</span>'
      + '<div class="bm-inv-actions">'
      + (canUse ? '<button class="bm-use-btn" data-idx="' + idx + '">Применить</button>' : '')
      + '<button class="bm-drop-btn" data-idx="' + idx + '">✕</button>'
      + '</div></div>';
  });
  return html;
}

function renderAddictions() {
  const adds = cfg().addictions;
  const cats = Object.keys(adds).filter(k => adds[k] > 0);
  if (!cats.length) return '<div class="bm-inv-empty">🩺<br>Зависимостей нет<br><span style="font-size:11px;opacity:.5;margin-top:4px;display:block;">Пока всё чисто...</span></div>';
  let html = '';
  cats.sort((a, b) => adds[b] - adds[a]).forEach(catId => {
    const level = adds[catId];
    const cat = CATALOG[catId];
    const lb = getAddictionLabel(level);
    html += '<div class="bm-addiction-item">'
      + '<span class="bm-addiction-cat">' + (cat?.icon || '') + ' ' + escHtml(cat?.name || catId) + '</span>'
      + '<div class="bm-addiction-bar-wrap"><div class="bm-addiction-bar" style="width:' + level + '%;background:' + lb.color + ';"></div></div>'
      + '<span class="bm-addiction-pct" style="color:' + lb.color + ';">' + level + '%</span>'
      + '<span class="bm-addiction-label">' + lb.icon + ' ' + lb.text + '</span>'
      + '</div>';
  });
  return html;
}

function bindShopEvents() {
  // Tabs
  document.querySelectorAll('#bm-shop .bm-tab').forEach(el => {
    el.addEventListener('click', () => {
      shopState.tab = el.dataset.tab;
      if (el.dataset.tab === 'shop') { shopState.view = 'main'; shopState.catId = null; }
      renderShop();
    });
  });
  // Close
  const closeBtn = document.getElementById('bm-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeShop);
  // Back
  const backBtn = document.getElementById('bm-back-btn');
  if (backBtn) backBtn.addEventListener('click', () => { shopState.view = 'main'; shopState.catId = null; renderShop(); });
  // Category cards
  document.querySelectorAll('#bm-shop .bm-cat-card').forEach(el => {
    el.addEventListener('click', () => { shopState.view = 'category'; shopState.catId = el.dataset.cat; renderShop(); });
  });
  // Buy buttons
  document.querySelectorAll('#bm-shop .bm-buy-btn').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); buyItem(el.dataset.cat, el.dataset.item); });
  });
  // Use buttons
  document.querySelectorAll('#bm-shop .bm-use-btn').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); useItem(parseInt(el.dataset.idx)); });
  });
  // Drop buttons
  document.querySelectorAll('#bm-shop .bm-drop-btn').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); dropItem(parseInt(el.dataset.idx)); });
  });
}

/* ═══════════════════════════════════════════
   ДЕЙСТВИЯ (Покупка / Применение / Выброс)
   ═══════════════════════════════════════════ */
function buyItem(catId, itemId) {
  const c = cfg(), item = getItem(catId, itemId);
  if (!item || c.balance < item.price) { toast('warning', 'Недостаточно средств!'); return; }
  c.balance -= item.price;
  c.totalSpent = (c.totalSpent || 0) + item.price;
  const existing = getInventoryItem(catId, itemId);
  if (existing) existing.qty++;
  else c.inventory.push({ itemId, catId, qty: 1, boughtAt: Date.now() });
  saveSettingsDebounced();
  pulseWidget(); updateBadge(); renderShop(); syncSettingsPanel();
  showItemToast('💰 Куплено!', item.name, 'Списано: ' + item.price + ' | Баланс: ' + c.balance);
  toast('success', item.name + ' куплен(а)!');
}

function useItem(invIdx) {
  const c = cfg(), entry = c.inventory[invIdx];
  if (!entry) return;
  const item = getItem(entry.catId, entry.itemId);
  if (!item) return;

  // Уменьшить кол-во
  entry.qty--;
  if (entry.qty <= 0) c.inventory.splice(invIdx, 1);

  // Добавить эффект
  if (item.effectDuration > 0 || item.effectDesc) {
    // Проверяем, не активен ли уже такой эффект
    const existingEffect = c.activeEffects.find(e => e.itemId === item.id && e.catId === entry.catId);
    if (existingEffect) {
      existingEffect.turnsLeft = Math.max(existingEffect.turnsLeft, item.effectDuration);
    } else {
      c.activeEffects.push({ itemId: item.id, catId: entry.catId, turnsLeft: item.effectDuration || 1, effectDesc: item.effectDesc });
    }
  }

  // Зависимость
  if (item.addictionRate > 0) {
    const cur = getAddiction(entry.catId);
    setAddiction(entry.catId, cur + item.addictionRate);
  }

  saveSettingsDebounced(); updatePromptInjection();
  updateBadge(); renderShop(); syncSettingsPanel();

  // Режим применения
  if (c.applyMode === 'visible') sendVisibleUse(item);

  showItemToast('✅ Применено!', item.name, item.effectDuration > 0 ? 'Эффект: ' + item.effectDuration + ' ходов' : '');
  toast('info', item.name + ' применён(а)!');
}

function dropItem(invIdx) {
  const c = cfg(), entry = c.inventory[invIdx];
  if (!entry) return;
  const item = getItem(entry.catId, entry.itemId);
  entry.qty--;
  if (entry.qty <= 0) c.inventory.splice(invIdx, 1);
  saveSettingsDebounced(); updateBadge(); renderShop(); syncSettingsPanel();
  toast('info', (item?.name || 'Предмет') + ' выброшен');
}

function sendVisibleUse(item) {
  try {
    const ctx = SillyTavern?.getContext?.();
    if (!ctx) return;
    const msg = '*достаёт ' + item.name + ' и применяет*';
    if (typeof ctx.sendMessage === 'function') ctx.sendMessage(msg);
    else if (typeof ctx.sendSystemMessage === 'function') ctx.sendSystemMessage('generic', msg);
  } catch(e) {}
}

function showItemToast(title, name, sub) {
  let t = document.getElementById('bm-item-toast');
  if (!t) { t = document.createElement('div'); t.id = 'bm-item-toast'; t.className = 'bm-toast'; document.body.appendChild(t); }
  t.innerHTML = '<div class="bm-toast-icon">🏴‍☠️</div><div class="bm-toast-text">' + escHtml(title) + '<br>' + escHtml(name) + '</div>' + (sub ? '<div class="bm-toast-sub">' + escHtml(sub) + '</div>' : '');
  t.classList.remove('bm-show'); void t.offsetWidth; t.classList.add('bm-show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('bm-show'), 1800);
}

/* ═══════════════════════════════════════════
   PROMPT INJECTION
   ═══════════════════════════════════════════ */
function buildPrompt() {
  const c = cfg();
  if (!c.isEnabled) return '';
  const parts = [];
  parts.push('[OOC — BLACK MARKET SYSTEM]');

  // Активные эффекты
  const effects = (c.activeEffects || []).filter(e => e.turnsLeft > 0);
  if (effects.length) {
    parts.push('\nACTIVE EFFECTS on the player character:');
    effects.forEach(e => {
      const item = getItem(e.catId, e.itemId);
      parts.push('- ' + (item?.name || e.itemId) + ': ' + (e.effectDesc || 'активен') + ' (осталось ходов: ' + e.turnsLeft + ')');
    });
    parts.push('Portray the player character accordingly — reflect these effects naturally in RP.');
  }

  // Инвентарь (оружие и предметы без длительности — просто «при себе»)
  const carried = (c.inventory || []).filter(entry => {
    const item = getItem(entry.catId, entry.itemId);
    return item && (item.effectDuration === 0 || !item.effectDuration);
  });
  if (carried.length) {
    parts.push('\nPLAYER CURRENTLY CARRIES:');
    carried.forEach(entry => {
      const item = getItem(entry.catId, entry.itemId);
      if (item) parts.push('- ' + item.name + ' ×' + entry.qty + ': ' + (item.effectDesc || ''));
    });
  }

  // Зависимости и ломка
  const withdrawals = [];
  for (const [catId, level] of Object.entries(c.addictions)) {
    const w = getWithdrawalText(catId, level);
    if (w) withdrawals.push(w);
  }
  if (withdrawals.length) {
    parts.push('\nWITHDRAWAL / ADDICTION EFFECTS — portray these symptoms:');
    withdrawals.forEach(w => parts.push('- ' + w));
  }

  if (parts.length <= 1) return ''; // Только заголовок — нечего инжектить
  parts.push('\n[/OOC]');
  return parts.join('\n');
}

function updatePromptInjection() {
  try {
    setExtensionPrompt(PROMPT_KEY, cfg().isEnabled ? buildPrompt() : '', extension_prompt_types.IN_CHAT, 0);
  } catch(e) {}
}

/* ═══════════════════════════════════════════
   ОБРАБОТКА СООБЩЕНИЙ
   ═══════════════════════════════════════════ */
function onMessageReceived() {
  const c = cfg();
  if (!c.isEnabled) return;

  // Начислить баланс за сообщение
  c.balance += c.earnPerMessage;
  c.totalEarned = (c.totalEarned || 0) + c.earnPerMessage;

  // Уменьшить длительность активных эффектов
  c.activeEffects = (c.activeEffects || []).map(e => ({ ...e, turnsLeft: e.turnsLeft - 1 })).filter(e => e.turnsLeft > 0);

  // Decay зависимостей
  const decay = c.addictionDecay || 2;
  for (const catId of Object.keys(c.addictions)) {
    // Проверяем, не использовал ли в этом ходу что-то из этой категории
    const hasActive = (c.activeEffects || []).some(e => e.catId === catId);
    if (!hasActive) {
      c.addictions[catId] = Math.max(0, (c.addictions[catId] || 0) - decay);
    }
  }

  saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettingsPanel();
}

function onMessageSent() {
  updatePromptInjection();
}

/* ═══════════════════════════════════════════
   ПАНЕЛЬ НАСТРОЕК (в меню расширений)
   ═══════════════════════════════════════════ */
function settingsPanelHTML() {
  const c = cfg();
  return '<div id="bm-settings-panel" class="extension-settings">'
    + '<div class="inline-drawer">'
    + '<div class="inline-drawer-toggle inline-drawer-header"><b>🏴‍☠️ Black Market</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>'
    + '<div class="inline-drawer-content">'

    + '<div class="bm-s-row"><label class="checkbox_label" for="bm-enabled"><input type="checkbox" id="bm-enabled"' + (c.isEnabled ? ' checked' : '') + '><span>Включено</span></label></div>'
    + '<div class="bm-s-row"><label class="checkbox_label" for="bm-widget-vis"><input type="checkbox" id="bm-widget-vis"' + (c.widgetVisible ? ' checked' : '') + '><span>Показывать виджет</span></label></div>'

    + '<div class="bm-s-section">Баланс</div>'
    + '<div class="bm-s-hint">Текущий баланс, начальный и сколько получает за каждый ответ бота.</div>'
    + '<div class="bm-s-row"><span class="bm-s-label">Баланс:</span><input type="number" id="bm-balance" class="bm-s-input" value="' + c.balance + '"><button id="bm-reset-balance" class="menu_button">Сбросить</button></div>'
    + '<div class="bm-s-row"><span class="bm-s-label">Начальный:</span><input type="number" id="bm-start-bal" class="bm-s-input" value="' + c.startBalance + '"></div>'
    + '<div class="bm-s-row"><span class="bm-s-label">За ответ:</span><input type="number" id="bm-earn" class="bm-s-input" value="' + c.earnPerMessage + '"></div>'

    + '<div class="bm-s-section">Режим применения</div>'
    + '<div class="bm-s-hint">«Скрытый» — бот узнаёт через скрытый промпт. «Видимый» — отправляет сообщение в чат.</div>'
    + '<div class="bm-s-row"><select id="bm-apply-mode" class="bm-s-select">'
    + '<option value="silent"'  + (c.applyMode === 'silent'  ? ' selected' : '') + '>🔇 Скрытый (через промпт)</option>'
    + '<option value="visible"' + (c.applyMode === 'visible' ? ' selected' : '') + '>💬 Видимый (сообщение в чат)</option>'
    + '</select></div>'

    + '<div class="bm-s-section">Зависимости</div>'
    + '<div class="bm-s-hint">Спад зависимости за каждый ход без приёма вещества.</div>'
    + '<div class="bm-s-row"><span class="bm-s-label">Спад/ход:</span><input type="number" id="bm-decay" class="bm-s-input" min="0" max="20" value="' + (c.addictionDecay || 2) + '"></div>'
    + '<div class="bm-s-row"><button id="bm-reset-addictions" class="menu_button">Сбросить зависимости</button></div>'

    + '<div class="bm-s-section">Виджет</div>'
    + '<div class="bm-s-row"><span class="bm-s-label">Размер:</span><input type="range" id="bm-wsize" min="36" max="80" step="2" value="' + (c.widgetSize || 52) + '" style="flex:1;accent-color:#8b5cf6;"><span id="bm-wsize-label" style="font-size:12px;min-width:36px;text-align:right;opacity:.5;">' + (c.widgetSize || 52) + 'px</span></div>'
    + '<div class="bm-s-row"><button id="bm-reset-pos" class="menu_button">Сбросить позицию</button></div>'

    + '<div class="bm-s-section">Данные</div>'
    + '<div class="bm-s-row"><button id="bm-clear-inv" class="menu_button">Очистить инвентарь</button><button id="bm-reset-all" class="menu_button" style="background:rgba(239,68,68,.15);color:#ef4444;">Сбросить всё</button></div>'

    + '<div class="bm-s-section">Статистика</div>'
    + '<div class="bm-s-hint" id="bm-stats">Потрачено: ' + (c.totalSpent || 0) + ' | Заработано: ' + (c.totalEarned || 0) + ' | Предметов: ' + c.inventory.reduce((s, i) => s + i.qty, 0) + '</div>'

    + '</div></div></div>';
}

function syncSettingsPanel() {
  const c = cfg();
  const el = id => document.getElementById(id);
  const b = el('bm-balance'); if (b && document.activeElement !== b) b.value = c.balance;
  const st = el('bm-stats'); if (st) st.textContent = 'Потрачено: ' + (c.totalSpent || 0) + ' | Заработано: ' + (c.totalEarned || 0) + ' | Предметов: ' + c.inventory.reduce((s, i) => s + i.qty, 0);
}

function bindSettingsEvents() {
  const $ = jQuery;
  $(document).off('.bm-settings');

  $(document).on('change.bm-settings', '#bm-enabled', function() {
    cfg().isEnabled = this.checked; saveSettingsDebounced(); updatePromptInjection();
    const w = document.getElementById('bm-widget');
    if (w) w.style.display = (cfg().widgetVisible && cfg().isEnabled) ? 'flex' : 'none';
  });
  $(document).on('change.bm-settings', '#bm-widget-vis', function() {
    cfg().widgetVisible = this.checked; saveSettingsDebounced();
    const w = document.getElementById('bm-widget');
    if (w) w.style.display = (this.checked && cfg().isEnabled) ? 'flex' : 'none';
  });
  $(document).on('change.bm-settings', '#bm-balance', function() {
    cfg().balance = Math.max(0, parseInt(this.value) || 0); saveSettingsDebounced();
  });
  $(document).on('change.bm-settings', '#bm-start-bal', function() {
    cfg().startBalance = Math.max(0, parseInt(this.value) || 500); saveSettingsDebounced();
  });
  $(document).on('change.bm-settings', '#bm-earn', function() {
    cfg().earnPerMessage = Math.max(0, parseInt(this.value) || 0); saveSettingsDebounced();
  });
  $(document).on('change.bm-settings', '#bm-apply-mode', function() {
    cfg().applyMode = this.value; saveSettingsDebounced();
  });
  $(document).on('change.bm-settings', '#bm-decay', function() {
    cfg().addictionDecay = Math.max(0, parseInt(this.value) || 2); saveSettingsDebounced();
  });
  $(document).on('input.bm-settings', '#bm-wsize', function() {
    const sz = parseInt(this.value);
    const lb = document.getElementById('bm-wsize-label'); if (lb) lb.textContent = sz + 'px';
    cfg().widgetSize = sz; saveSettingsDebounced();
    const w = document.getElementById('bm-widget');
    if (w) { w.style.width = sz + 'px'; w.style.height = sz + 'px'; }
  });
  $(document).on('click.bm-settings', '#bm-reset-balance', () => {
    cfg().balance = cfg().startBalance; saveSettingsDebounced(); syncSettingsPanel();
    toast('info', 'Баланс сброшен на ' + cfg().startBalance);
  });
  $(document).on('click.bm-settings', '#bm-reset-pos', () => {
    cfg().widgetPos = null; saveSettingsDebounced();
    const w = document.getElementById('bm-widget');
    if (w) { w.style.top = 'auto'; w.style.bottom = '90px'; w.style.left = 'auto'; w.style.right = '16px'; }
    toast('info', 'Позиция виджета сброшена');
  });
  $(document).on('click.bm-settings', '#bm-reset-addictions', () => {
    cfg().addictions = {}; saveSettingsDebounced(); updatePromptInjection();
    toast('info', 'Зависимости сброшены');
  });
  $(document).on('click.bm-settings', '#bm-clear-inv', () => {
    cfg().inventory = []; cfg().activeEffects = []; saveSettingsDebounced();
    updatePromptInjection(); updateBadge(); syncSettingsPanel();
    toast('info', 'Инвентарь очищен');
  });
  $(document).on('click.bm-settings', '#bm-reset-all', () => {
    const def = structuredClone(defaultSettings);
    for (const [k, v] of Object.entries(def)) cfg()[k] = structuredClone(v);
    saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettingsPanel();
    const w = document.getElementById('bm-widget');
    if (w) { w.style.display = 'flex'; w.style.top = 'auto'; w.style.bottom = '90px'; w.style.left = 'auto'; w.style.right = '16px'; w.style.width = '52px'; w.style.height = '52px'; }
    toast('info', 'Все данные сброшены');
  });
}

/* ═══════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ═══════════════════════════════════════════ */
jQuery(() => {
  try {
    if (!extension_settings[EXT_NAME]) extension_settings[EXT_NAME] = structuredClone(defaultSettings);
    const c = cfg();
    for (const [k, v] of Object.entries(defaultSettings)) {
      if (c[k] === undefined) c[k] = structuredClone(v);
    }
    if (!Array.isArray(c.inventory))     c.inventory     = [];
    if (!Array.isArray(c.activeEffects)) c.activeEffects = [];
    if (!c.addictions || typeof c.addictions !== 'object') c.addictions = {};

    $('#extensions_settings').append(settingsPanelHTML());
    createWidget();
    bindSettingsEvents();
    updatePromptInjection();

    eventSource.on(event_types.MESSAGE_SENT,     onMessageSent);
    eventSource.on(event_types.MESSAGE_RECEIVED,  onMessageReceived);
    if (event_types.CHAT_CHANGED) {
      eventSource.on(event_types.CHAT_CHANGED, () => { syncSettingsPanel(); updatePromptInjection(); });
    }
  } catch(e) {
    toast('error', 'Black Market: ошибка инициализации — ' + e.message);
  }
});
