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
      { id: 'weed',        name: 'Марихуана',           price: 50,   desc: 'Расслабление и лёгкая эйфория.',             addictionRate: 8,  effectDuration: 3, effectDesc: 'расслаблен, слегка заторможен, улыбается без причины' },
      { id: 'cocaine',     name: 'Кокаин',               price: 200,  desc: 'Мощный стимулятор. Прилив энергии.',          addictionRate: 18, effectDuration: 2, effectDesc: 'гиперактивен, самоуверен, зрачки расширены, говорит быстро' },
      { id: 'heroin',      name: 'Героин',               price: 300,  desc: 'Сильнейший опиоид. Полная эйфория.',          addictionRate: 30, effectDuration: 4, effectDesc: 'блаженная апатия, реакции замедлены, зрачки-точки' },
      { id: 'ecstasy',     name: 'Экстази (MDMA)',        price: 150,  desc: 'Усиливает чувства и тактильность.',           addictionRate: 12, effectDuration: 4, effectDesc: 'крайне общителен, тактилен, испытывает эмпатию ко всему' },
      { id: 'lsd',         name: 'ЛСД',                  price: 120,  desc: 'Искажает восприятие реальности.',              addictionRate: 5,  effectDuration: 6, effectDesc: 'галлюцинирует, видит узоры и цвета, восприятие искажено' },
      { id: 'amphetamine', name: 'Амфетамин',            price: 100,  desc: 'Стимулятор ЦНС. Бодрость на часы.',            addictionRate: 15, effectDuration: 4, effectDesc: 'бодр, сосредоточен, не чувствует голода и усталости' },
      { id: 'meth',        name: 'Метамфетамин',         price: 250,  desc: 'Мощнейший стимулятор. Тяжёлые последствия.',   addictionRate: 28, effectDuration: 5, effectDesc: 'маниакально энергичен, параноидален, зрачки огромные' },
    ]
  },
  rare_drugs: {
    name: 'Редкие наркотики', icon: '🧬', color: '#c084fc',
    items: [
      { id: 'dmt',          name: 'DMT',                    price: 500,  desc: 'Кратковременный мощный трип.',             addictionRate: 4,  effectDuration: 1, effectDesc: 'переживает мистический опыт, видит иные миры' },
      { id: 'mescaline',    name: 'Мескалин',               price: 400,  desc: 'Из кактуса пейот. Глубокий психоделик.',   addictionRate: 5,  effectDuration: 6, effectDesc: 'видит живые узоры, философствует, время искажено' },
      { id: 'shrooms',      name: 'Псилоцибиновые грибы',   price: 180,  desc: 'Магические грибы. Мягкий трип.',            addictionRate: 3,  effectDuration: 4, effectDesc: 'смеётся без причины, видит дыхание предметов' },
      { id: 'opium',        name: 'Опиум',                  price: 350,  desc: 'Тягучая эйфория.',                          addictionRate: 22, effectDuration: 5, effectDesc: 'в блаженном полусне, расслаблен до предела' },
      { id: 'ayahuasca',    name: 'Аяуаска',                price: 600,  desc: 'Шаманский напиток. Духовное путешествие.',   addictionRate: 2,  effectDuration: 5, effectDesc: 'переживает видения, возможна тошнота и слёзы' },
      { id: 'adrenochrome', name: 'Адренохром',             price: 900,  desc: 'Эффект непредсказуем.',                     addictionRate: 10, effectDuration: 3, effectDesc: 'изменённое сознание, непредсказуемые вспышки эмоций' },
    ]
  },
  weapons: {
    name: 'Оружие', icon: '🔫', color: '#ef4444',
    items: [
      { id: 'knife',   name: 'Нож',          price: 80,   desc: 'Складной нож. Компактный и смертоносный.',   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе нож' },
      { id: 'pistol',  name: 'Пистолет',     price: 500,  desc: 'Полуавтомат. 15 патронов.',                  addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён пистолетом' },
      { id: 'shotgun', name: 'Дробовик',     price: 800,  desc: 'Разрушительная сила на близкой дистанции.',  addictionRate: 0, effectDuration: 0, effectDesc: 'имеет дробовик — внушает страх' },
      { id: 'rifle',   name: 'Автомат',      price: 1500, desc: 'Полный автомат. Армейское оружие.',          addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён автоматом — крайне опасен' },
      { id: 'brass',   name: 'Кастет',       price: 60,   desc: 'Усиливает удар вчетверо.',                   addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кастет — удары значительно сильнее' },
      { id: 'taser',   name: 'Электрошокер', price: 200,  desc: 'Обездвиживает цель электричеством.',         addictionRate: 0, effectDuration: 0, effectDesc: 'имеет электрошокер — может парализовать' },
      { id: 'katana',  name: 'Катана',       price: 1200, desc: 'Японский клинок. Смертоносная элегантность.', addictionRate: 0, effectDuration: 0, effectDesc: 'вооружён катаной' },
    ]
  },
  alcohol: {
    name: 'Алкоголь', icon: '🍷', color: '#f59e0b',
    items: [
      { id: 'beer',      name: 'Пиво',    price: 15,  desc: 'Холодное пиво. Лёгкое опьянение.',      addictionRate: 3,  effectDuration: 2, effectDesc: 'слегка навеселе, расслаблен' },
      { id: 'vodka',     name: 'Водка',   price: 50,  desc: '40 градусов решимости.',                 addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, речь невнятная, раскрепощён' },
      { id: 'whiskey',   name: 'Виски',   price: 120, desc: 'Выдержанный. Обжигает и согревает.',     addictionRate: 8,  effectDuration: 3, effectDesc: 'пьян, самоуверен, чуть агрессивен' },
      { id: 'absinthe',  name: 'Абсент',  price: 150, desc: '70 градусов и туйон.',                   addictionRate: 10, effectDuration: 4, effectDesc: 'сильно пьян, возможны галлюцинации, дерзок' },
      { id: 'moonshine', name: 'Самогон', price: 30,  desc: 'Домашний первач. Непредсказуем.',         addictionRate: 6,  effectDuration: 3, effectDesc: 'пьян, может плохо себя чувствовать' },
      { id: 'wine',      name: 'Вино',    price: 80,  desc: 'Красное вино. Романтика.',               addictionRate: 4,  effectDuration: 2, effectDesc: 'приятно захмелел, романтично настроен' },
    ]
  },
  medications: {
    name: 'Медикаменты', icon: '💉', color: '#06b6d4',
    items: [
      { id: 'painkillers',     name: 'Обезболивающее',  price: 40,  desc: 'Снимает любую боль.',                       addictionRate: 10, effectDuration: 3, effectDesc: 'не чувствует боли, слегка заторможен' },
      { id: 'antidepressants', name: 'Антидепрессанты', price: 80,  desc: 'Выравнивают настроение.',                   addictionRate: 12, effectDuration: 5, effectDesc: 'эмоции притуплены, стабильное настроение' },
      { id: 'sleeping',        name: 'Снотворное',      price: 60,  desc: 'Мгновенный крепкий сон.',                   addictionRate: 14, effectDuration: 3, effectDesc: 'сонлив, может отключиться в любой момент' },
      { id: 'adrenaline',      name: 'Адреналин',       price: 200, desc: 'Инъекция чистого адреналина.',              addictionRate: 5,  effectDuration: 1, effectDesc: 'боевая готовность, сердце колотится, зрение острое' },
      { id: 'morphine',        name: 'Морфин',          price: 250, desc: 'Сильнейшее обезболивающее.',                addictionRate: 25, effectDuration: 4, effectDesc: 'безразличие к боли, эйфория, зрачки сужены' },
      { id: 'steroids',        name: 'Стероиды',        price: 300, desc: 'Анаболики. Сила и агрессия.',               addictionRate: 8,  effectDuration: 5, effectDesc: 'прилив силы, агрессивен, мышцы напряжены' },
    ]
  },
  poisons: {
    name: 'Яды', icon: '☠️', color: '#84cc16',
    items: [
      { id: 'cyanide',     name: 'Цианид',     price: 400, desc: 'Смерть за минуты. Запах миндаля.',      addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе цианид' },
      { id: 'arsenic',     name: 'Мышьяк',     price: 300, desc: 'Классический яд. Действует постепенно.', addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе мышьяк — медленный яд' },
      { id: 'ricin',       name: 'Рицин',      price: 600, desc: 'Биологический яд. Без противоядия.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе рицин — биотоксин' },
      { id: 'snake_venom', name: 'Яд змеи',    price: 350, desc: 'Нейротоксин. Паралич дыхания.',          addictionRate: 0, effectDuration: 0, effectDesc: 'имеет при себе змеиный яд' },
      { id: 'nightshade',  name: 'Белладонна', price: 200, desc: 'Галлюцинации и смерть.',                 addictionRate: 0, effectDuration: 0, effectDesc: 'имеет экстракт белладонны' },
      { id: 'chloroform',  name: 'Хлороформ',  price: 250, desc: 'Отключает сознание быстро.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет хлороформ — может усыпить кого угодно' },
    ]
  },
  explosives: {
    name: 'Взрывчатка', icon: '💣', color: '#f97316',
    items: [
      { id: 'grenade',   name: 'Граната',           price: 400,  desc: 'Осколочная. Радиус 15м.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет гранату' },
      { id: 'dynamite',  name: 'Динамит',           price: 500,  desc: 'Классическая взрывчатка.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет динамит' },
      { id: 'c4',        name: 'C4',                price: 1000, desc: 'Пластичная. Профессиональный снос.', addictionRate: 0, effectDuration: 0, effectDesc: 'имеет C4' },
      { id: 'molotov',   name: 'Коктейль Молотова', price: 100,  desc: 'Горючая смесь. Поджигает всё.',     addictionRate: 0, effectDuration: 0, effectDesc: 'имеет коктейль Молотова' },
      { id: 'detonator', name: 'Детонатор',         price: 300,  desc: 'Дистанционный подрыв.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет дистанционный детонатор' },
      { id: 'flashbang', name: 'Светошумовая',      price: 250,  desc: 'Ослепляет и оглушает.',             addictionRate: 0, effectDuration: 0, effectDesc: 'имеет светошумовую гранату' },
    ]
  },
  contraband: {
    name: 'Контрабанда', icon: '📦', color: '#78716c',
    items: [
      { id: 'fake_docs',    name: 'Фальшивые документы',    price: 500, desc: 'Паспорт, права — любая личность.',        addictionRate: 0, effectDuration: 0, effectDesc: 'имеет фальшивые документы' },
      { id: 'jewels',       name: 'Краденые драгоценности', price: 800, desc: 'Ворованные камни и золото.',              addictionRate: 0, effectDuration: 0, effectDesc: 'имеет краденые драгоценности' },
      { id: 'banned_books', name: 'Запрещённые книги',      price: 200, desc: 'Тексты, которых не должно существовать.', addictionRate: 0, effectDuration: 0, effectDesc: 'владеет запрещёнными знаниями' },
      { id: 'spy_gear',     name: 'Шпионское оборудование', price: 600, desc: 'Жучки, камеры, дешифраторы.',            addictionRate: 0, effectDuration: 0, effectDesc: 'оснащён шпионским оборудованием' },
      { id: 'lockpicks',    name: 'Отмычки',                price: 150, desc: 'Набор для вскрытия замков.',              addictionRate: 0, effectDuration: 0, effectDesc: 'имеет отмычки' },
      { id: 'body_armor',   name: 'Бронежилет',             price: 700, desc: 'Скрытый. Защита от пуль.',               addictionRate: 0, effectDuration: 0, effectDesc: 'носит скрытый бронежилет' },
    ]
  },
  magic: {
    name: 'Магические предметы', icon: '✨', color: '#8b5cf6',
    items: [
      { id: 'amulet',       name: 'Амулет защиты',       price: 300,  desc: 'Магическая защита от тёмных сил.',  addictionRate: 0, effectDuration: 0, effectDesc: 'носит амулет защиты' },
      { id: 'scroll',       name: 'Свиток заклинания',   price: 400,  desc: 'Одноразовое мощное заклинание.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет магический свиток' },
      { id: 'crystal',      name: 'Магический кристалл', price: 500,  desc: 'Концентрирует магическую энергию.', addictionRate: 3, effectDuration: 0, effectDesc: 'владеет магическим кристаллом' },
      { id: 'cursed_doll',  name: 'Проклятая кукла',     price: 350,  desc: 'Кукла вуду. Связывает с целью.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет куклу вуду' },
      { id: 'runes',        name: 'Руны',                price: 250,  desc: 'Древние руны. Предсказание.',        addictionRate: 0, effectDuration: 0, effectDesc: 'владеет рунами — прорицает и наводит чары' },
      { id: 'necronomicon', name: 'Некрономикон',        price: 1500, desc: 'Книга мёртвых. Запретное знание.',   addictionRate: 5, effectDuration: 0, effectDesc: 'изучает Некрономикон — тёмное знание меняет его' },
    ]
  },
  potions: {
    name: 'Зелья', icon: '🧪', color: '#10b981',
    items: [
      { id: 'health_pot',   name: 'Зелье здоровья',    price: 100, desc: 'Восстанавливает силы, лечит раны.',      addictionRate: 2, effectDuration: 2, effectDesc: 'раны затягиваются, прилив здоровья' },
      { id: 'strength_pot', name: 'Зелье силы',        price: 200, desc: 'Нечеловеческая сила на время.',          addictionRate: 5, effectDuration: 3, effectDesc: 'сверхчеловеческая сила, мышцы вздуваются' },
      { id: 'invis_pot',    name: 'Зелье невидимости', price: 500, desc: 'Полная невидимость.',                    addictionRate: 4, effectDuration: 2, effectDesc: 'невидим — тело прозрачное' },
      { id: 'love_pot',     name: 'Приворотное зелье', price: 300, desc: 'Вызывает влечение к тому, кто дал.',    addictionRate: 6, effectDuration: 4, effectDesc: 'под действием приворота — сильное влечение' },
      { id: 'forget_pot',   name: 'Зелье забвения',    price: 250, desc: 'Стирает последние воспоминания.',       addictionRate: 3, effectDuration: 1, effectDesc: 'теряет воспоминания, дезориентирован' },
      { id: 'rage_pot',     name: 'Зелье ярости',      price: 350, desc: 'Берсерк. Неудержимая агрессия.',        addictionRate: 7, effectDuration: 2, effectDesc: 'берсерк — неконтролируемая ярость, глаза красные' },
    ]
  },
  sexshop: {
    name: 'Секс-шоп', icon: '🔞', color: '#ec4899',
    items: [
      { id: 'handcuffs',   name: 'Наручники',          price: 50,  desc: 'Мягкие наручники с мехом.',            addictionRate: 0, effectDuration: 0, effectDesc: 'имеет наручники' },
      { id: 'whip',        name: 'Плётка',             price: 80,  desc: 'Кожаная. Для игр в доминирование.',    addictionRate: 0, effectDuration: 0, effectDesc: 'имеет кожаную плётку' },
      { id: 'blindfold',   name: 'Повязка на глаза',   price: 30,  desc: 'Шёлковая. Обостряет другие чувства.',  addictionRate: 0, effectDuration: 0, effectDesc: 'имеет шёлковую повязку' },
      { id: 'rope',        name: 'Верёвки',            price: 40,  desc: 'Мягкие верёвки для шибари.',           addictionRate: 0, effectDuration: 0, effectDesc: 'имеет верёвки для связывания' },
      { id: 'costume',     name: 'Эротический костюм', price: 120, desc: 'Провокационный костюм.',               addictionRate: 0, effectDuration: 0, effectDesc: 'одет в провокационный костюм' },
      { id: 'candles',     name: 'Массажные свечи',    price: 25,  desc: 'Тают в масло для тела.',               addictionRate: 0, effectDuration: 0, effectDesc: 'зажёг массажные свечи — атмосфера интимная' },
      { id: 'aphrodisiac', name: 'Афродизиак',         price: 180, desc: 'Сильный возбудитель.',                  addictionRate: 8, effectDuration: 3, effectDesc: 'под действием афродизиака' },
      { id: 'collar',      name: 'Ошейник',            price: 90,  desc: 'Кожаный с поводком.',                  addictionRate: 0, effectDuration: 0, effectDesc: 'имеет ошейник с поводком' },
    ]
  }
};

/* ═══════════════════════════════════════════════════════════
   НАСТРОЙКИ
═══════════════════════════════════════════════════════════ */
const DEFAULT = {
  isEnabled: true, widgetVisible: true, widgetPos: null, widgetSize: 52,
  balance: 500, startBalance: 500, earnPerMessage: 5, applyMode: 'silent',
  inventory: [], activeEffects: [], addictions: {}, addictionDecay: 2,
  totalSpent: 0, totalEarned: 0,
};
const cfg = () => extension_settings[EXT];

/* ═══════════════════════════════════════════════════════════
   УТИЛИТЫ
═══════════════════════════════════════════════════════════ */
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const getItem     = (c, i) => CATALOG[c]?.items.find(x => x.id === i) ?? null;
const getInvEntry = (c, i) => cfg().inventory.find(x => x.itemId === i && x.catId === c) ?? null;
const getAdd = c => cfg().addictions[c] || 0;
const setAdd = (c, v) => { cfg().addictions[c] = Math.max(0, Math.min(100, v)); };

function addLabel(lv) {
  if (lv >= 80) return { text:'Критическая', color:'#ef4444', icon:'🔴' };
  if (lv >= 60) return { text:'Тяжёлая',     color:'#f97316', icon:'🟠' };
  if (lv >= 40) return { text:'Средняя',      color:'#f59e0b', icon:'🟡' };
  if (lv >= 20) return { text:'Лёгкая',       color:'#84cc16', icon:'🟢' };
  if (lv  >  0) return { text:'Минимальная',  color:'#6b7280', icon:'⚪' };
  return { text:'Нет', color:'#374151', icon:'' };
}
function withdrawText(catId, lv) {
  if (!CATALOG[catId] || lv < 20) return null;
  const n = CATALOG[catId].name.toLowerCase();
  if (lv >= 80) return `Тяжелейшая абстиненция от ${n}: тремор, холодный пот, боль во всём теле.`;
  if (lv >= 60) return `Сильная ломка от ${n}: тошнота, раздражительность, бессонница.`;
  if (lv >= 40) return `Заметная тяга к ${n}: беспокойство, перепады настроения.`;
  return `Лёгкое желание принять ${n}.`;
}
function xtoast(type, msg) {
  try { toastr?.[type]?.(msg, 'Black Market', { timeOut:2500, positionClass:'toast-top-center' }); } catch {}
}
function popToast(ico, title, sub) {
  let el = document.getElementById('bm-pop');
  if (!el) { el = document.createElement('div'); el.id = 'bm-pop'; document.body.appendChild(el); }
  el.innerHTML = `<div style="font-size:28px;margin-bottom:4px">${ico}</div><b style="color:#e2e8f0">${esc(title)}</b>${sub?`<div style="font-size:11px;color:#64748b;margin-top:2px">${esc(sub)}</div>`:''}`;
  el.className = 'bm-pop'; void el.offsetWidth; el.className = 'bm-pop on';
  clearTimeout(el._t); el._t = setTimeout(() => el.className = 'bm-pop', 1800);
}

/* ═══════════════════════════════════════════════════════════
   СТИЛИ
═══════════════════════════════════════════════════════════ */
function injectCSS() {
  if (document.getElementById('bm-css')) return;
  const s = document.createElement('style'); s.id = 'bm-css';
  s.textContent = `
/* ──────────────────────────────────────────────────────
   АРХИТЕКТУРА ОТКРЫТИЯ:
   Нет overlay-фона, нет backdrop div, нет глобальных
   click-перехватчиков. Панель — просто карточка рядом
   с кнопкой. Закрыть можно только кнопкой-тоглом
   или крестиком внутри панели. Ghost click после
   touch физически не попадает ни на что закрывающее.
────────────────────────────────────────────────────── */

/* Враппер — позиционируемый контейнер кнопки+панели */
#bm-root {
  position: fixed; bottom: 90px; right: 16px;
  z-index: 99999; display: flex; flex-direction: column;
  align-items: flex-end; gap: 10px;
  touch-action: none; user-select: none;
  pointer-events: none;
}
#bm-btn, #bm-panel { pointer-events: auto; }

/* Кнопка-тогл */
#bm-btn {
  width: 52px; height: 52px; border-radius: 50%;
  flex-shrink: 0; cursor: pointer;
  background: linear-gradient(135deg,#1a1a2e,#16213e);
  border: 2px solid rgba(139,92,246,.5);
  box-shadow: 0 4px 20px rgba(139,92,246,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; position: relative;
  transition: box-shadow .2s, border-color .2s, transform .12s;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
#bm-btn:hover  { box-shadow:0 6px 28px rgba(139,92,246,.6); border-color:rgba(139,92,246,.9); }
#bm-btn:active { transform:scale(.91); }
#bm-btn.open   { background:linear-gradient(135deg,#1e0030,#2a0048); border-color:rgba(168,85,247,.9); }
#bm-btn.pulse  { animation:bm-p .4s ease; }
@keyframes bm-p { 0%{transform:scale(1)} 50%{transform:scale(1.18)} 100%{transform:scale(1)} }

/* Бейдж */
#bm-bdg {
  position:absolute; top:-4px; right:-4px;
  min-width:18px; height:18px; padding:0 4px;
  background:#ef4444; color:#fff; font-size:10px; font-weight:700;
  border-radius:9px; display:flex; align-items:center; justify-content:center;
  border:2px solid #111; pointer-events:none;
}

/* Панель */
#bm-panel {
  width: min(340px, calc(100vw - 24px));
  max-height: min(68vh, 540px);
  background: linear-gradient(160deg,#0d0d1c,#181830);
  border: 1px solid rgba(139,92,246,.28);
  border-radius: 16px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 8px 48px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.03);
  /* Скрыта */
  opacity: 0; pointer-events: none;
  transform: translateY(10px) scale(.96);
  transform-origin: bottom right;
  transition: opacity .16s ease, transform .16s ease;
}
#bm-panel.open {
  opacity:1; pointer-events:auto;
  transform: translateY(0) scale(1);
}

/* Шапка */
.bh { display:flex; align-items:center; gap:8px; padding:11px 13px 9px; border-bottom:1px solid rgba(255,255,255,.07); background:rgba(0,0,0,.22); flex-shrink:0; }
.bh-t { font-size:14px; font-weight:700; color:#e2e8f0; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bh-b { display:flex;align-items:center;gap:4px; background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.22);border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;color:#fbbf24;white-space:nowrap;flex-shrink:0; }
.bh-ic { width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#aaa;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;flex-shrink:0;-webkit-tap-highlight-color:transparent; }
.bh-ic:hover { background:rgba(255,255,255,.13);color:#fff; }

/* Табы */
.bt { display:flex;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.18);flex-shrink:0; }
.bt-i { flex:1;padding:8px 0;text-align:center;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;-webkit-tap-highlight-color:transparent; }
.bt-i.on { color:#a78bfa;border-bottom-color:#a78bfa; }
.bt-i:hover { color:#cbd5e1; }

/* Тело */
.bb { flex:1;overflow-y:auto;padding:9px 11px 13px;-webkit-overflow-scrolling:touch; }

/* Категории */
.bc { display:grid;grid-template-columns:repeat(2,1fr);gap:8px; }
.bc-c { display:flex;flex-direction:column;align-items:center;gap:5px;padding:13px 6px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:background .15s,border-color .15s,transform .12s;-webkit-tap-highlight-color:transparent; }
.bc-c:hover  { background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12); }
.bc-c:active { transform:scale(.95); }
.bc-ico  { font-size:25px;line-height:1; }
.bc-name { font-size:11px;font-weight:600;color:#cbd5e1;text-align:center;line-height:1.3; }
.bc-cnt  { font-size:10px;color:#64748b; }

/* Товар */
.bi { display:flex;gap:9px;padding:9px;margin-bottom:7px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06); }
.bi-l { flex:1;min-width:0; }
.bi-n { font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:2px; }
.bi-d { font-size:11px;color:#94a3b8;line-height:1.4;margin-bottom:5px; }
.bi-tg { display:flex;gap:4px;flex-wrap:wrap; }
.bi-t  { font-size:9px;padding:2px 6px;border-radius:7px;font-weight:600;line-height:1.4; }
.bi-r  { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:64px; }
.bi-p  { font-size:12px;font-weight:700;color:#fbbf24; }

/* Кнопки */
.bbuy,.buse,.bdrp { padding:5px 11px;border-radius:7px;font-size:11px;font-weight:700;border:none;cursor:pointer;transition:opacity .15s,transform .1s;-webkit-tap-highlight-color:transparent; }
.bbuy          { background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff; }
.bbuy:disabled { opacity:.28;cursor:not-allowed; }
.bbuy:active:not(:disabled) { transform:scale(.93); }
.buse  { background:linear-gradient(135deg,#10b981,#059669);color:#fff; }
.buse:active { transform:scale(.93); }
.bdrp  { background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2); }
.bdrp:active { transform:scale(.93); }

/* Инвентарь */
.be  { text-align:center;padding:30px 16px;color:#475569;font-size:13px; }
.bir { display:flex;gap:8px;align-items:center;padding:9px 10px;margin-bottom:5px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06); }
.bir-l { flex:1;min-width:0; }
.bir-n { font-size:12px;font-weight:600;color:#e2e8f0; }
.bir-c { font-size:10px;color:#64748b; }
.bir-q { font-size:12px;font-weight:700;color:#a78bfa;min-width:22px;text-align:center; }
.bir-a { display:flex;gap:4px; }

/* Зависимости */
.bad { display:flex;align-items:center;gap:7px;padding:7px 9px;margin-bottom:5px;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04); }
.bad-n { font-size:11px;font-weight:600;color:#cbd5e1;min-width:42px; }
.bad-t { flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden; }
.bad-f { height:100%;border-radius:3px;transition:width .4s; }
.bad-p { font-size:11px;font-weight:700;min-width:28px;text-align:right; }
.bad-l { font-size:10px;color:#94a3b8;min-width:44px; }

/* Всплывашка — снизу, не мешает кнопке */
#bm-pop { position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);background:rgba(13,13,28,.95);border:1px solid rgba(139,92,246,.32);border-radius:13px;padding:14px 22px;z-index:999999;text-align:center;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;box-shadow:0 6px 28px rgba(0,0,0,.5);min-width:180px; }
#bm-pop.on { opacity:1;transform:translateX(-50%) translateY(0); }

/* Настройки */
#bm-sp .sr { display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap; }
#bm-sp .sl { font-size:12px;color:var(--SmartThemeBodyColor,#aaa);opacity:.6;min-width:80px; }
#bm-sp .si { background:var(--input-background-fill,rgba(255,255,255,.04));border:1px solid var(--border-color,rgba(255,255,255,.12));border-radius:4px;color:var(--SmartThemeBodyColor,#eee);padding:4px 8px;font-size:13px;width:80px;text-align:center; }
#bm-sp .ss { background:var(--input-background-fill,rgba(255,255,255,.04));border:1px solid var(--border-color,rgba(255,255,255,.12));border-radius:4px;color:var(--SmartThemeBodyColor,#eee);padding:4px 8px;font-size:12px;flex:1; }
#bm-sp .sec { font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--SmartThemeBodyColor,#aaa);opacity:.5;margin:14px 0 5px;padding-bottom:4px;border-bottom:1px solid var(--border-color,rgba(255,255,255,.08)); }
#bm-sp .sh { font-size:11px;color:var(--SmartThemeBodyColor,#aaa);opacity:.35;line-height:1.5;margin-bottom:6px; }

@media(max-width:420px){
  #bm-root { right:8px;bottom:80px; }
  #bm-panel { width:calc(100vw - 16px); }
}
`;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   DOM + DRAG

   ПОЧЕМУ РАБОТАЕТ:
   ─ Нет overlay/backdrop — ghost click некуда попасть.
   ─ Открытие через событие 'click' на кнопке.
     Touch-tap генерирует: pointerdown → pointerup → click.
     Мы реагируем на click. Ghost click — это он и есть.
     Никакого дублирования.
   ─ Drag: если палец сдвинулся >6px — флаг _drag=true.
     Браузер всё равно пришлёт click после drag — флаг
     его поглощает. Флаг сбрасывается после.
   ─ Панель закрывается ТОЛЬКО кнопкой или крестиком.
═══════════════════════════════════════════════════════════ */
function buildDOM() {
  if (document.getElementById('bm-root')) return;
  injectCSS();
  const c = cfg();

  const root = document.createElement('div');
  root.id = 'bm-root';

  // Панель идёт первой в DOM (flex-direction: column, снизу кнопка)
  const panel = document.createElement('div');
  panel.id = 'bm-panel';
  root.appendChild(panel);

  const btn = document.createElement('button');
  btn.id   = 'bm-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Чёрный рынок');
  btn.innerHTML = '🏴‍☠️<span id="bm-bdg" hidden>0</span>';
  root.appendChild(btn);

  document.body.appendChild(root);

  // Размер
  setSize(c.widgetSize || 52);

  // Позиция
  if (c.widgetPos?.top != null) {
    root.style.top    = c.widgetPos.top;
    root.style.left   = c.widgetPos.left;
    root.style.bottom = root.style.right = 'auto';
  }
  clamp(root);
  window.addEventListener('resize', () => clamp(root));

  // Drag + click-тогл
  initDrag(root, btn);

  updateBadge();
}

function setSize(sz) {
  const b = document.getElementById('bm-btn');
  if (b) { b.style.width = b.style.height = sz + 'px'; b.style.fontSize = Math.round(sz * .45) + 'px'; }
}

function clamp(root) {
  const cs = window.getComputedStyle(root);
  // Конвертируем bottom/right → top/left один раз
  if (cs.bottom !== 'auto' || cs.right !== 'auto') {
    const r = root.getBoundingClientRect();
    root.style.left   = r.left + 'px';
    root.style.top    = r.top  + 'px';
    root.style.right  = root.style.bottom = 'auto';
  }
  const mxL = Math.max(4, window.innerWidth  - root.offsetWidth  - 4);
  const mxT = Math.max(4, window.innerHeight - root.offsetHeight - 4);
  root.style.left = Math.max(4, Math.min(mxL, parseFloat(root.style.left) || 0)) + 'px';
  root.style.top  = Math.max(4, Math.min(mxT, parseFloat(root.style.top)  || 0)) + 'px';
}

function initDrag(root, btn) {
  let active = false, ox = 0, oy = 0;
  btn._drag = false; // флаг: это был drag, а не tap

  root.addEventListener('pointerdown', e => {
    root.setPointerCapture(e.pointerId);
    const r = root.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    active = true;
    btn._drag = false;
    btn.style.transition = 'box-shadow .2s, border-color .2s'; // убрать transform из transition во время drag
    // Конвертируем в top/left при первом касании
    if (window.getComputedStyle(root).bottom !== 'auto') {
      root.style.left   = r.left + 'px';
      root.style.top    = r.top  + 'px';
      root.style.right  = root.style.bottom = 'auto';
    }
  });

  root.addEventListener('pointermove', e => {
    if (!active || !root.hasPointerCapture(e.pointerId)) return;
    const newL = e.clientX - ox;
    const newT = e.clientY - oy;
    const curL = parseFloat(root.style.left) || 0;
    const curT = parseFloat(root.style.top)  || 0;
    // Мёртвая зона 6px
    if (!btn._drag && Math.hypot(newL - curL, newT - curT) < 6) return;
    btn._drag = true;
    const mxL = Math.max(4, window.innerWidth  - root.offsetWidth  - 4);
    const mxT = Math.max(4, window.innerHeight - root.offsetHeight - 4);
    root.style.left = Math.max(4, Math.min(mxL, newL)) + 'px';
    root.style.top  = Math.max(4, Math.min(mxT, newT)) + 'px';
    e.preventDefault();
  }, { passive: false });

  root.addEventListener('pointerup', () => {
    active = false;
    btn.style.transition = 'box-shadow .2s, border-color .2s, transform .12s';
    if (btn._drag) {
      cfg().widgetPos = { top: root.style.top, left: root.style.left };
      saveSettingsDebounced();
    }
  });

  // ═══════════════════════════════════════════════════════
  // ЕДИНСТВЕННАЯ ТОЧКА ОТКРЫТИЯ — событие 'click'.
  //
  // Вся проблема была в том, что предыдущие версии
  // открывали панель на pointerup/touchend, а потом
  // следовавший ghost-click закрывал её.
  //
  // Здесь: мы ждём именно click. Браузер генерирует
  // его ОДИН РАЗ после tap. Дублей нет.
  // Если был drag — _drag=true → click игнорируем,
  // флаг сбрасываем для следующего взаимодействия.
  // ═══════════════════════════════════════════════════════
  btn.addEventListener('click', e => {
    e.stopPropagation(); // не пускаем в DOM дальше
    if (btn._drag) { btn._drag = false; return; } // поглотить click после drag
    togglePanel();
  });
}

function updateBadge() {
  const b = document.getElementById('bm-bdg'); if (!b) return;
  const n = cfg().inventory.reduce((s, i) => s + i.qty, 0);
  b.textContent = n > 99 ? '99+' : n;
  b.hidden = n === 0;
}

function pulseBtn() {
  const b = document.getElementById('bm-btn'); if (!b) return;
  b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  b.addEventListener('animationend', () => b.classList.remove('pulse'), { once: true });
}

/* ═══════════════════════════════════════════════════════════
   ПАНЕЛЬ
═══════════════════════════════════════════════════════════ */
let uiSt = { tab:'shop', view:'main', catId:null };
let isOpen = false;

function togglePanel() {
  isOpen ? closePanel() : openPanel();
}
function openPanel() {
  isOpen = true;
  uiSt = { tab:'shop', view:'main', catId:null };
  render();
  document.getElementById('bm-panel')?.classList.add('open');
  document.getElementById('bm-btn')?.classList.add('open');
}
function closePanel() {
  isOpen = false;
  document.getElementById('bm-panel')?.classList.remove('open');
  document.getElementById('bm-btn')?.classList.remove('open');
}

function render() {
  const p = document.getElementById('bm-panel'); if (!p) return;
  const c = cfg();
  const bal = `<span class="bh-b">💰 ${c.balance}</span>`;
  let hdr;
  if (uiSt.tab === 'shop' && uiSt.view === 'category') {
    const cat = CATALOG[uiSt.catId] || {};
    hdr = `<div class="bh"><button class="bh-ic" id="bm-back">←</button><span class="bh-t">${cat.icon||''} ${esc(cat.name||'')}</span>${bal}</div>`;
  } else {
    const T = { shop:'🏴‍☠️ Чёрный рынок', inventory:'🎒 Инвентарь', addictions:'🩺 Здоровье' };
    hdr = `<div class="bh"><span class="bh-t">${T[uiSt.tab]||''}</span>${bal}<button class="bh-ic" id="bm-x">✕</button></div>`;
  }
  const tabs = ['shop','inventory','addictions'].map(t =>
    `<div class="bt-i${uiSt.tab===t?' on':''}" data-tab="${t}">${{shop:'🏪 Магазин',inventory:'🎒 Инвентарь',addictions:'🩺 Здоровье'}[t]}</div>`
  ).join('');
  let body;
  if      (uiSt.tab==='shop')      body = uiSt.view==='category' ? htmlItems(uiSt.catId) : htmlCats();
  else if (uiSt.tab==='inventory') body = htmlInv();
  else                              body = htmlAdds();
  p.innerHTML = hdr + `<div class="bt">${tabs}</div><div class="bb">${body}</div>`;
  bindPanelEv(p);
}

function htmlCats() {
  return '<div class="bc">' +
    Object.entries(CATALOG).map(([id,cat]) =>
      `<div class="bc-c" data-cat="${id}"><span class="bc-ico">${cat.icon}</span><span class="bc-name">${esc(cat.name)}</span><span class="bc-cnt">${cat.items.length} товаров</span></div>`
    ).join('') + '</div>';
}
function htmlItems(catId) {
  const cat = CATALOG[catId]; if (!cat) return '<div class="be">Категория не найдена</div>';
  const c = cfg();
  return cat.items.map(item => {
    const owned = getInvEntry(catId, item.id)?.qty || 0;
    const ok    = c.balance >= item.price;
    let tg = '';
    if (item.effectDuration > 0) tg += `<span class="bi-t" style="background:rgba(16,185,129,.12);color:#34d399">⏱ ${item.effectDuration}х</span>`;
    if (item.addictionRate > 15) tg += `<span class="bi-t" style="background:rgba(239,68,68,.12);color:#f87171">⚠ Завис.</span>`;
    else if (item.addictionRate > 5) tg += `<span class="bi-t" style="background:rgba(245,158,11,.12);color:#fbbf24">⚡ Завис.</span>`;
    if (owned > 0) tg += `<span class="bi-t" style="background:rgba(139,92,246,.12);color:#a78bfa">×${owned}</span>`;
    return `<div class="bi"><div class="bi-l"><div class="bi-n">${esc(item.name)}</div><div class="bi-d">${esc(item.desc)}</div><div class="bi-tg">${tg}</div></div><div class="bi-r"><div class="bi-p">💰 ${item.price}</div><button class="bbuy" data-cat="${catId}" data-item="${item.id}"${ok?'':' disabled'}>Купить</button></div></div>`;
  }).join('');
}
function htmlInv() {
  const inv = cfg().inventory;
  if (!inv.length) return '<div class="be">🎒<br>Инвентарь пуст</div>';
  return inv.map((e, idx) => {
    const it = getItem(e.catId, e.itemId); if (!it) return '';
    const ct = CATALOG[e.catId];
    const use = it.effectDuration > 0 || it.addictionRate > 0 || it.effectDesc;
    return `<div class="bir"><span style="font-size:18px">${ct?.icon||'📦'}</span><div class="bir-l"><div class="bir-n">${esc(it.name)}</div><div class="bir-c">${esc(ct?.name||'')}</div></div><span class="bir-q">×${e.qty}</span><div class="bir-a">${use?`<button class="buse" data-idx="${idx}">Применить</button>`:''}<button class="bdrp" data-idx="${idx}">✕</button></div></div>`;
  }).join('');
}
function htmlAdds() {
  const adds = cfg().addictions;
  const cats = Object.keys(adds).filter(k => adds[k] > 0).sort((a,b) => adds[b]-adds[a]);
  if (!cats.length) return '<div class="be">🩺<br>Зависимостей нет</div>';
  return cats.map(k => {
    const lv = adds[k], lb = addLabel(lv), ct = CATALOG[k];
    return `<div class="bad"><span class="bad-n">${ct?.icon||''} ${esc(ct?.name||k)}</span><div class="bad-t"><div class="bad-f" style="width:${lv}%;background:${lb.color}"></div></div><span class="bad-p" style="color:${lb.color}">${lv}%</span><span class="bad-l">${lb.icon} ${lb.text}</span></div>`;
  }).join('');
}

function bindPanelEv(p) {
  p.querySelectorAll('.bt-i').forEach(el => el.addEventListener('click', () => {
    uiSt.tab = el.dataset.tab;
    if (uiSt.tab === 'shop') { uiSt.view = 'main'; uiSt.catId = null; }
    render();
  }));
  p.querySelector('#bm-x')?.addEventListener('click', closePanel);
  p.querySelector('#bm-back')?.addEventListener('click', () => { uiSt.view='main'; uiSt.catId=null; render(); });
  p.querySelectorAll('.bc-c').forEach(el => el.addEventListener('click', () => { uiSt.view='category'; uiSt.catId=el.dataset.cat; render(); }));
  p.querySelectorAll('.bbuy').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); buyItem(el.dataset.cat, el.dataset.item); }));
  p.querySelectorAll('.buse').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); useItem(+el.dataset.idx); }));
  p.querySelectorAll('.bdrp').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); dropItem(+el.dataset.idx); }));
}

/* ═══════════════════════════════════════════════════════════
   ДЕЙСТВИЯ
═══════════════════════════════════════════════════════════ */
function buyItem(catId, itemId) {
  const c = cfg(), it = getItem(catId, itemId);
  if (!it || c.balance < it.price) { xtoast('warning','Недостаточно средств!'); return; }
  c.balance -= it.price; c.totalSpent = (c.totalSpent||0) + it.price;
  const ex = getInvEntry(catId, itemId);
  ex ? ex.qty++ : c.inventory.push({ itemId, catId, qty:1, boughtAt:Date.now() });
  saveSettingsDebounced(); pulseBtn(); updateBadge(); render(); syncSettings();
  popToast('💰', 'Куплено: ' + it.name, `Баланс: ${c.balance}`);
  xtoast('success', it.name + ' куплен(а)!');
}
function useItem(idx) {
  const c = cfg(), e = c.inventory[idx]; if (!e) return;
  const it = getItem(e.catId, e.itemId); if (!it) return;
  e.qty--; if (e.qty <= 0) c.inventory.splice(idx, 1);
  if (it.effectDuration > 0 || it.effectDesc) {
    const ex = c.activeEffects.find(x => x.itemId===it.id && x.catId===e.catId);
    ex ? (ex.turnsLeft = Math.max(ex.turnsLeft, it.effectDuration))
       : c.activeEffects.push({ itemId:it.id, catId:e.catId, turnsLeft:it.effectDuration||1, effectDesc:it.effectDesc });
  }
  if (it.addictionRate > 0) setAdd(e.catId, getAdd(e.catId) + it.addictionRate);
  if (cfg().applyMode === 'visible') sendVisible(it);
  saveSettingsDebounced(); updatePromptInjection();
  updateBadge(); render(); syncSettings();
  popToast('✅', 'Применено: ' + it.name, it.effectDuration > 0 ? `Эффект: ${it.effectDuration} ходов` : '');
  xtoast('info', it.name + ' применён(а)!');
}
function dropItem(idx) {
  const c = cfg(), e = c.inventory[idx]; if (!e) return;
  const it = getItem(e.catId, e.itemId);
  e.qty--; if (e.qty <= 0) c.inventory.splice(idx, 1);
  saveSettingsDebounced(); updateBadge(); render(); syncSettings();
  xtoast('info', (it?.name||'Предмет') + ' выброшен');
}
function sendVisible(it) {
  try {
    const ctx = SillyTavern?.getContext?.(); if (!ctx) return;
    const msg = `*достаёт ${it.name} и применяет*`;
    typeof ctx.sendMessage==='function' ? ctx.sendMessage(msg) : ctx.sendSystemMessage?.('generic',msg);
  } catch {}
}

/* ═══════════════════════════════════════════════════════════
   ПРОМПТ
═══════════════════════════════════════════════════════════ */
function buildPrompt() {
  const c = cfg(); if (!c.isEnabled) return '';
  const p = ['[OOC — BLACK MARKET SYSTEM]'];
  const fx = (c.activeEffects||[]).filter(e => e.turnsLeft > 0);
  if (fx.length) {
    p.push('\nACTIVE EFFECTS on the player character:');
    fx.forEach(e => { const it=getItem(e.catId,e.itemId); p.push(`- ${it?.name||e.itemId}: ${e.effectDesc||'активен'} (осталось: ${e.turnsLeft} ход.)`); });
    p.push('Portray the player character accordingly — reflect these effects naturally in RP.');
  }
  const car = (c.inventory||[]).filter(en => { const it=getItem(en.catId,en.itemId); return it && !it.effectDuration; });
  if (car.length) { p.push('\nPLAYER CURRENTLY CARRIES:'); car.forEach(en => { const it=getItem(en.catId,en.itemId); if(it) p.push(`- ${it.name} ×${en.qty}: ${it.effectDesc||''}`); }); }
  const wd = Object.entries(c.addictions).map(([k,v])=>withdrawText(k,v)).filter(Boolean);
  if (wd.length) { p.push('\nWITHDRAWAL / ADDICTION EFFECTS — portray these symptoms:'); wd.forEach(w=>p.push('- '+w)); }
  if (p.length <= 1) return '';
  p.push('\n[/OOC]'); return p.join('\n');
}
function updatePromptInjection() {
  try { setExtensionPrompt(PROMPT_KEY, cfg().isEnabled?buildPrompt():'', extension_prompt_types.IN_CHAT, 0); } catch {}
}

/* ═══════════════════════════════════════════════════════════
   СОБЫТИЯ ЧАТА
═══════════════════════════════════════════════════════════ */
function onMessageReceived() {
  const c = cfg(); if (!c.isEnabled) return;
  c.balance += c.earnPerMessage; c.totalEarned = (c.totalEarned||0) + c.earnPerMessage;
  c.activeEffects = (c.activeEffects||[]).map(e=>({...e,turnsLeft:e.turnsLeft-1})).filter(e=>e.turnsLeft>0);
  const dc = c.addictionDecay||2;
  for (const k of Object.keys(c.addictions))
    if (!(c.activeEffects||[]).some(e=>e.catId===k))
      c.addictions[k] = Math.max(0,(c.addictions[k]||0)-dc);
  saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettings();
}
function onMessageSent() { updatePromptInjection(); }

/* ═══════════════════════════════════════════════════════════
   НАСТРОЙКИ
═══════════════════════════════════════════════════════════ */
function settingsPanelHTML() {
  const c = cfg();
  return `<div id="bm-sp" class="extension-settings">
<div class="inline-drawer">
<div class="inline-drawer-toggle inline-drawer-header"><b>🏴‍☠️ Black Market</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
<div class="inline-drawer-content">
<div class="sr"><label class="checkbox_label" for="bm-on"><input type="checkbox" id="bm-on"${c.isEnabled?' checked':''}><span>Включено</span></label></div>
<div class="sr"><label class="checkbox_label" for="bm-vis"><input type="checkbox" id="bm-vis"${c.widgetVisible?' checked':''}><span>Показывать кнопку</span></label></div>
<div class="sec">Баланс</div>
<div class="sr"><span class="sl">Баланс:</span><input type="number" id="bm-bal" class="si" value="${c.balance}"><button id="bm-rb" class="menu_button">Сбросить</button></div>
<div class="sr"><span class="sl">Начальный:</span><input type="number" id="bm-st" class="si" value="${c.startBalance}"></div>
<div class="sr"><span class="sl">За ответ:</span><input type="number" id="bm-ep" class="si" value="${c.earnPerMessage}"></div>
<div class="sec">Режим применения</div>
<div class="sh">Скрытый — через промпт. Видимый — сообщение в чат.</div>
<div class="sr"><select id="bm-md" class="ss"><option value="silent"${c.applyMode==='silent'?' selected':''}>🔇 Скрытый</option><option value="visible"${c.applyMode==='visible'?' selected':''}>💬 Видимый</option></select></div>
<div class="sec">Зависимости</div>
<div class="sr"><span class="sl">Спад/ход:</span><input type="number" id="bm-dc" class="si" min="0" max="20" value="${c.addictionDecay||2}"></div>
<div class="sr"><button id="bm-ra" class="menu_button">Сбросить зависимости</button></div>
<div class="sec">Кнопка</div>
<div class="sr"><span class="sl">Размер:</span><input type="range" id="bm-sz" min="36" max="80" step="2" value="${c.widgetSize||52}" style="flex:1;accent-color:#8b5cf6"><span id="bm-szl" style="font-size:12px;min-width:36px;text-align:right;opacity:.5">${c.widgetSize||52}px</span></div>
<div class="sr"><button id="bm-rp" class="menu_button">Сбросить позицию</button></div>
<div class="sec">Данные</div>
<div class="sr"><button id="bm-ci" class="menu_button">Очистить инвентарь</button><button id="bm-rall" class="menu_button" style="background:rgba(239,68,68,.13);color:#ef4444">Сбросить всё</button></div>
<div class="sec">Статистика</div>
<div class="sh" id="bm-stats">Потрачено: ${c.totalSpent||0} | Заработано: ${c.totalEarned||0} | Предметов: ${c.inventory.reduce((s,i)=>s+i.qty,0)}</div>
</div></div></div>`;
}

function syncSettings() {
  const c = cfg();
  const b = document.getElementById('bm-bal'); if (b && document.activeElement!==b) b.value=c.balance;
  const s = document.getElementById('bm-stats'); if (s) s.textContent=`Потрачено: ${c.totalSpent||0} | Заработано: ${c.totalEarned||0} | Предметов: ${c.inventory.reduce((s,i)=>s+i.qty,0)}`;
}

function bindSettingsEvents() {
  const $ = jQuery;
  $(document).off('.bm');
  $(document).on('change.bm','#bm-on',  function(){ cfg().isEnabled=this.checked; saveSettingsDebounced(); updatePromptInjection(); const r=document.getElementById('bm-root'); if(r) r.style.display=(cfg().widgetVisible&&cfg().isEnabled)?'':'none'; });
  $(document).on('change.bm','#bm-vis', function(){ cfg().widgetVisible=this.checked; saveSettingsDebounced(); const r=document.getElementById('bm-root'); if(r) r.style.display=(this.checked&&cfg().isEnabled)?'':'none'; });
  $(document).on('change.bm','#bm-bal', function(){ cfg().balance=Math.max(0,+this.value||0); saveSettingsDebounced(); });
  $(document).on('change.bm','#bm-st',  function(){ cfg().startBalance=Math.max(0,+this.value||500); saveSettingsDebounced(); });
  $(document).on('change.bm','#bm-ep',  function(){ cfg().earnPerMessage=Math.max(0,+this.value||0); saveSettingsDebounced(); });
  $(document).on('change.bm','#bm-md',  function(){ cfg().applyMode=this.value; saveSettingsDebounced(); });
  $(document).on('change.bm','#bm-dc',  function(){ cfg().addictionDecay=Math.max(0,+this.value||2); saveSettingsDebounced(); });
  $(document).on('input.bm', '#bm-sz',  function(){ const sz=+this.value; const lb=document.getElementById('bm-szl'); if(lb) lb.textContent=sz+'px'; cfg().widgetSize=sz; saveSettingsDebounced(); setSize(sz); });
  $(document).on('click.bm','#bm-rb',   ()=>{ cfg().balance=cfg().startBalance; saveSettingsDebounced(); syncSettings(); xtoast('info','Баланс сброшен на '+cfg().startBalance); });
  $(document).on('click.bm','#bm-rp',   ()=>{ cfg().widgetPos=null; saveSettingsDebounced(); const r=document.getElementById('bm-root'); if(r){ r.style.cssText='bottom:90px;right:16px;top:auto;left:auto'; } xtoast('info','Позиция сброшена'); });
  $(document).on('click.bm','#bm-ra',   ()=>{ cfg().addictions={}; saveSettingsDebounced(); updatePromptInjection(); xtoast('info','Зависимости сброшены'); });
  $(document).on('click.bm','#bm-ci',   ()=>{ cfg().inventory=[]; cfg().activeEffects=[]; saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettings(); xtoast('info','Инвентарь очищен'); });
  $(document).on('click.bm','#bm-rall', ()=>{
    const d=structuredClone(DEFAULT); Object.entries(d).forEach(([k,v])=>cfg()[k]=structuredClone(v));
    saveSettingsDebounced(); updatePromptInjection(); updateBadge(); syncSettings(); setSize(52);
    xtoast('info','Все данные сброшены');
  });
}

/* ═══════════════════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════ */
jQuery(() => {
  try {
    if (!extension_settings[EXT]) extension_settings[EXT] = structuredClone(DEFAULT);
    const c = cfg();
    Object.entries(DEFAULT).forEach(([k,v]) => { if (c[k]===undefined) c[k]=structuredClone(v); });
    if (!Array.isArray(c.inventory))     c.inventory     = [];
    if (!Array.isArray(c.activeEffects)) c.activeEffects = [];
    if (typeof c.addictions!=='object'||!c.addictions) c.addictions = {};

    $('#extensions_settings').append(settingsPanelHTML());
    buildDOM();
    bindSettingsEvents();
    updatePromptInjection();

    eventSource.on(event_types.MESSAGE_SENT,     onMessageSent);
    eventSource.on(event_types.MESSAGE_RECEIVED, onMessageReceived);
    if (event_types.CHAT_CHANGED) eventSource.on(event_types.CHAT_CHANGED, ()=>{ syncSettings(); updatePromptInjection(); });
  } catch(e) {
    xtoast('error', 'Black Market: ошибка инициализации — ' + e.message);
  }
});
