// ================================================================
// CODE MAGIC GAME — Kids Coding Learning Game (Age 4–12)
// VBS Free Tuition — vbscomputersystem.in
// ================================================================
(function(){
'use strict';

// ── PUZZLES ──────────────────────────────────────────────────────
const CM_PUZZLES = [
  // ── LEVEL 1 — Happy Face & Emotion Codes (Nursery / UKG) ──────────
  { id:'l1_smile',  formula:':)',   hint:':) = Happy Smile',   emoji:'😊', name:'SMILE',    sound:'smile',  color:'#FFD60A', level:1, desc:'Colon + ) makes a SMILE face! Try :)' },
  { id:'l1_sad',    formula:':(',   hint:':( = Sad Face',      emoji:'😢', name:'SAD FACE', sound:'heart',  color:'#4CC9F0', level:1, desc:'Colon + ( makes a SAD face! Try :(' },
  { id:'l1_laugh',  formula:':D',   hint:':D = Big Laugh',     emoji:'😄', name:'LAUGH',    sound:'smile',  color:'#FB8500', level:1, desc:'Colon + D = Big Laugh face! Try :D' },
  { id:'l1_wink',   formula:';)',   hint:';) = Wink Face',     emoji:'😉', name:'WINK',     sound:'smile',  color:'#A78BFA', level:1, desc:'Semicolon + ) = WINK! Try ;)' },
  { id:'l1_heart',  formula:'<3',   hint:'<3 = Heart',         emoji:'❤️', name:'HEART',    sound:'heart',  color:'#F72585', level:1, desc:'Less-than + 3 = HEART! Try <3' },
  { id:'l1_shock',  formula:':O',   hint:':O = Shocked Face',  emoji:'😮', name:'SHOCKED',  sound:'magic',  color:'#06D6A0', level:1, desc:'Colon + O = SHOCKED face! Try :O' },
  { id:'l1_angry',  formula:'>:(',  hint:'>:( = Angry Face',   emoji:'😠', name:'ANGRY',    sound:'wrong',  color:'#F72585', level:1, desc:'Arrow + colon + ( = ANGRY! Try >:(' },
  { id:'l1_cool',   formula:'B)',   hint:'B) = Cool Sunglasses',emoji:'😎', name:'COOL',     sound:'magic',  color:'#4CC9F0', level:1, desc:'B + ) = COOL sunglasses face! Try B)' },
  { id:'l1_kiss',   formula:':*',   hint:':* = Kiss Face',     emoji:'😘', name:'KISS',     sound:'heart',  color:'#FF6B9D', level:1, desc:'Colon + * = KISS face! Try :*' },
  { id:'l1_tongue', formula:':P',   hint:':P = Silly Tongue',  emoji:'😛', name:'SILLY',    sound:'smile',  color:'#FFD60A', level:1, desc:'Colon + P = silly TONGUE face! Try :P' },

  // ── LEVEL 2 — Animal & Nature Chat Codes (Class 1–2) ─────────────
  { id:'l2_cat',    formula:'MEOW!', hint:'MEOW! = Cat Sound',   emoji:'🐱', name:'CAT',      sound:'cat',    color:'#FF6B9D', level:2, desc:'Cats say MEOW! Type it! Try MEOW!' },
  { id:'l2_dog',    formula:'WOOF!', hint:'WOOF! = Dog Sound',   emoji:'🐶', name:'DOG',      sound:'nature', color:'#FB8500', level:2, desc:'Dogs say WOOF! Type it! Try WOOF!' },
  { id:'l2_cow',    formula:'MOO!',  hint:'MOO! = Cow Sound',    emoji:'🐮', name:'COW',      sound:'nature', color:'#FFD60A', level:2, desc:'Cows say MOO! Type it! Try MOO!' },
  { id:'l2_bird',   formula:'<(^)',  hint:'<(^) = Little Bird',  emoji:'🐦', name:'BIRD',     sound:'nature', color:'#4CC9F0', level:2, desc:'Less-than + (^) = a Bird! Try <(^)' },
  { id:'l2_fish',   formula:'><>',   hint:'><> = Swimming Fish', emoji:'🐟', name:'FISH',     sound:'nature', color:'#06D6A0', level:2, desc:'Three symbols make a Fish! Try ><>' },
  { id:'l2_bunny',  formula:'(\\/)(',hint:'(\\/)( = Bunny Ears', emoji:'🐰', name:'BUNNY',    sound:'nature', color:'#A78BFA', level:2, desc:'Bracket combo = Bunny Ears! Try (\\/)(' },
  { id:'l2_sleep',  formula:'ZZZ',   hint:'ZZZ = Sleeping',      emoji:'😴', name:'SLEEPING', sound:'moon',   color:'#4361EE', level:2, desc:'ZZZ means someone is sleeping! Try ZZZ' },
  { id:'l2_rose',   formula:'@>--',  hint:'@>-- = A Rose',       emoji:'🌹', name:'ROSE',     sound:'heart',  color:'#F72585', level:2, desc:'@ + >-- = a ROSE! Try @>--' },
  { id:'l2_sun',    formula:'(*)',   hint:'(*) = Bright Sun',    emoji:'☀️', name:'SUN',      sound:'star',   color:'#FFD60A', level:2, desc:'Star inside brackets = SUN! Try (*)' },
  { id:'l2_star',   formula:'*.*',   hint:'*.*  = Starry Eyes',  emoji:'🤩', name:'STARRY',   sound:'star',   color:'#FB8500', level:2, desc:'Star dot star = Starry Eyes! Try *.*' },

  // ── LEVEL 3 — Vehicle & Action Sound Codes (Class 2–3) ───────────
  { id:'l3_car',    formula:'VROOM!', hint:'VROOM! = Car Sound',   emoji:'🚗', name:'CAR',      sound:'rocket', color:'#4CC9F0', level:3, desc:'Cars go VROOM! Type it! Try VROOM!' },
  { id:'l3_horn',   formula:'HONK!',  hint:'HONK! = Car Horn',     emoji:'📣', name:'HORN',     sound:'rocket', color:'#FFD60A', level:3, desc:'Car horns go HONK! Try HONK!' },
  { id:'l3_train',  formula:'CHOO!',  hint:'CHOO! = Train Sound',  emoji:'🚂', name:'TRAIN',    sound:'rocket', color:'#FB8500', level:3, desc:'Trains go CHOO CHOO! Try CHOO!' },
  { id:'l3_plane',  formula:'ZOOM!',  hint:'ZOOM! = Plane Flying', emoji:'✈️', name:'PLANE',    sound:'rocket', color:'#06D6A0', level:3, desc:'Planes go ZOOM through the sky! Try ZOOM!' },
  { id:'l3_robot',  formula:'BEEP!',  hint:'BEEP! = Robot Sound',  emoji:'🤖', name:'ROBOT',    sound:'magic',  color:'#94A3B8', level:3, desc:'Robots go BEEP BEEP! Try BEEP!' },
  { id:'l3_boom',   formula:'BOOM!',  hint:'BOOM! = Big Bang',     emoji:'💥', name:'BOOM',     sound:'rocket', color:'#F72585', level:3, desc:'Big explosion sound! Try BOOM!' },
  { id:'l3_splash', formula:'SPLASH!',hint:'SPLASH! = Water',      emoji:'💧', name:'SPLASH',   sound:'nature', color:'#4CC9F0', level:3, desc:'Water goes SPLASH! Try SPLASH!' },
  { id:'l3_fire',   formula:'WHOOSH!',hint:'WHOOSH! = Fire/Wind',  emoji:'🔥', name:'WHOOSH',   sound:'rocket', color:'#FB8500', level:3, desc:'Fire and wind go WHOOSH! Try WHOOSH!' },
  { id:'l3_boing',  formula:'BOING!', hint:'BOING! = Bounce',      emoji:'🏀', name:'BOING',    sound:'smile',  color:'#FFD60A', level:3, desc:'Balls bounce with BOING! Try BOING!' },
  { id:'l3_zap',    formula:'ZAP!',   hint:'ZAP! = Electric Bolt', emoji:'⚡', name:'ZAP',      sound:'star',   color:'#A78BFA', level:3, desc:'Lightning goes ZAP! Try ZAP!' },

  // ── LEVEL 4 — Fun Expressions & Social Codes (Class 3–4) ─────────
  { id:'l4_lol',    formula:'LOL',    hint:'LOL = Laughing Out Loud', emoji:'🤣', name:'LOL',      sound:'smile',  color:'#FFD60A', level:4, desc:'LOL means Laughing Out Loud! Try LOL' },
  { id:'l4_wow',    formula:'WOW!',   hint:'WOW! = Amazed',          emoji:'🤩', name:'WOW',      sound:'star',   color:'#FB8500', level:4, desc:'WOW means totally amazed! Try WOW!' },
  { id:'l4_yay',    formula:'YAY!',   hint:'YAY! = Celebration',     emoji:'🎉', name:'YAY',      sound:'clapping',color:'#06D6A0',level:4, desc:'YAY is a celebration shout! Try YAY!' },
  { id:'l4_omg',    formula:'OMG!',   hint:'OMG! = Oh My Goodness',  emoji:'😱', name:'OMG',      sound:'magic',  color:'#F72585', level:4, desc:'OMG means Oh My Goodness! Try OMG!' },
  { id:'l4_brb',    formula:'BRB',    hint:'BRB = Be Right Back',    emoji:'🏃', name:'BRB',      sound:'click',  color:'#4CC9F0', level:4, desc:'BRB means Be Right Back! Try BRB' },
  { id:'l4_hug',    formula:'{{}}}',  hint:'{{}} = Big Hug',         emoji:'🤗', name:'BIG HUG',  sound:'heart',  color:'#FF6B9D', level:4, desc:'Curly brackets = a Big HUG! Try {{}}' },
  { id:'l4_ok',     formula:'OK!',    hint:'OK! = All Good',         emoji:'👍', name:'OK',       sound:'smile',  color:'#06D6A0', level:4, desc:'OK means everything is good! Try OK!' },
  { id:'l4_pls',    formula:'PLZ!',   hint:'PLZ! = Please',          emoji:'🙏', name:'PLEASE',   sound:'click',  color:'#A78BFA', level:4, desc:'PLZ is chat-style Please! Try PLZ!' },
  { id:'l4_thx',    formula:'THX!',   hint:'THX! = Thank You',       emoji:'😊', name:'THANKS',   sound:'smile',  color:'#FFD60A', level:4, desc:'THX means Thank You in chat! Try THX!' },
  { id:'l4_gn',     formula:'GN!',    hint:'GN! = Good Night',       emoji:'🌙', name:'GOOD NIGHT',sound:'moon',  color:'#4361EE', level:4, desc:'GN means Good Night! Try GN!' },

  // ── LEVEL 5 — Creative Master Fun Codes (Class 4–5) ──────────────
  { id:'l5_crown',  formula:'(@)',    hint:'(@) = Crown/King',       emoji:'👑', name:'CROWN',    sound:'star',   color:'#FFD60A', level:5, desc:'@ in brackets = a CROWN! Try (@)' },
  { id:'l5_ninja',  formula:'(>_<)',  hint:'(>_<) = Ninja Face',     emoji:'🥷', name:'NINJA',    sound:'rocket', color:'#4361EE', level:5, desc:'Symbols make a Ninja Face! Try (>_<)' },
  { id:'l5_alien',  formula:'(O_O)',  hint:'(O_O) = Alien Face',     emoji:'👽', name:'ALIEN',    sound:'magic',  color:'#06D6A0', level:5, desc:'Big round eyes = Alien! Try (O_O)' },
  { id:'l5_party',  formula:'\\(^o^)/',hint:'\\(^o^)/ = Party Time!',emoji:'🥳', name:'PARTY',    sound:'clapping',color:'#F72585',level:5, desc:'Arms up = PARTY time! Try \\(^o^)/' },
  { id:'l5_robot2', formula:'[^_^]',  hint:'[^_^] = Happy Robot',    emoji:'🤖', name:'HAPPY BOT',sound:'magic',  color:'#94A3B8', level:5, desc:'Square brackets + face = Robot! Try [^_^]' },
  { id:'l5_bear',   formula:'(>-.-)>', hint:'(>-.-) = Teddy Bear',   emoji:'🐻', name:'TEDDY',    sound:'nature', color:'#FB8500', level:5, desc:'Symbol face = Teddy Bear! Try (>-.->' },
  { id:'l5_magic',  formula:'*-*',    hint:'*-* = Magic Sparkle',    emoji:'✨', name:'SPARKLE',  sound:'star',   color:'#A78BFA', level:5, desc:'Stars + dash = SPARKLE magic! Try *-*' },
  { id:'l5_fire2',  formula:'(>")>',  hint:'(>") = Kirby Dancing',   emoji:'💃', name:'KIRBY',    sound:'smile',  color:'#FF6B9D', level:5, desc:'Famous dancing Kirby! Try (>")>' },
  { id:'l5_sword',  formula:'(^)(^)',  hint:'(^)(^) = Double Win',    emoji:'🏆', name:'DOUBLE WIN',sound:'clapping',color:'#FFD60A',level:5, desc:'Two arms up = DOUBLE WIN! Try (^)(^)' },
  { id:'l5_wizard', formula:'(*_*)',   hint:'(*_*) = Wizard Amazed',  emoji:'🧙', name:'WIZARD',   sound:'magic',  color:'#7209B7', level:5, desc:'Stars for eyes = WIZARD! Try (*_*)' },
];

// ── STATE ─────────────────────────────────────────────────────────
let cmCurrentPuzzle = null;
let cmStars = 0;
let cmLevel = 1;
let cmHintUsed = false;
let cmUnlocked = [];
let cmConfettiTimer = null;
let cmFinalUnlocked = false;

// ── SAVE / LOAD PROGRESS ──────────────────────────────────────────
function cmSaveProgress(){
  try {
    localStorage.setItem('cm_level',    String(cmLevel));
    localStorage.setItem('cm_unlocked', JSON.stringify(cmUnlocked));
    localStorage.setItem('cm_stars',    String(cmStars));
  } catch(e){}
}
function cmLoadProgress(){
  try {
    const lv = parseInt(localStorage.getItem('cm_level') || '1', 10);
    const ul = JSON.parse(localStorage.getItem('cm_unlocked') || '[]');
    const st = parseInt(localStorage.getItem('cm_stars') || '0', 10);
    if(!isNaN(lv) && lv >= 1 && lv <= 5) cmLevel = lv;
    if(Array.isArray(ul)) cmUnlocked = ul;
    if(!isNaN(st)) cmStars = st;
  } catch(e){}
}
// Load progress immediately when the script runs
cmLoadProgress();

// ── AUDIO (Web Audio API — no external files needed) ─────────────
function cmPlaySound(type){
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);

    const patterns = {
      smile:   [[523,0],[659,0.12],[784,0.24],[1047,0.36]],
      heart:   [[392,0],[494,0.15],[392,0.3],[523,0.45]],
      star:    [[784,0],[880,0.1],[988,0.2],[1047,0.3],[1175,0.4]],
      cat:     [[523,0],[440,0.1],[392,0.2],[440,0.3],[659,0.4]], // meow
      rocket:  [[262,0],[330,0.05],[392,0.1],[523,0.15],[659,0.2],[784,0.25],[900,0.3],[1100,0.4]], // launch
      moon:    [[392,0],[440,0.15],[494,0.3],[440,0.45]],
      nature:  [[440,0],[494,0.1],[523,0.2],[587,0.3]],
      magic:   [[1047,0],[988,0.08],[880,0.16],[784,0.24],[988,0.32],[1175,0.4]],
      success: [[523,0],[659,0.08],[784,0.16],[1047,0.24],[1175,0.32]],
      clapping:[[523,0],[523,0.1],[523,0.2],[659,0.3],[659,0.4],[659,0.5],[784,0.6],[784,0.7],[1047,0.8]],
      click:   [[440,0],[523,0.06]],
      wrong:   [[300,0],[250,0.1],[200,0.2]],
    };
    const notes = patterns[type]||patterns.success;
    notes.forEach(([freq,delay])=>{
      const o2=ctx.createOscillator(); const g2=ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.frequency.value=freq; o2.type='sine';
      g2.gain.setValueAtTime(0,ctx.currentTime+delay);
      g2.gain.linearRampToValueAtTime(0.15,ctx.currentTime+delay+0.02);
      g2.gain.linearRampToValueAtTime(0,ctx.currentTime+delay+0.18);
      o2.start(ctx.currentTime+delay); o2.stop(ctx.currentTime+delay+0.22);
    });
  } catch(e){}
}

// ── REWARD SYSTEM ────────────────────────────────────────────────
function cmConfetti(n){
  const wrap=document.getElementById('cmConfettiWrap'); if(!wrap)return;
  const cols=['#FFD60A','#F72585','#4CC9F0','#06D6A0','#A78BFA','#FB8500','#FF6B9D'];
  for(let i=0;i<n;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      const size=6+Math.random()*10;
      p.style.cssText=`position:absolute;left:${5+Math.random()*90}%;top:-20px;
        width:${size}px;height:${size}px;background:${cols[Math.floor(Math.random()*cols.length)]};
        border-radius:${Math.random()>.5?'50%':'3px'};
        animation:cmFall ${0.8+Math.random()*0.8}s ease-in forwards;
        animation-delay:${Math.random()*0.4}s;pointer-events:none;z-index:99999;`;
      wrap.appendChild(p);
      setTimeout(()=>p.remove(),2000);
    },i*30);
  }
}

function cmGiftsRain(n){
  const wrap=document.getElementById('cmConfettiWrap'); if(!wrap)return;
  const gifts=['🎁','🧧','💝','🎀','✨','⭐'];
  for(let i=0;i<n;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      p.textContent=gifts[Math.floor(Math.random()*gifts.length)];
      p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-50px;
        font-size:${20+Math.random()*30}px;
        animation:cmFall ${2+Math.random()*2}s linear forwards;
        pointer-events:none;z-index:99999;`;
      wrap.appendChild(p);
      setTimeout(()=>p.remove(),4000);
    },i*100);
  }
}

function cmBalloonsFloat(n){
  const wrap=document.getElementById('cmConfettiWrap'); if(!wrap)return;
  const colors=['#FFD60A','#F72585','#4CC9F0','#06D6A0','#A78BFA'];
  for(let i=0;i<n;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      p.textContent='🎈';
      p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:110%;
        font-size:${30+Math.random()*40}px;filter:hue-rotate(${Math.random()*360}deg);
        animation:cmFloatUp ${3+Math.random()*3}s ease-out forwards;
        pointer-events:none;z-index:99999;`;
      wrap.appendChild(p);
      setTimeout(()=>p.remove(),6000);
    },i*200);
  }
}

function cmStarsAndSparkles(){
  const wrap=document.getElementById('cmConfettiWrap'); if(!wrap)return;
  for(let i=0;i<20;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      p.textContent=Math.random()>0.5?'⭐':'✨';
      p.style.cssText=`position:absolute;left:${20+Math.random()*60}%;top:${20+Math.random()*60}%;
        font-size:${20+Math.random()*30}px;
        animation:cmSparkle 1s ease-out forwards;
        pointer-events:none;z-index:99999;`;
      wrap.appendChild(p);
      setTimeout(()=>p.remove(),1000);
    },i*50);
  }
}

function cmDancingEmojis(){
  const wrap=document.getElementById('cmConfettiWrap'); if(!wrap)return;
  const emojis=['🕺','💃','👯','🥳','🎉'];
  for(let i=0;i<5;i++){
    const p=document.createElement('div');
    p.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    p.style.cssText=`position:absolute;left:${10+i*20}%;bottom:20px;
      font-size:50px;animation:cmDance 1s ease-in-out infinite;
      pointer-events:none;z-index:99999;`;
    wrap.appendChild(p);
    setTimeout(()=>p.remove(),4000);
  }
}

// ── RENDER PUZZLE CARDS — Level-grouped layout ────────────────────
function cmRenderCards(){
  const grid=document.getElementById('cmPuzzleGrid'); if(!grid)return;
  grid.innerHTML='';

  const levelInfo = [
    { num:1, label:'Level 1 — Smiley & Emotion Codes', icon:'😊', color:'#FFD60A', desc:'Nursery & UKG' },
    { num:2, label:'Level 2 — Animals & Nature Codes',  icon:'🐱', color:'#4CC9F0', desc:'Class 1 & 2' },
    { num:3, label:'Level 3 — Vehicle & Action Sounds', icon:'🚗', color:'#FF6B9D', desc:'Class 2 & 3' },
    { num:4, label:'Level 4 — Fun Chat & Social Codes', icon:'💬', color:'#06D6A0', desc:'Class 3 & 4' },
    { num:5, label:'Level 5 — Creative Master Codes',   icon:'🧙', color:'#A78BFA', desc:'Class 4 & 5' },
  ];

  levelInfo.forEach(lv => {
    const levelPuzzleIds = CM_PUZZLES.filter(p => p.level === lv.num).map(p => p.id);
    const isDone      = levelPuzzleIds.every(id => cmUnlocked.includes(id));
    const isLocked    = lv.num > cmLevel;
    const isCurrent   = lv.num === cmLevel;

    // ── Level section wrapper
    const section = document.createElement('div');
    section.className = 'cm-level-section' + (isLocked?' cm-lv-locked':'') + (isDone?' cm-lv-done':'') + (isCurrent?' cm-lv-current':'');

    // ── Level header
    const hdr = document.createElement('div');
    hdr.className = 'cm-lv-header';
    hdr.style.setProperty('--lc', lv.color);
    let badge = '';
    if(isDone)    badge = '<span class="cm-lv-badge cm-lv-badge-done">✅ COMPLETED</span>';
    if(isCurrent) badge = '<span class="cm-lv-badge cm-lv-badge-active">⚡ PLAY NOW</span>';
    if(isLocked)  badge = '<span class="cm-lv-badge cm-lv-badge-lock">🔒 LOCKED</span>';
    hdr.innerHTML = `
      <span class="cm-lv-icon">${isLocked?'🔒':(isDone?'🏆':lv.icon)}</span>
      <span class="cm-lv-title">${lv.label}</span>
      <span class="cm-lv-sub">${lv.desc}</span>
      ${badge}`;
    section.appendChild(hdr);

    // ── Cards row for this level
    const row = document.createElement('div');
    row.className = 'cm-level-cards';

    CM_PUZZLES.filter(p => p.level === lv.num).forEach(p => {
      const done   = cmUnlocked.includes(p.id);
      const card   = document.createElement('div');
      card.className = 'cm-card' + (isLocked?' cm-locked':'') + (done?' cm-done':'');
      card.style.setProperty('--cc', p.color);
      if(isLocked){
        card.innerHTML = `
          <div class="cm-card-emoji">🔒</div>
          <div class="cm-card-formula">Level ${lv.num}</div>
          <div class="cm-card-name">Locked</div>
          <div class="cm-card-hint">Finish Level ${lv.num-1} first!</div>`;
      } else {
        card.innerHTML = `
          <div class="cm-card-emoji">${p.emoji}${done?'<span class="cm-done-tick">✅</span>':''}</div>
          <div class="cm-card-formula">${p.formula}</div>
          <div class="cm-card-name">${p.name}</div>
          <div class="cm-card-hint">${p.desc}</div>`;
        card.onclick = () => cmSelectPuzzle(p);
      }
      row.appendChild(card);
    });

    section.appendChild(row);
    grid.appendChild(section);
  });
}

// ── SELECT PUZZLE ─────────────────────────────────────────────────
function cmSelectPuzzle(puzzle){
  cmPlaySound('click');
  cmCurrentPuzzle=puzzle;
  cmHintUsed=false;
  document.getElementById('cmPuzzleScreen').style.display='none';
  document.getElementById('cmGameScreen').style.display='block';
  document.getElementById('cmResultScreen').style.display='none';

  document.getElementById('cmGameEmoji').textContent=puzzle.emoji;
  document.getElementById('cmGameName').textContent=puzzle.name;
  document.getElementById('cmGameDesc').textContent=puzzle.desc;
  
  // Learning Hint: Code must always be shown below the image
  const hintEl = document.getElementById('cmHintText');
  hintEl.textContent = puzzle.hint;
  hintEl.style.display = 'block';
  hintEl.style.background = 'rgba(255,214,10,0.2)';
  hintEl.style.border = '2px solid #FFD60A';
  
  document.getElementById('cmInput').value='';
  document.getElementById('cmInput').focus();
  document.getElementById('cmFeedback').textContent='';
  document.getElementById('cmFeedback').className='cm-feedback';
}

// ── CHECK ANSWER ──────────────────────────────────────────────────
function cmCheckAnswer(){
  if(!cmCurrentPuzzle)return;
  const val=document.getElementById('cmInput').value.trim();
  if(!val){document.getElementById('cmFeedback').textContent='Type something! 🤔';return;}
  // Exact match OR case-insensitive match (for word-style codes like LOL, MEOW!)
  const correct = val === cmCurrentPuzzle.formula || val.toUpperCase() === cmCurrentPuzzle.formula.toUpperCase();
  if(correct){
    cmCorrect();
  } else {
    cmPlaySound('wrong');
    const fb=document.getElementById('cmFeedback');
    fb.textContent='❌ Try again! Look at the magic code shown above!';
    fb.className='cm-feedback cm-wrong';
    document.getElementById('cmGameEmoji').style.animation='cmShake 0.4s ease';
    setTimeout(()=>document.getElementById('cmGameEmoji').style.animation='cmEmojiFloat 2s ease-in-out infinite',500);
  }
}

// ── CORRECT ANSWER ────────────────────────────────────────────────
function cmCorrect(){
  const p=cmCurrentPuzzle;
  cmPlaySound('clapping');
  setTimeout(()=>cmPlaySound(p.sound||'success'), 500);

  let levelJustFinished = false;
  let completedLevelNum = 0;

  if(!cmUnlocked.includes(p.id)){
    cmUnlocked.push(p.id);
    cmStars+=10;

    const levelPuzzles = CM_PUZZLES.filter(x => x.level === cmLevel);
    const completedLevel = levelPuzzles.every(x => cmUnlocked.includes(x.id));
    if(completedLevel){
      levelJustFinished = true;
      completedLevelNum = cmLevel;
      if(cmLevel < 5) cmLevel++;
      else cmFinalUnlocked = true;
    }
    // Save progress after every solved puzzle
    cmSaveProgress();
  }

  document.getElementById('cmPuzzleScreen').style.display='none';
  document.getElementById('cmGameScreen').style.display='none';
  document.getElementById('cmResultScreen').style.display='flex';
  document.getElementById('cmResultEmoji').textContent=p.emoji;
  document.getElementById('cmResultName').textContent=p.name;
  document.getElementById('cmResultMsg').textContent='You created a '+p.name+' with magic code! Amazing! 🪄';
  document.getElementById('cmStarCount').textContent=cmStars;
  document.getElementById('cmLevelBadge').textContent='Level '+cmLevel;

  // Celebration intensity scales with level
  const intensity = completedLevelNum > 0 ? completedLevelNum * 30 : cmLevel * 20;
  cmConfetti(intensity + 50);
  cmGiftsRain(intensity + 15);
  cmBalloonsFloat(intensity + 10);
  cmStarsAndSparkles();
  cmDancingEmojis();

  if(levelJustFinished){
    cmShowNameCelebration(completedLevelNum);
  }

  cmAnimateResult();
}

// (Bike, Car and Doll dress-up mini-games fully removed as per spec)

// ── NAME CELEBRATION FULL-SCREEN POP-UP ──────────────────────────
function cmShowNameCelebration(completedLevelNum){

  // ── Safe name lookup — try 3 sources, then fallback
  var childName = 'CHAMPION';
  try {
    var n1 = window.currentUser && window.currentUser.name;
    var n2 = localStorage.getItem('vbs_student_name');
    var n3 = localStorage.getItem('userName');
    if(n1 && n1.trim()) childName = n1.trim().toUpperCase();
    else if(n2 && n2.trim()) childName = n2.trim().toUpperCase();
    else if(n3 && n3.trim()) childName = n3.trim().toUpperCase();
  } catch(e){}

  // ── Level-specific messages & drum themes
  var lvData = {
    1:{ line1:'🏆 '+childName+' COMPLETED LEVEL 1! 🏆', line2:'⭐ You are a Magic Coder! ⭐',
        bg:'radial-gradient(ellipse at center,rgba(30,0,60,0.97) 0%,rgba(5,0,18,0.99) 100%)',
        drumL:'🥁', drumR:'🪘', drumColor:'#FFD60A', drumName:'Cute Drums',
        particles:['⭐','✨','🌟','💛','🎵'], topIcon:'🏆' },
    2:{ line1:'🌟 '+childName+' IS A MAGIC CODER! 🌟', line2:'🌈 Level 2 Done! Amazing! 🌈',
        bg:'radial-gradient(ellipse at center,rgba(0,20,60,0.97) 0%,rgba(0,5,20,0.99) 100%)',
        drumL:'🪘', drumR:'🥁', drumColor:'#4CC9F0', drumName:'Rainbow Drums',
        particles:['🌈','💙','🩵','🎶','✨'], topIcon:'🌟' },
    3:{ line1:'🎉 '+childName+' UNLOCKED LEVEL 4! 🎉', line2:'🪄 Amazing! You are a Wizard! 🪄',
        bg:'radial-gradient(ellipse at center,rgba(0,30,20,0.97) 0%,rgba(0,8,5,0.99) 100%)',
        drumL:'🥁', drumR:'🥁', drumColor:'#06D6A0', drumName:'Glowing Drums',
        particles:['💚','🔥','⚡','✨','🎉'], topIcon:'🎉' },
    4:{ line1:'🚀 '+childName+' IS ALMOST A WIZARD! 🚀', line2:'💫 Just one more level! 💫',
        bg:'radial-gradient(ellipse at center,rgba(40,0,40,0.97) 0%,rgba(10,0,10,0.99) 100%)',
        drumL:'🪘', drumR:'🪘', drumColor:'#F72585', drumName:'Dancing Drums',
        particles:['💃','🕺','🎊','💖','🚀'], topIcon:'🚀' },
    5:{ line1:'✨ '+childName+' IS A MASTER WIZARD! ✨', line2:'🧙 All 5 Levels Complete! 🧙',
        bg:'radial-gradient(ellipse at center,rgba(50,20,0,0.97) 0%,rgba(10,5,0,0.99) 100%)',
        drumL:'🥁', drumR:'🪘', drumColor:'#FFD60A', drumName:'Grand Drums',
        particles:['🏆','👑','🌟','🎆','🎇'], topIcon:'🧙' },
  };
  var d = lvData[completedLevelNum] || lvData[1];

  // ── Inject keyframes once
  if(!document.getElementById('cmCelebStyle')){
    var st = document.createElement('style');
    st.id = 'cmCelebStyle';
    st.textContent =
      '@keyframes cmCelebIn{from{opacity:0;transform:scale(0.7) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
      '@keyframes cmCelebOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.85) translateY(-20px)}}' +
      '@keyframes cmCelebFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.06)}}' +
      '@keyframes cmCelebDance{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-10px) rotate(-6deg)}75%{transform:translateY(-10px) rotate(6deg)}}' +
      '@keyframes cmCelebShine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
      '@keyframes cmNamePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}' +
      '@keyframes cmDrumBeat{0%,100%{transform:translateY(0) scale(1) rotate(0deg)}20%{transform:translateY(-18px) scale(1.12) rotate(-8deg)}40%{transform:translateY(0) scale(0.95) rotate(0deg)}60%{transform:translateY(-10px) scale(1.07) rotate(5deg)}80%{transform:translateY(0) scale(1) rotate(0deg)}}' +
      '@keyframes cmDrumBeatR{0%,100%{transform:translateY(0) scale(1) rotate(0deg)}20%{transform:translateY(-18px) scale(1.12) rotate(8deg)}40%{transform:translateY(0) scale(0.95) rotate(0deg)}60%{transform:translateY(-10px) scale(1.07) rotate(-5deg)}80%{transform:translateY(0) scale(1) rotate(0deg)}}' +
      '@keyframes cmSparkRing{0%{transform:scale(0) rotate(0deg);opacity:1}100%{transform:scale(2.5) rotate(180deg);opacity:0}}' +
      '@keyframes cmParticleFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}';
    document.head.appendChild(st);
  }

  // ── Remove previous pop
  var old = document.getElementById('cmCelebPop');
  if(old) old.remove();

  // ── Build drum SVG (pure CSS emoji-based character)
  function makeDrum(side, lv, color, emoji){
    // Each level gets a different beat speed and visual accent
    var speeds = {1:'0.55s',2:'0.48s',3:'0.42s',4:'0.38s',5:'0.32s'};
    var glows  = {1:'none',2:'0 0 20px '+color,3:'0 0 30px '+color+',0 0 60px '+color,4:'0 0 20px '+color,5:'0 0 40px '+color+',0 0 80px '+color};
    var anim   = side === 'left' ? 'cmDrumBeat' : 'cmDrumBeatR';
    var speed  = speeds[lv]||'0.5s';
    var glow   = glows[lv]||'none';
    // Extra sparkle ring for high levels
    var ring = (lv >= 3) ?
      '<div style="position:absolute;top:50%;left:50%;width:80px;height:80px;' +
      'margin:-40px 0 0 -40px;border-radius:50%;border:3px solid '+color+';' +
      'animation:cmSparkRing '+(parseFloat(speed)*2)+'s ease-out infinite;pointer-events:none;"></div>' : '';
    return '<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      ring +
      '<div style="font-size:clamp(3rem,8vw,5.5rem);' +
        'animation:'+anim+' '+speed+' ease-in-out infinite;' +
        'filter:drop-shadow('+glow+');' +
        'display:block;line-height:1;">'+emoji+'</div>' +
      '<div style="font-size:clamp(1.4rem,4vw,2.2rem);animation:cmCelebDance '+(parseFloat(speed)*1.5)+'s ease-in-out infinite;line-height:1;">🎵</div>' +
      '<div style="font-size:0.65rem;font-weight:900;color:'+color+';font-family:\'Baloo 2\',cursive;letter-spacing:1px;margin-top:4px;">'+d.drumName+'</div>' +
    '</div>';
  }

  // ── Build floating particles HTML (20 particles per drum side)
  function makeParticles(side){
    var html = '';
    var pts = d.particles;
    for(var i=0;i<14;i++){
      var px = (side==='left'?-1:1)*(40+Math.floor(Math.random()*120));
      var py = -(80+Math.floor(Math.random()*140));
      var delay = (Math.random()*2.5).toFixed(2);
      var dur   = (1.5+Math.random()*2).toFixed(2);
      var emoji = pts[Math.floor(Math.random()*pts.length)];
      var fs    = 14+Math.floor(Math.random()*22);
      html +=
        '<div style="position:absolute;bottom:10px;'+(side==='left'?'left:10px':'right:10px')+';' +
        '--px:'+px+'px;--py:'+py+'px;' +
        'font-size:'+fs+'px;pointer-events:none;' +
        'animation:cmParticleFly '+dur+'s ease-out '+delay+'s infinite;">'+emoji+'</div>';
    }
    return html;
  }

  // ── Assemble popup
  var pop = document.createElement('div');
  pop.id = 'cmCelebPop';
  pop.style.cssText =
    'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;' +
    'display:flex;flex-direction:row;align-items:center;justify-content:space-between;' +
    'background:'+d.bg+';text-align:center;' +
    'padding:16px 8px;overflow:hidden;' +
    'animation:cmCelebIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards;cursor:pointer;';

  // LEFT DRUM column
  var leftCol =
    '<div style="position:relative;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;min-width:clamp(70px,15vw,140px);flex-shrink:0;">' +
    makeParticles('left') +
    makeDrum('left', completedLevelNum, d.drumColor, d.drumL) +
    '</div>';

  // CENTER content
  var center =
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'padding:0 8px;gap:10px;min-width:0;">' +

    // Big floating icon
    '<div style="font-size:clamp(3rem,10vw,6rem);animation:cmCelebFloat 1.8s ease-in-out infinite;line-height:1;">'+d.topIcon+'</div>' +

    // HUGE child name line
    '<div style="' +
      'font-family:\'Baloo 2\',Nunito,cursive;' +
      'font-size:clamp(1.6rem,6.5vw,3.8rem);' +
      'font-weight:900;line-height:1.2;' +
      'background:linear-gradient(135deg,#FFD60A,#F72585,#4CC9F0,#06D6A0,#A78BFA,#FFD60A);' +
      'background-size:400% 400%;' +
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;' +
      'animation:cmCelebShine 1.8s ease-in-out infinite,cmNamePulse 1s ease-in-out infinite;' +
      'padding:0 4px;word-break:break-word;">' +
      d.line1 +
    '</div>' +

    // Sub line
    '<div style="' +
      'font-family:\'Baloo 2\',Nunito,cursive;' +
      'font-size:clamp(0.85rem,2.5vw,1.35rem);' +
      'font-weight:800;color:rgba(255,255,255,0.92);' +
      'text-shadow:0 0 12px rgba(255,214,10,0.5);">' +
      d.line2 +
    '</div>' +

    // Dancing emoji row
    '<div style="font-size:clamp(1.6rem,5vw,2.6rem);letter-spacing:6px;' +
      'animation:cmCelebDance 0.9s ease-in-out infinite;">🎉🎊🎈🎊🎉</div>' +

    // Stars row
    '<div style="font-size:clamp(1rem,3vw,1.6rem);letter-spacing:4px;' +
      'animation:cmCelebDance 1.2s ease-in-out 0.2s infinite;">⭐🌟💫✨🌟⭐</div>' +

    '<div style="font-family:\'Baloo 2\',Nunito,cursive;font-size:0.78rem;' +
      'color:rgba(255,255,255,0.3);margin-top:6px;">✨ Tap anywhere to continue ✨</div>' +

    '</div>';

  // RIGHT DRUM column
  var rightCol =
    '<div style="position:relative;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;min-width:clamp(70px,15vw,140px);flex-shrink:0;">' +
    makeParticles('right') +
    makeDrum('right', completedLevelNum, d.drumColor, d.drumR) +
    '</div>';

  pop.innerHTML = leftCol + center + rightCol;
  document.body.appendChild(pop);

  // ── Play drum beat sound pattern based on level
  try {
    var ctx2 = new (window.AudioContext||window.webkitAudioContext)();
    var beatFreqs = {1:[200,220,200,240],2:[180,220,180,260,180],3:[160,200,240,200,160,200],4:[150,180,220,260,220,180,150],5:[120,160,200,240,280,240,200,160,120]};
    var freqs = beatFreqs[completedLevelNum]||beatFreqs[1];
    freqs.forEach(function(freq,i){
      setTimeout(function(){
        try{
          var o=ctx2.createOscillator(); var g=ctx2.createGain();
          o.connect(g); g.connect(ctx2.destination);
          o.type='triangle'; o.frequency.value=freq;
          g.gain.setValueAtTime(0,ctx2.currentTime);
          g.gain.linearRampToValueAtTime(0.22,ctx2.currentTime+0.02);
          g.gain.linearRampToValueAtTime(0,ctx2.currentTime+0.18);
          o.start(ctx2.currentTime); o.stop(ctx2.currentTime+0.22);
        }catch(e){}
      }, i*160);
    });
  } catch(e){}

  // ── Dismiss on click or after 5.5s
  var dismiss = function(){
    pop.style.animation = 'cmCelebOut 0.35s ease forwards';
    setTimeout(function(){ if(pop&&pop.parentNode) pop.remove(); }, 380);
  };
  pop.addEventListener('click', dismiss);
  setTimeout(dismiss, 5500);
}


// ── ANIMATE RESULT ────────────────────────────────────────────────
function cmAnimateResult(){
  const el=document.getElementById('cmResultEmoji'); if(!el)return;
  el.style.animation='none';
  setTimeout(()=>el.style.animation='cmResultBounce 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards, cmResultFloat 2s ease-in-out 0.6s infinite',10);
}

// ── HINT ──────────────────────────────────────────────────────────
function cmShowHint(){
  cmHintUsed=true;
  document.getElementById('cmHintText').style.display='block';
  cmPlaySound('click');
}

// ── OPEN / CLOSE ──────────────────────────────────────────────────
window.openCodeMagicGame=function(){
  cmPlaySound('click');
  // Always reload saved progress when game opens
  cmLoadProgress();
  const overlay=document.getElementById('cmOverlay');
  if(!overlay){cmBuildOverlay();return;}
  overlay.style.display='flex';
  setTimeout(()=>overlay.style.opacity='1',10);
  cmRenderCards();
  document.getElementById('cmPuzzleScreen').style.display='block';
  document.getElementById('cmGameScreen').style.display='none';
  document.getElementById('cmResultScreen').style.display='none';
  document.getElementById('cmStarCount').textContent=cmStars;
  document.getElementById('cmLevelBadge').textContent='Level '+cmLevel;
};

function cmClose(){
  const overlay=document.getElementById('cmOverlay'); if(!overlay)return;
  overlay.style.opacity='0';
  setTimeout(()=>overlay.style.display='none',300);
}

// ── BUILD OVERLAY DOM ─────────────────────────────────────────────
function cmBuildOverlay(){
  const div=document.createElement('div');
  div.id='cmOverlay';
  div.innerHTML=`
<style>
#cmOverlay{position:fixed;inset:0;z-index:99998;background:rgba(10,5,30,0.96);
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
  overflow-y:auto;opacity:0;transition:opacity 0.3s;font-family:'Baloo 2',Nunito,cursive;
  padding:16px 8px 40px;}
.cm-header{width:100%;max-width:900px;display:flex;align-items:center;justify-content:space-between;
  padding:12px 20px;background:linear-gradient(135deg,#7209B7,#4361EE);
  border-radius:20px;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
.cm-title{font-size:1.5rem;font-weight:900;color:#fff;text-shadow:0 0 16px rgba(255,214,10,0.8);}
.cm-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
.cm-star-badge{background:rgba(255,214,10,0.2);border:2px solid #FFD60A;border-radius:50px;
  padding:4px 14px;font-size:0.85rem;font-weight:800;color:#FFD60A;}
.cm-level-badge{background:rgba(76,201,240,0.2);border:2px solid #4CC9F0;border-radius:50px;
  padding:4px 14px;font-size:0.85rem;font-weight:800;color:#4CC9F0;}
.cm-close-btn{background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.3);
  border-radius:50%;width:40px;height:40px;color:#fff;font-size:1.2rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
.cm-close-btn:hover{background:#F72585;border-color:#F72585;}
/* Puzzle grid — level sections */
#cmPuzzleGrid{display:flex;flex-direction:column;gap:20px;width:100%;}
.cm-level-section{border-radius:20px;overflow:hidden;
  border:2px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);}
.cm-lv-current{border-color:rgba(255,214,10,0.5);
  box-shadow:0 0 24px rgba(255,214,10,0.15);}
.cm-lv-done{border-color:rgba(6,214,160,0.4);background:rgba(6,214,160,0.04);}
.cm-lv-locked{opacity:0.55;}
.cm-lv-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:12px 16px;background:linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02));
  border-bottom:1px solid rgba(255,255,255,0.08);cursor:default;}
.cm-lv-icon{font-size:1.6rem;}
.cm-lv-title{font-size:1rem;font-weight:900;color:#fff;flex:1;}
.cm-lv-sub{font-size:0.72rem;color:rgba(255,255,255,0.5);}
.cm-lv-badge{font-size:0.72rem;font-weight:900;border-radius:50px;padding:3px 10px;}
.cm-lv-badge-done{background:rgba(6,214,160,0.2);color:#06D6A0;border:1px solid #06D6A0;}
.cm-lv-badge-active{background:rgba(255,214,10,0.2);color:#FFD60A;border:1px solid #FFD60A;
  animation:cmBadgePulse 1.2s ease-in-out infinite;}
.cm-lv-badge-lock{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.2);}
@keyframes cmBadgePulse{0%,100%{box-shadow:0 0 0 0 rgba(255,214,10,0.4)}50%{box-shadow:0 0 0 6px rgba(255,214,10,0)}}
.cm-level-cards{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:12px;}
.cm-card{background:rgba(255,255,255,0.05);border:2px solid var(--cc,#A855F7);
  border-radius:14px;padding:14px 8px;text-align:center;cursor:pointer;
  transition:all 0.25s;position:relative;overflow:hidden;}
.cm-card:not(.cm-locked):hover{transform:translateY(-5px) scale(1.04);
  box-shadow:0 8px 28px rgba(0,0,0,0.4),0 0 18px var(--cc,#A855F7);
  background:rgba(255,255,255,0.1);}
.cm-locked{opacity:0.4;cursor:not-allowed;border-color:rgba(255,255,255,0.12);}
.cm-done{border-color:#06D6A0;background:rgba(6,214,160,0.07);}
.cm-card-emoji{font-size:2.2rem;margin-bottom:4px;display:block;position:relative;}
.cm-done-tick{position:absolute;top:-6px;right:-6px;font-size:0.9rem;}
.cm-card-formula{font-size:0.95rem;font-weight:900;color:#FFD60A;margin-bottom:4px;
  letter-spacing:1px;text-shadow:0 0 8px rgba(255,214,10,0.6);font-family:monospace;}
.cm-card-name{font-size:0.72rem;font-weight:800;color:rgba(255,255,255,0.8);margin-bottom:2px;}
.cm-card-hint{font-size:0.62rem;color:rgba(255,255,255,0.45);line-height:1.3;}
/* Game screen */
#cmGameScreen{width:100%;max-width:600px;display:none;flex-direction:column;
  align-items:center;gap:16px;background:rgba(255,255,255,0.04);
  border:2px solid rgba(255,255,255,0.1);border-radius:24px;padding:24px;}
.cm-game-emoji{font-size:5rem;animation:cmEmojiFloat 2s ease-in-out infinite;
  filter:drop-shadow(0 0 16px rgba(255,214,10,0.8));text-align:center;}
.cm-game-title{font-size:1.3rem;font-weight:900;color:#FFD60A;text-align:center;}
.cm-game-desc{font-size:0.9rem;color:rgba(255,255,255,0.7);text-align:center;max-width:400px;}
.cm-formula-box{background:rgba(67,97,238,0.15);border:2px dashed #4361EE;
  border-radius:14px;padding:14px 20px;text-align:center;width:100%;}
.cm-formula-label{font-size:0.78rem;font-weight:800;color:#4CC9F0;
  text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
.cm-input{width:100%;max-width:360px;background:rgba(255,255,255,0.08);
  border:3px solid #A855F7;border-radius:14px;padding:14px 18px;
  font-family:'Baloo 2',cursive;font-size:1.4rem;font-weight:800;
  color:#fff;text-align:center;outline:none;transition:border 0.2s;
  letter-spacing:2px;}
.cm-input:focus{border-color:#FFD60A;box-shadow:0 0 0 4px rgba(255,214,10,0.15);}
.cm-btn-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
.cm-check-btn{background:linear-gradient(135deg,#06D6A0,#4361EE);border:none;
  border-radius:14px;padding:13px 30px;font-family:'Baloo 2',cursive;
  font-size:1.05rem;font-weight:900;color:#fff;cursor:pointer;
  box-shadow:0 5px 0 rgba(0,80,60,0.4),0 0 20px rgba(6,214,160,0.4);
  transition:all 0.15s;}
.cm-check-btn:hover{transform:translateY(-3px);box-shadow:0 8px 0 rgba(0,80,60,0.35),0 0 30px rgba(6,214,160,0.6);}
.cm-check-btn:active{transform:translateY(2px);}
.cm-back-btn{background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.2);
  border-radius:14px;padding:13px 20px;font-family:'Baloo 2',cursive;
  font-size:0.92rem;font-weight:800;color:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.2s;}
.cm-back-btn:hover{background:rgba(255,255,255,0.15);}
.cm-hint-text{font-size:1.1rem;font-weight:900;color:#FFD60A;text-align:center;
  background:rgba(255,214,10,0.1);border:2px solid rgba(255,214,10,0.3);
  border-radius:12px;padding:10px 20px;display:none;}
.cm-feedback{font-size:1rem;font-weight:800;min-height:28px;text-align:center;}
.cm-wrong{color:#FC8181;}
/* Result screen */
#cmResultScreen{width:100%;max-width:600px;display:none;flex-direction:column;
  align-items:center;gap:16px;background:rgba(255,255,255,0.04);
  border:3px solid #FFD60A;border-radius:24px;padding:32px 20px;text-align:center;}
.cm-result-emoji{font-size:6rem;filter:drop-shadow(0 0 24px #FFD60A);}
.cm-result-name{font-size:2rem;font-weight:900;
  background:linear-gradient(135deg,#FFD60A,#F72585,#4CC9F0);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;animation:cmGlowText 2s ease-in-out infinite;}
.cm-result-msg{font-size:1rem;color:rgba(255,255,255,0.85);max-width:380px;line-height:1.6;margin-bottom:10px;}
.cm-result-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.cm-play-again-btn{background:linear-gradient(135deg,#F72585,#7209B7);border:none;
  border-radius:14px;padding:12px 28px;font-family:'Baloo 2',cursive;
  font-size:1rem;font-weight:900;color:#fff;cursor:pointer;transition:all 0.2s;
  box-shadow:0 5px 0 rgba(80,0,100,0.4);}
.cm-play-again-btn:hover{transform:translateY(-3px);}
.cm-more-btn{background:linear-gradient(135deg,#4CC9F0,#4361EE);border:none;
  border-radius:14px;padding:12px 28px;font-family:'Baloo 2',cursive;
  font-size:1rem;font-weight:900;color:#fff;cursor:pointer;transition:all 0.2s;
  box-shadow:0 5px 0 rgba(0,30,120,0.4);}
.cm-more-btn:hover{transform:translateY(-3px);}

/* Name Celebration Banner */
#cmBonusGames{display:none;}
#cmNameCelebration{
  font-size:1.6rem;font-weight:900;text-align:center;
  background:linear-gradient(135deg,#FFD60A,#F72585,#4CC9F0,#06D6A0);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;background-size:300% 300%;
  animation:cmNameShine 1.5s ease-in-out infinite, cmNamePop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
  line-height:1.4;padding:10px 0;text-shadow:none;
  filter:drop-shadow(0 0 12px rgba(255,214,10,0.5));
}
@keyframes cmNameShine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cmNamePop{0%{transform:scale(0) rotate(-5deg);opacity:0}70%{transform:scale(1.1) rotate(2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}

/* Confetti wrapper */
#cmConfettiWrap{position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;}
/* Keyframes */
@keyframes cmEmojiFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.05)}}
@keyframes cmShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
@keyframes cmFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes cmFloatUp{to{transform:translateY(-120vh) rotate(20deg);opacity:0}}
@keyframes cmSparkle{0%{transform:scale(0);opacity:0}50%{transform:scale(1.5);opacity:1}100%{transform:scale(0);opacity:0}}
@keyframes cmDance{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-10px) rotate(-5deg)}75%{transform:translateY(-10px) rotate(5deg)}}
@keyframes cmResultBounce{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes cmResultFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes cmGlowText{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3) drop-shadow(0 0 8px #FFD60A)}}
@media(max-width:600px){
  .cm-level-cards{grid-template-columns:repeat(2,1fr);}
  .cm-lv-title{font-size:0.85rem;}
  .cm-title{font-size:1.1rem;}
  #cmGameScreen,#cmResultScreen{padding:18px 12px;}
  .cm-game-emoji{font-size:3.5rem;}
}
@media(min-width:601px) and (max-width:800px){
  .cm-level-cards{grid-template-columns:repeat(3,1fr);}
}
@media(max-width:380px){
  .cm-level-cards{grid-template-columns:1fr 1fr;}
  .cm-card-formula{font-size:0.82rem;}
}
</style>
<div id="cmConfettiWrap"></div>
<div class="cm-header">
  <span class="cm-title">🪄 Code Magic — Master Wizard!</span>
  <div class="cm-meta">
    <span class="cm-star-badge">⭐ <span id="cmStarCount">0</span> Stars</span>
    <span class="cm-level-badge" id="cmLevelBadge">Level 1</span>
    <button class="cm-close-btn" onclick="window._cmClose()">✕</button>
  </div>
</div>

<!-- PUZZLE SELECT SCREEN -->
<div id="cmPuzzleScreen" style="width:100%;max-width:900px;">
  <div class="cm-section-title">✨ See the Magic Code on each card — type it to cast the spell! ✨</div>
  <div id="cmPuzzleGrid"></div>
</div>

<!-- GAME SCREEN -->
<div id="cmGameScreen" style="display:none;">
  <div class="cm-game-emoji" id="cmGameEmoji">😊</div>
  <div class="cm-game-title" id="cmGameName">SMILE</div>
  <div class="cm-game-desc" id="cmGameDesc">Two symbols make a SMILE!</div>
  <div class="cm-formula-box">
    <div class="cm-formula-label">🧑‍💻 Type the Magic Code Formula:</div>
    <div class="cm-hint-text" id="cmHintText" style="display:block;margin-bottom:15px;font-size:1.5rem;"></div>
    <input class="cm-input" id="cmInput" type="text" autocomplete="off" autocorrect="off"
      spellcheck="false" placeholder="Type magic code..."
      onkeydown="if(event.key==='Enter')window._cmCheck()">
  </div>
  <div class="cm-feedback" id="cmFeedback"></div>
  <div class="cm-btn-row">
    <button class="cm-check-btn" onclick="window._cmCheck()">✅ Create Magic!</button>
    <button class="cm-back-btn" onclick="window._cmBack()">← Back</button>
  </div>
</div>

<!-- RESULT SCREEN -->
<div id="cmResultScreen" style="display:none;">
  <div class="cm-result-emoji" id="cmResultEmoji">😊</div>
  <div class="cm-result-name" id="cmResultName">SMILE</div>
  <div class="cm-result-msg" id="cmResultMsg">Amazing!</div>
  
  <!-- Bonus Games placeholder — always hidden, removed per spec -->
  <div id="cmBonusGames" style="display:none;"></div>


  <div class="cm-result-btns">
    <button class="cm-play-again-btn" onclick="window._cmPlayAgain()">🔄 Play Again!</button>
    <button class="cm-more-btn" onclick="window._cmMore()">🎮 More Puzzles!</button>
  </div>
</div>
`;
  document.body.appendChild(div);
  // expose handlers
  window._cmClose=cmClose;
  window._cmCheck=cmCheckAnswer;
  window._cmHint=cmShowHint;
  window._cmBack=()=>{
    document.getElementById('cmPuzzleScreen').style.display='block';
    document.getElementById('cmGameScreen').style.display='none';
    cmRenderCards();
  };
  window._cmPlayAgain=()=>{if(cmCurrentPuzzle)cmSelectPuzzle(cmCurrentPuzzle);};
  window._cmMore=()=>{
    document.getElementById('cmPuzzleScreen').style.display='block';
    document.getElementById('cmResultScreen').style.display='none';
    document.getElementById('cmStarCount').textContent=cmStars;
    document.getElementById('cmLevelBadge').textContent='Level '+cmLevel;
    cmRenderCards();
  };
  // now open
  setTimeout(()=>{
    div.style.opacity='1';
    cmRenderCards();
    document.getElementById('cmPuzzleScreen').style.display='block';
    document.getElementById('cmStarCount').textContent=cmStars;
    document.getElementById('cmLevelBadge').textContent='Level '+cmLevel;
  },20);
}

})();
