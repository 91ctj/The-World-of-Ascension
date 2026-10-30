/* =========================================================
   登神阶 · 世界观档案
   Interaction layer: navigation, tabs, map, archive modal.
   ========================================================= */

(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Header, progress, navigation
     ------------------------------------------------------- */

  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const nav = $('#mainNav');
  const menuToggle = $('#menuToggle');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle('is-scrolled', y > 36);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', '打开导航');
  };

  menuToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', !!open);
    menuToggle.setAttribute('aria-expanded', String(!!open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  });

  $$('#mainNav a').forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', event => {
    if (!nav?.classList.contains('is-open')) return;
    if (!nav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) closeMenu();
  });

  const sections = $$('main section[id]');
  const navLinks = $$('#mainNav a[data-nav]');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === id));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(section => spy.observe(section));
  }

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */

  const revealItems = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  /* -------------------------------------------------------
     Hero parallax
     ------------------------------------------------------- */

  const hero = $('.hero');
  const heroArt = $('.hero-art');
  if (hero && heroArt && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const animateHero = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      heroArt.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.04)`;
      raf = requestAnimationFrame(animateHero);
    };

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * -16;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });

    raf = requestAnimationFrame(animateHero);
    window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  }

  /* -------------------------------------------------------
     Power system
     ------------------------------------------------------- */

  const powerData = {
    master: [
      {
        n: 'I', label: '一环 · 觉醒', meta: '10级', kicker: 'SOUL MASTER · FIRST RING',
        title: '一环 · 觉醒',
        desc: '吸收第一魂环，获得第一魂技。魂师之路真正开始，也第一次听见魂兽留在魂环里的意志。',
        tags: ['第一魂技', '魂环融合', '初入魂师'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'II', label: '二环 · 凝力', meta: '20级', kicker: 'SOUL MASTER · SECOND RING',
        title: '二环 · 凝力',
        desc: '魂力可以外放，身体素质开始超越凡人。没有魂力护体的普通人，已经无法直视这种力量。',
        tags: ['魂力外放', '体质强化'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'III', label: '三环 · 入军', meta: '30级', kicker: 'SOUL MASTER · THIRD RING',
        title: '三环 · 入军',
        desc: '两大帝国魂师部队的招收门槛，也是高级魂师学院的毕业标准。三环，意味着真正踏入文明的力量体系。',
        tags: ['帝国精兵', '学院毕业', '社会阶梯'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'IV', label: '四环 · 中坚', meta: '40级', kicker: 'SOUL MASTER · FOURTH RING',
        title: '四环 · 中坚',
        desc: '魂师学院与宗门的中坚力量，可以担任地方要职。大多数魂师一生都停在这里，或在此找到自己的位置。',
        tags: ['宗门中坚', '地方要职'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'V', label: '五环 · 强者', meta: '50级', kicker: 'SOUL MASTER · FIFTH RING',
        title: '五环 · 强者',
        desc: '足以在地方横行，也是武魂殿黄金一代的起点。五环之后，魂技的组合开始比单一威力更重要。',
        tags: ['一方强者', '黄金一代'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'VI', label: '六环 · 高阶', meta: '60级', kicker: 'SOUL MASTER · SIXTH RING',
        title: '六环 · 高阶',
        desc: '魂力储量发生质变，可以同时驾驭多枚魂技。高阶魂师是宗门、军团与学院真正的中枢。',
        tags: ['魂力质变', '多魂技'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'VII', label: '七环 · 真身', meta: '70级', kicker: 'SOUL MASTER · SEVENTH RING',
        title: '七环 · 武魂真身',
        desc: '通过武魂与本源的高度共鸣，魂力在体表凝成具有武魂特征的铠甲。本源全功率运转，战力暴涨；代价是战后一段无法释放武魂的虚弱期。',
        tags: ['武魂真身', '本源全开', '虚弱期'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'VIII', label: '八环 · 巅峰', meta: '80级', kicker: 'SOUL MASTER · EIGHTH RING',
        title: '八环 · 巅峰',
        desc: '距离封号斗罗只差一步。八环魂师已经能左右一场战役的走向，但真正的传奇仍属于九环。',
        tags: ['准封号', '战役核心'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      },
      {
        n: 'IX', label: '九环 · 封号', meta: '90级', kicker: 'SOUL MASTER · NINTH RING',
        title: '九环 · 封号斗罗',
        desc: '封号斗罗。足以令十万年魂兽忌惮，是猎魂长老会与武魂殿的支柱。一个武魂最多承载九枚魂环，九环便是人类魂师的极限。',
        tags: ['封号斗罗', '武魂真身', '人类巅峰'],
        extra: [
          { num: '95', title: '凡人的枷锁', text: '95级是大监护者为人类设下的上限。96级以上，只向它认可的人开放。' },
          { num: '100', title: '神之领域', text: '武魂与魂环融入本源，凝聚神环。从此使用的不再是魂技，而是神技。' }
        ]
      }
    ],
    beast: [
      {
        n: '10', label: '十年 · 初生', meta: 'WHITE', kicker: 'SOUL BEAST · TEN YEARS', color: '#ded8cc',
        title: '十年 · 初生',
        desc: '寿命数十年，魂环为白色。母星上最常见的魂兽，也是魂师最初接触到的魂力生命。',
        tags: ['白色魂环', '数十年寿命'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      },
      {
        n: '100', label: '百年 · 凝环', meta: 'YELLOW', kicker: 'SOUL BEAST · HUNDRED YEARS', color: '#d8b960',
        title: '百年 · 凝环',
        desc: '寿命数百年，魂环为黄色。百年魂兽开始拥有稳定的魂力循环，是魂师第二、第三魂环的常见来源。',
        tags: ['黄色魂环', '数百年寿命'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      },
      {
        n: '1K', label: '千年 · 魂核', meta: 'PURPLE', kicker: 'SOUL BEAST · THOUSAND YEARS', color: '#9b76b7',
        title: '千年 · 魂核',
        desc: '寿命千年，魂环为紫色。少数千年魂兽能在体内凝聚魂核，获得第二魂力核心；但魂核会给本源带来沉重负担。',
        tags: ['紫色魂环', '魂核', '本源负担'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      },
      {
        n: '10K', label: '万年 · 通灵', meta: 'BLACK', kicker: 'SOUL BEAST · TEN THOUSAND YEARS', color: '#8b8492',
        title: '万年 · 通灵',
        desc: '寿命万年，魂环为黑色。万年魂兽粗通人性，死后可将灵魂融入魂环；若被喜欢的人类吸收，灵魂会引导魂力，减轻冲击。',
        tags: ['黑色魂环', '粗通人性', '灵魂入环'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      },
      {
        n: '100K', label: '十万年 · 兽王', meta: 'RED', kicker: 'SOUL BEAST · HUNDRED THOUSAND YEARS', color: '#b84b4c',
        title: '十万年 · 兽王',
        desc: '不亚于人类的智力，魂环为红色。十万年魂兽必拥魂核，也必遭天劫；它们通常高傲到宁愿自爆，也不愿把魂环留给人类。',
        tags: ['红色魂环', '兽王', '天劫'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      },
      {
        n: '∞', label: '化神 · 金纹', meta: 'ASCENDED', kicker: 'SOUL BEAST · ASCENDED', color: '#e7d3a7',
        title: '化神 · 金纹',
        desc: '极少数魂兽在渡劫时吸收天劫元力，将自身推上新的台阶。化神魂兽的魂环带着金纹，蕴含直接来自大监护者的神力。',
        tags: ['金纹魂环', '天劫元力', '传说之上'],
        extra: [
          { num: '天', title: '天劫', text: '十万年魂兽突破后一千年，会遭到大监护者的精准轰杀。这是限制魂兽的枷锁。' },
          { num: '化', title: '化形', text: '封印修为与魂核，化为六岁人类。先天满魂力，以人类身份继续修炼。' }
        ]
      }
    ]
  };

  const ladder = $('#powerLadder');
  const detail = $('#powerPanel');
  const ringVisual = $('#ringVisual');
  const ringSegments = $('#ringSegments');
  const ringNumber = $('#ringNumber');
  const ringUnit = $('#ringUnit');
  const detailKicker = $('#detailKicker');
  const detailTitle = $('#detailTitle');
  const detailDesc = $('#detailDesc');
  const detailTags = $('#detailTags');
  const powerExtra = $('#powerExtra');
  const tabMaster = $('#tabMaster');
  const tabBeast = $('#tabBeast');

  let powerType = 'master';
  let activePowerIndex = 8;

  const buildRing = () => {
    if (!ringSegments) return;
    ringSegments.innerHTML = '';
    for (let i = 0; i < 9; i += 1) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '130');
      circle.setAttribute('cy', '130');
      circle.setAttribute('r', '104');
      circle.setAttribute('pathLength', '100');
      circle.setAttribute('stroke-dasharray', '9.2 90.8');
      circle.setAttribute('transform', `rotate(${i * 40 - 90} 130 130)`);
      ringSegments.appendChild(circle);
    }
  };

  const renderLadder = () => {
    if (!ladder) return;
    const items = powerData[powerType];
    ladder.innerHTML = '';
    items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `ladder-item${index === activePowerIndex ? ' is-active' : ''}`;
      button.dataset.index = String(index);
      button.innerHTML = `
        <span class="ladder-ring">${item.n}</span>
        <span class="ladder-name"><strong>${item.label}</strong><small>${item.kicker.split(' · ').slice(-1)[0]}</small></span>
        <span class="ladder-meta">${item.meta}</span>
      `;
      button.addEventListener('click', () => selectPower(index));
      ladder.appendChild(button);
    });
  };

  const selectPower = index => {
    const items = powerData[powerType];
    if (!items[index]) return;
    activePowerIndex = index;
    const item = items[index];
    $$('.ladder-item', ladder).forEach((btn, i) => btn.classList.toggle('is-active', i === index));

    if (detailKicker) detailKicker.textContent = item.kicker;
    if (detailTitle) detailTitle.textContent = item.title;
    if (detailDesc) detailDesc.textContent = item.desc;
    if (detailTags) detailTags.innerHTML = item.tags.map(tag => `<span>${tag}</span>`).join('');
    if (ringNumber) {
      ringNumber.textContent = item.n;
      ringNumber.classList.toggle('is-small', item.n.length > 3);
    }
    if (ringUnit) ringUnit.textContent = powerType === 'master' ? 'RING' : 'YEARS';
    if (ringVisual) ringVisual.style.setProperty('--ring-color', item.color || '#c8a86b');

    const litCount = powerType === 'master' ? index + 1 : Math.min(9, index + 1);
    $$('.ring-segments circle', ringSegments).forEach((circle, i) => {
      circle.classList.toggle('is-lit', i < litCount);
    });

    if (powerExtra) {
      powerExtra.innerHTML = item.extra.map(extra => `
        <div class="extra-card">
          <span class="extra-num">${extra.num}</span>
          <div><h4>${extra.title}</h4><p>${extra.text}</p></div>
        </div>
      `).join('');
    }
  };

  const switchPowerType = type => {
    if (powerType === type) return;
    powerType = type;
    activePowerIndex = type === 'master' ? 8 : 0;
    tabMaster?.classList.toggle('is-active', type === 'master');
    tabBeast?.classList.toggle('is-active', type === 'beast');
    tabMaster?.setAttribute('aria-selected', String(type === 'master'));
    tabBeast?.setAttribute('aria-selected', String(type === 'beast'));
    renderLadder();
    selectPower(activePowerIndex);
  };

  if (ladder && ringSegments) {
    buildRing();
    renderLadder();
    selectPower(activePowerIndex);
    tabMaster?.addEventListener('click', () => switchPowerType('master'));
    tabBeast?.addEventListener('click', () => switchPowerType('beast'));
  }

  /* -------------------------------------------------------
     Era timeline
     ------------------------------------------------------- */

  const eraData = {
    dragon: {
      kicker: 'THE AGE OF DRAGONS',
      range: '亿万年前 — 龙陨纪前',
      title: '龙族时代',
      summary: '龙神与十二龙王统治母星。人类在龙族的阴影下学会了语言、文字与艺术，却从未掌握魂力。',
      progress: '18%',
      events: [
        { year: '亿年前', title: '龙族觉醒', desc: '母星第一个掌握魂力的物种出现。龙族以血脉同化万族，成为唯一的魂兽。' },
        { year: '远古', title: '龙神成神', desc: '第一位突破十万年的龙族。他将十二属性分授十二龙王，建立对母星的绝对统治。' },
        { year: '数百万年前', title: '人类出现', desc: '拥有可与十万年魂兽媲美的高等灵魂，却没有魂力天赋。人类以语言、文字与艺术取悦龙族。' },
        { year: '龙族盛世', title: '母星即世界', desc: '龙族在元力充沛的母星无所不能，却对荒芜的外太空毫无兴趣。母大陆中部是龙神的居所。' }
      ]
    },
    fall: {
      kicker: 'THE FALLEN ERA',
      range: '龙陨纪 0 — 10000',
      title: '龙陨纪元',
      summary: '伽马射线暴终结龙族时代。大监护者诞生，人类被改造成魂师，猎魂长老会点亮文明的火种。',
      progress: '38%',
      events: [
        { year: '0', title: '龙陨事件', desc: '龙族以全体牺牲阻止浩劫。龙神坠于母大陆中部高原，后世称那里为龙墟高原。' },
        { year: '0', title: '大监护者', desc: '海量龙族灵魂聚合为纯灵魂生命体。它开辟神界，决定培育人类文明。' },
        { year: '5000', title: '魂师诞生', desc: '人类新生儿获得本源、经脉与识海。武魂觉醒制度开启，人类第一次掌握魂力。' },
        { year: '8000', title: '城邦时代', desc: '大平原进入城邦时代。魂师家族建立城邦，保护人民免受魂兽侵袭。' },
        { year: '9000', title: '猎魂长老会', desc: '九环魂师组成理想主义团体，清扫魂兽、开拓原野。封号斗罗制度确立。' },
        { year: '9938', title: '双神选择', desc: '洪烈与千羽寒听到大监护者的声音。他们选择成神，也选择了截然不同的道路。' },
        { year: '9945', title: '修罗神', desc: '洪烈以杀证道，成为第一位人类神祇。修罗是龙族语言，意为凶猛好斗者。' },
        { year: '10000', title: '天使神', desc: '千羽寒飞升神界，天使纪元开始。一个以信仰统御大陆的时代拉开帷幕。' }
      ]
    },
    angel: {
      kicker: 'THE AGE OF ANGELS',
      range: '天使纪 1 — 10000',
      title: '天使纪元',
      summary: '武魂殿以信仰统御大陆，两大帝国在神权下崛起。万年的秩序，最终在一场母女对决中崩塌。',
      progress: '72%',
      events: [
        { year: '1', title: '武魂殿建立', desc: '袁献力代政，三大圣殿奠基。猎魂长老会化整为零，封号斗罗们带领家族进入圣光盆地。' },
        { year: '4', title: '六翼天使', desc: '千启明觉醒神级武魂，20级先天满魂力。天使一族登上神座，武魂殿的统治有了血脉背书。' },
        { year: '1000', title: '千禧谕令', desc: '天使神考、圣子游历制度与天使军团成形。天使一族以旁系为矛，以供奉殿为盾。' },
        { year: '4086', title: '第一次南北战争', desc: '玄霜帝国南下，天使军团驰援。圣光和约划定晏河边界，北境被纳入大平原文明区。' },
        { year: '4200', title: '五千纪集权', desc: '武魂殿收权，金鹄帝国推行行省制，七大宗门定型。神权与皇权同时走向中央集权。' },
        { year: '7000', title: '学院革命', desc: '魂师学院取代宗门私学，平民获得上升通道。斗魂场、拟态修炼场与竞技盛典相继兴起。' },
        { year: '8500', title: '寰陆盛典', desc: '青年魂师的最高竞技场。武魂殿学院包揽冠军千年，直到繁花隆学院出现。' },
        { year: '9797', title: '崩坏开始', desc: '千寻疾之死，路汐芙继任教皇，昊天宗战略收缩。天使信仰出现第一道裂缝。' },
        { year: '9813', title: '黄金一代', desc: '繁花隆学院终结武魂殿学院千年冠军神话。少年们的命运从此纠缠在一起。' },
        { year: '9825', title: '四神会战', desc: '大圣灵、死神、天使、修罗。旧秩序在武魂城下终结，路汐芙成神又陨落。' },
        { year: '9826', title: '真相公布', desc: '千道流亲口埋葬天使信仰。多神论的世界观，从《大天使启示录》开始。' },
        { year: '10000', title: '三神飞升', desc: '千仞雪、雨启智、蓝昊川同登神界。人类进入文明并立与信仰多元的神佑纪元。' }
      ]
    },
    blessed: {
      kicker: 'THE BLESSED ERA',
      range: '神佑纪元 1 —',
      title: '神佑纪元',
      summary: '多神并立，信仰自由。人类不再只有一个神，也不再只有一条成神之路。',
      progress: '100%',
      events: [
        { year: '元年', title: '三神飞升', desc: '天使、修罗、伊洛，三种神位同时点亮。整个母大陆都感受到了神力的波动。' },
        { year: '新秩序', title: '神权退场', desc: '武魂殿退回圣光盆地，两大帝国自立。什一税与国教时代结束，信仰成为选择。' },
        { year: '南方', title: '红江文明', desc: '蓝昊川庇护古红江人，建立独具特色的魂师文明。伊洛圣丘成为新的朝圣地。' },
        { year: '荒野', title: '杀戮之都', desc: '雨启智与雨启思镇守修罗传承。火舞一脉延续邪火凤凰，血瞳骨灵与邪火凤凰共同支撑杀戮之都。' },
        { year: '未来', title: '未完待续', desc: '神界仍在注视母星。新的成神者，终将踏上自己的阶梯。' }
      ]
    }
  };

  if (window.DENG_SHEN_TIMELINE) {
    const expanded = window.DENG_SHEN_TIMELINE;
    if (expanded.fall && Array.isArray(expanded.fall.events)) eraData.fall.events = expanded.fall.events;
    if (expanded.angel && Array.isArray(expanded.angel.events)) eraData.angel.events = expanded.angel.events;
  }

  const eraPanel = $('#eraPanel');
  const eraKicker = $('#eraKicker');
  const eraRange = $('#eraRange');
  const eraTitle = $('#eraTitle');
  const eraSummary = $('#eraSummary');
  const eraProgress = $('#eraProgress');
  const eraEvents = $('#eraEvents');

  const renderEra = key => {
    const data = eraData[key];
    if (!data || !eraPanel) return;
    if (eraKicker) eraKicker.textContent = data.kicker;
    if (eraRange) eraRange.textContent = `${data.range} · ${data.events.length} 个事件`;
    if (eraTitle) eraTitle.textContent = data.title;
    if (eraSummary) eraSummary.textContent = data.summary;
    if (eraProgress) eraProgress.style.width = data.progress;
    if (eraEvents) {
      eraEvents.innerHTML = `
        <p class="era-event-hint">点击任意事件，查看详细经过与历史影响。</p>
        ${data.events.map((event, index) => `
          <details class="era-event" style="animation-delay:${Math.min(index * 35, 420)}ms">
            <summary>
              <span class="era-event-year">${event.year}</span>
              <span class="era-event-main">
                <strong>${event.title}</strong>
                <small>${event.desc}</small>
              </span>
              <span class="era-event-toggle" aria-hidden="true"></span>
            </summary>
            <div class="era-event-detail">
              <p>${event.detail}</p>
              ${event.impact ? `<p class="era-event-impact"><span>历史影响</span>${event.impact}</p>` : ''}
            </div>
          </details>
        `).join('')}
      `;

      const eventNodes = $$('details.era-event', eraEvents);
      eventNodes.forEach(node => {
        node.addEventListener('toggle', () => {
          if (!node.open) return;
          eventNodes.forEach(other => {
            if (other !== node) other.open = false;
          });
        });
      });
    }
    $$('.era-tab').forEach(tab => {
      const active = tab.dataset.era === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  };

  $$('.era-tab').forEach(tab => tab.addEventListener('click', () => renderEra(tab.dataset.era)));
  if (eraPanel) renderEra('angel');

  /* -------------------------------------------------------
     Factions & map
     ------------------------------------------------------- */

  const factionData = {
    wuhun: {
      kicker: 'SPIRIT HALL · 神权中枢',
      name: '武魂殿',
      en: 'SPIRIT HALL',
      desc: '以天使信仰为根基的魂师组织。教皇殿对外，长老殿议政，供奉殿监察；天使军团是神权的矛，圣光盆地是神权的盾。',
      stats: [
        ['核心', '武魂城 / 圣光盆地'],
        ['领袖', '教皇 · 大天使'],
        ['武力', '天使军团、圣徒、封号斗罗']
      ],
      quote: '“神的意志，由人来执行。”'
    },
    jingu: {
      kicker: 'GOLDEN SWAN EMPIRE · 大平原皇权',
      name: '金鹄帝国',
      en: 'GOLDEN SWAN EMPIRE',
      desc: '金天鹅皇室以政治智慧统合城邦，七大宗门与皇家骑士团构成帝国的双翼。繁花隆学院与四元素学院，是平民魂师的两座灯塔。',
      stats: [
        ['核心', '金鹄城 / 大平原'],
        ['皇室武魂', '金天鹅'],
        ['支柱', '七大宗门、皇家骑士团']
      ],
      quote: '“皇权可以退让，但帝国必须向前。”'
    },
    xuangshuang: {
      kicker: 'FROST EMPIRE · 北境铁血',
      name: '玄霜帝国',
      en: 'FROST EMPIRE',
      desc: '白虎皇室与五大黄金家族共治北境。苦寒、军功与血脉塑造了它的秩序；晏北五城则是帝国最富庶的南方心脏。',
      stats: [
        ['核心', '白虎城 / 北境林海'],
        ['皇室武魂', '白虎'],
        ['支柱', '黄金家族、帝国军']
      ],
      quote: '“风雪之下，唯有强者能守住家园。”'
    },
    shalu: {
      kicker: 'CITY OF SLAUGHTER · 放逐之地',
      name: '杀戮之都',
      en: 'CITY OF SLAUGHTER',
      desc: '修罗传承地中的地下都市。修罗领域压制魂力，地狱路筛选强者；亡命徒在这里称王，也在这里等待被吞噬。',
      stats: [
        ['核心', '修罗传承地 / 龙墟高原'],
        ['主宰', '杀戮之王'],
        ['试炼', '地狱路、杀神领域']
      ],
      quote: '“在这里，力量是唯一的法律。”'
    },
    shenjie: {
      kicker: 'DIVINE REALM · 幕后执棋者',
      name: '神界',
      en: 'DIVINE REALM',
      desc: '大监护者开辟的独立空间。它不直接统治人间，却以神考、天劫与神位，决定文明的走向。',
      stats: [
        ['核心', '神界 / 母星上空'],
        ['主宰', '大监护者'],
        ['神位', '天使、修罗、死神、伊洛']
      ],
      quote: '“它不信仰神，它制造神。”'
    }
  };

  const factionDetail = $('#factionDetail');
  const factionKicker = $('#factionKicker');
  const factionName = $('#factionName');
  const factionEn = $('#factionEn');
  const factionDesc = $('#factionDesc');
  const factionStats = $('#factionStats');
  const factionQuote = $('#factionQuote');

  const setFaction = key => {
    const data = factionData[key];
    if (!data || !factionDetail) return;
    if (factionKicker) factionKicker.textContent = data.kicker;
    if (factionName) factionName.textContent = data.name;
    if (factionEn) factionEn.textContent = data.en;
    if (factionDesc) factionDesc.textContent = data.desc;
    if (factionStats) {
      factionStats.innerHTML = data.stats.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    }
    if (factionQuote) factionQuote.textContent = data.quote;

    $$('.map-pin').forEach(pin => pin.classList.toggle('is-active', pin.dataset.faction === key));
    $$('.faction-tab').forEach(tab => {
      const active = tab.dataset.faction === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  };

  $$('.map-pin').forEach(pin => {
    const activate = () => setFaction(pin.dataset.faction);
    pin.addEventListener('click', activate);
    pin.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
  $$('.faction-tab').forEach(tab => tab.addEventListener('click', () => setFaction(tab.dataset.faction)));
  if (factionDetail) setFaction('wuhun');

  /* -------------------------------------------------------
     Truth reveal
     ------------------------------------------------------- */

  const apocrypha = $('#apocrypha');
  const revealTruth = $('#revealTruth');
  const truthNote = $('#truthNote');
  const revealText = $('.reveal-text', revealTruth || document);

  revealTruth?.addEventListener('click', () => {
    const revealed = apocrypha?.classList.toggle('is-revealed');
    revealTruth.setAttribute('aria-expanded', String(!!revealed));
    if (revealText) revealText.textContent = revealed ? '封印已启' : '揭开神谕';
    if (truthNote) {
      truthNote.textContent = revealed
        ? '真相已经展开。天使纪元的历史，从此有了第二种读法。'
        : '触碰封印，阅读被天使一族抹去的那一页。';
    }
  });

  /* -------------------------------------------------------
     Character archive
     ------------------------------------------------------- */

  const characters = [
    {
      id: 'qiandaoliu',
      name: '千道流',
      en: 'QIAN DAOLIU',
      faction: '天使一族',
      tags: ['angel', 'wuhun'],
      role: '大天使 · 前教皇',
      cardLine: '他守了一生的秩序，最后由他亲手埋葬。',
      watermark: '千',
      accent: '#d8bf8b',
      accentSoft: 'rgba(216,191,139,.18)',
      stats: [['武魂', '六翼天使'], ['修为', '99级'], ['身份', '大天使']],
      quote: '“天使的荣光，不该建立在谎言之上。”',
      bio: [
        '千寻疾之父、千仞雪之祖父。年轻时与昊天斗罗蓝昊辰亦敌亦友，晚年主持天使神考，却在神考中失去武魂。',
        '四神会战后，他遵照大监护者的指示，向世人公布人类成神的真相，终结了统治文明万年的天使信仰。'
      ],
      fate: '失去武魂，卸下大天使之位；以凡人之躯见证新时代。'
    },
    {
      id: 'luxifu',
      name: '路汐芙',
      en: 'LU XIFU',
      faction: '天使旁系',
      tags: ['angel', 'wuhun'],
      role: '死神 · 前教皇',
      cardLine: '她恨的不是天使，而是让悲剧成为秩序的世界。',
      watermark: '路',
      accent: '#c77a78',
      accentSoft: 'rgba(157,59,63,.24)',
      stats: [['武魂', '曼陀罗魔花 / 死亡天使'], ['修为', '100级'], ['神位', '死神']],
      quote: '“既然这秩序以悲剧为食，那就由我来终结它。”',
      bio: [
        '双生武魂的天才，因暗黑天使被近卫圣团判处死刑。千寻疾救下她，却在多年后死于她的误解与吞噬。',
        '她以死亡天使伪装六翼天使，统治武魂殿，暗中创造秘法、扶持大圣灵，最终在四神会战中成神，又被女儿与雨启智联手斩杀。'
      ],
      fate: '第三位人类神祇，第一位不借助神力成神、也第一位向大监护者举刃的人。'
    },
    {
      id: 'qianrenxue',
      name: '千仞雪',
      en: 'QIAN RENXUE',
      faction: '天使一族',
      tags: ['angel', 'wuhun'],
      role: '二代天使神 · 教皇',
      cardLine: '从被安排的继承者，到审判秩序的持剑人。',
      watermark: '雪',
      accent: '#e2c98f',
      accentSoft: 'rgba(226,201,143,.2)',
      stats: [['武魂', '六翼天使'], ['修为', '100级'], ['神位', '二代天使神']],
      quote: '“我继承的不是神的意志，而是审判神的资格。”',
      bio: [
        '千寻疾与路汐芙之女，20级先天满魂力。幼年被祖父秘密送往金鹄圣团，以神秘统帅身份成长。',
        '天使神考中，她拒绝审判千道流，转而审判千羽寒与旧秩序，因此得到大监护者的认可。四神会战中与雨启智融合为双神一体，斩杀母亲路汐芙，战后成为武魂殿教皇，万年后飞升。'
      ],
      fate: '二代天使神；以宽容取代神权，以记忆背负旧秩序。'
    },
    {
      id: 'yuqizhi',
      name: '雨启智',
      en: 'YU QIZHI',
      faction: '雨家',
      tags: ['rain', 'shalu'],
      role: '二代修罗神 · 杀戮之王',
      cardLine: '被仇恨塑形，又被爱重新拼合。',
      watermark: '雨',
      accent: '#c96d68',
      accentSoft: 'rgba(157,59,63,.24)',
      stats: [['武魂', '血瞳骨灵'], ['修为', '100级'], ['神位', '二代修罗神']],
      quote: '“我曾以为她是恶魔。后来才知道，她把自己活成了刀。”',
      bio: [
        '雨逸衡与尘音诺之子，血瞳骨灵武魂。十岁那年，父母死于姐姐雨启思之手，他带着仇恨进入繁花隆学院、杀戮之都，被不朽血蝠寄生。',
        '四神会战中，他与千仞雪融合为双神一体，最终继承修罗神位，与千仞雪结为夫妻，育有分别继承修罗与天使血脉的两个孩子。'
      ],
      fate: '二代修罗神；与千仞雪共同执掌神界，监视母星。'
    },
    {
      id: 'lanhaochuan',
      name: '蓝昊川',
      en: 'LAN HAOCHUAN',
      faction: '昊天宗',
      tags: ['haotian'],
      role: '伊洛神 · 冰火两仪眼镇守者',
      cardLine: '他继承的不是仇恨，而是生长。',
      watermark: '蓝',
      accent: '#8fb5a5',
      accentSoft: 'rgba(111,143,166,.2)',
      stats: [['武魂', '昊天锤 / 蓝银皇'], ['修为', '100级'], ['神位', '伊洛神']],
      quote: '“父亲教我把仇恨锻进锤里，母亲教我把生命还给大地。”',
      bio: [
        '蓝晏浩与阿银之子，双生武魂昊天锤与蓝银皇。幼年随父隐居圣魂村，后在繁花隆学院、冰火两仪眼、杀戮之都与红江南岸成长。',
        '得大监护者神力，自创蓝银领域；在四神会战中治愈雨启智，战后庇护古红江人，自创伊洛神位。'
      ],
      fate: '伊洛神；以生命与治愈，为红江文明点亮第一盏灯。'
    },
    {
      id: 'yuqisi',
      name: '雨启思',
      en: 'YU QISI',
      faction: '雨家',
      tags: ['rain', 'shalu'],
      role: '暗魔邪神虎 · 杀戮之都镇守魂兽',
      cardLine: '她把自己活成了一把刀，刀锋始终朝向家人。',
      watermark: '思',
      accent: '#b47c88',
      accentSoft: 'rgba(180,124,136,.2)',
      stats: [['武魂', '血瞳骨灵（重生后失去）'], ['修为', '十万年'], ['身份', '镇守魂兽']],
      quote: '“我这一生只学会两件事：弑亲，和护住你。”',
      bio: [
        '雨逸衡与尘音诺长女。为延续家族，她在父母的设计下杀死双亲、融合祖传魂核，潜入武魂殿成为千仞雪的近侍。',
        '金鹄城事变中为保护千仞雪与雨启智本源燃尽，灵魂与修为注入魂核。后借暗魔邪神虎外化魂核重生，成为十万年魂兽，在四神会战中击杀最后一只银月狼王。'
      ],
      fate: '放弃人类身份，永驻杀戮之都；以魂兽之躯护佑雨家后裔。'
    },
    {
      id: 'qianxunji',
      name: '千寻疾',
      en: 'QIAN XUNJI',
      faction: '天使一族',
      tags: ['angel', 'wuhun'],
      role: '前教皇 · 天使斗罗',
      cardLine: '温柔与执念，在同一个人身上互为刀刃。',
      watermark: '寻',
      accent: '#c8a86b',
      accentSoft: 'rgba(200,168,107,.18)',
      stats: [['武魂', '六翼天使'], ['修为', '94级'], ['身份', '前教皇']],
      quote: '“我只是想给她一个更好的未来。”',
      bio: [
        '千道流之子，先天魂力十级。他救下路汐芙，带她游历、成婚，又在女儿觉醒六翼天使后，为稳固妻子的武魂袭击蓝晏浩与阿银。',
        '被蓝晏浩重创后，他在养伤期间被路汐芙吞噬，成为妻子进化为死亡天使的祭品。'
      ],
      fate: '死后被伪装为急病；他的名字成为武魂殿与昊天宗之间无法言说的裂缝。'
    },
    {
      id: 'yuyiheng',
      name: '雨逸衡',
      en: 'YU YIHENG',
      faction: '雨家',
      tags: ['rain'],
      role: '骨灵斗罗 · 雨家家主',
      cardLine: '以全家性命为棋，向命运讨一条活路。',
      watermark: '衡',
      accent: '#9d7a9b',
      accentSoft: 'rgba(157,122,155,.2)',
      stats: [['武魂', '血瞳骨灵'], ['修为', '96级'], ['身份', '雨家家主']],
      quote: '“若命运只给一条死路，我便用全家人的命，换一条活路。”',
      bio: [
        '雨清寒后裔，雨家当代家主。为护蓝晏浩与千道流一战，本源受损。面对家族断代危机，他制定绝密计划：让女儿雨启思弑亲、融合魂核、投奔武魂殿；将幼子雨启智托付蓝晏浩；自己与妻子从容赴死。',
        '他的布局最终引不朽血蝠入局，为雨家争得一线生机。'
      ],
      fate: '以凡人之躯执棋天道；他的死，是雨家重生的起点。'
    }
  ];

  if (Array.isArray(window.DENG_SHEN_CHARACTERS_EXTRA)) {
    characters.push(...window.DENG_SHEN_CHARACTERS_EXTRA);
  }

  const grid = $('#characterGrid');
  const filterWrap = $('#characterFilters');
  const characterCount = $('#characterCount');
  const characterSearch = $('#characterSearch');
  let activeFilter = 'all';
  let searchQuery = '';

  const characterSearchText = character => [
    character.name,
    character.en,
    character.role,
    character.faction,
    character.cardLine,
    ...character.stats.flat()
  ].join(' ').toLowerCase();

  const renderCharacters = filter => {
    if (!grid) return;
    const query = searchQuery.trim().toLowerCase();
    const visible = characters.filter(character => {
      const matchesFilter = filter === 'all' || character.tags.includes(filter);
      const matchesSearch = !query || characterSearchText(character).includes(query);
      return matchesFilter && matchesSearch;
    });

    grid.innerHTML = visible.length
      ? visible.map(character => `
        <article class="character-card" role="button" tabindex="0" data-id="${character.id}"
          style="--accent:${character.accent};--accent-soft:${character.accentSoft}">
          <div class="char-top">
            <span>ARCHIVE ${String(characters.indexOf(character) + 1).padStart(2, '0')}</span>
            <span class="char-faction">${character.faction}</span>
          </div>
          <span class="char-watermark" aria-hidden="true">${character.watermark}</span>
          <div class="char-bottom">
            <p class="char-role">${character.role}</p>
            <h3>${character.name}</h3>
            <p class="char-en">${character.en}</p>
            <div class="char-line"><p>${character.cardLine}</p></div>
            <div class="char-tags">${character.stats.slice(0, 2).map(([, value]) => `<span>${value}</span>`).join('')}</div>
            <span class="char-open">阅读档案 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          </div>
        </article>
      `).join('')
      : '<p class="character-empty">没有找到匹配的人物。试试其他姓名、武魂或阵营。</p>';

    $$('.character-card', grid).forEach(card => {
      const open = () => openCharacter(card.dataset.id);
      card.addEventListener('click', open);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    });

    if (characterCount) {
      const filtered = filter !== 'all' || query;
      characterCount.textContent = filtered
        ? `${String(visible.length).padStart(2, '0')} / ${characters.length} 份档案`
        : `${characters.length} 份档案`;
    }
  };

  $$('.chip', filterWrap || document).forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      $$('.chip', filterWrap).forEach(item => {
        const active = item === chip;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderCharacters(activeFilter);
    });
  });

  characterSearch?.addEventListener('input', event => {
    searchQuery = event.target.value;
    renderCharacters(activeFilter);
  });

  if (grid) renderCharacters('all');

  /* -------------------------------------------------------
     Character modal
     ------------------------------------------------------- */

  const modal = $('#characterModal');
  const modalClose = $('#modalClose');
  const modalVisual = $('#modalVisual');
  const modalWatermark = $('#modalWatermark');
  const modalFaction = $('#modalFaction');
  const modalNo = $('#modalNo');
  const modalRole = $('#modalRole');
  const modalName = $('#modalName');
  const modalEn = $('#modalEn');
  const modalStats = $('#modalStats');
  const modalQuote = $('#modalQuote');
  const modalBio = $('#modalBio');
  const modalFate = $('#modalFate');
  let lastFocused = null;

  const openCharacter = id => {
    const character = characters.find(item => item.id === id);
    if (!character || !modal) return;
    lastFocused = document.activeElement;

    if (modalVisual) {
      modalVisual.style.setProperty('--modal-accent', character.accent);
      modalVisual.style.setProperty('--modal-accent-soft', character.accentSoft);
    }
    if (modalWatermark) modalWatermark.textContent = character.watermark;
    if (modalFaction) modalFaction.textContent = character.faction;
    if (modalNo) modalNo.textContent = `ARCHIVE ${String(characters.indexOf(character) + 1).padStart(2, '0')}`;
    if (modalRole) modalRole.textContent = character.role;
    if (modalName) modalName.textContent = character.name;
    if (modalEn) modalEn.textContent = character.en;
    if (modalStats) {
      modalStats.innerHTML = character.stats.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    }
    if (modalQuote) modalQuote.textContent = character.quote;
    if (modalBio) modalBio.innerHTML = character.bio.map(paragraph => `<p>${paragraph}</p>`).join('');
    if (modalFate) modalFate.textContent = character.fate;

    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modalClose?.focus());
  };

  const closeCharacter = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  modalClose?.addEventListener('click', closeCharacter);
  $$('[data-close-modal]').forEach(item => item.addEventListener('click', closeCharacter));

  document.addEventListener('keydown', event => {
    if (!modal || modal.hidden) return;
    if (event.key === 'Escape') {
      closeCharacter();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
      .filter(item => !item.disabled && item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* -------------------------------------------------------
     Share current page
     ------------------------------------------------------- */

  const sharePage = $('#sharePage');
  sharePage?.addEventListener('click', async () => {
    const original = sharePage.textContent;
    try {
      await navigator.clipboard.writeText(window.location.href);
      sharePage.textContent = '链接已复制';
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try { document.execCommand('copy'); sharePage.textContent = '链接已复制'; }
      catch { sharePage.textContent = '请复制地址栏链接'; }
      input.remove();
    }
    window.setTimeout(() => { sharePage.textContent = original; }, 2200);
  });

  /* -------------------------------------------------------
     Small quality-of-life
     ------------------------------------------------------- */

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (link.closest('#mainNav')) closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  }, { passive: true });
})();
