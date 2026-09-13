const state = { step:0, energy:null, context:null, temp:null };
const totalSteps = 3;

function renderProgress(){
  const wrap = document.getElementById('progress');
  wrap.innerHTML='';
  for(let i=0;i<totalSteps;i++){
    const d = document.createElement('div');
    d.className='dot' + (i < state.step-1 ? ' done' : '') + (i === state.step-1 ? ' active' : '');
    wrap.appendChild(d);
  }
}

function goTo(step){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('visible'));
  const ids = ['intro','q1','q2','q3','result'];
  document.getElementById(ids[step]).classList.add('visible');
  state.step = step;
  renderProgress();
  if(step===0){ document.getElementById('progress').style.visibility='hidden'; }
  else { document.getElementById('progress').style.visibility='visible'; }
}

function answer(key, value){
  state[key] = value;
  if(key==='energy') goTo(2);
  else if(key==='context') goTo(3);
  else if(key==='temp'){ computeResult(); goTo(4); }
}

// persona matrix: energy(0 low,1 mid,2 high) x temp(0 cold,1 warm,2 strong)
const matrix = [
  [ // low energy
    { name:'THE ICED HUSTLER', tag:'جيتي تاخدي قهوة… وطلعتي بطاقة زيادة، رغم كل التعب.', drink:'Iced Caramel Latte' },
    { name:'THE COZY SOUL', tag:'مش ناقصة سرعة، ناقصة دفا. كوب يحضنك أحسن من كوب يصحيك.', drink:'Hot Rose Latte' },
    { name:'THE QUIET FIGHTER', tag:'تعبانة بس مش واقفة. بدك إشي قوي يمشي أمورك بهدوء.', drink:'Turkish Coffee' }
  ],
  [ // mid energy
    { name:'THE CHILL SPARK', tag:'مش تعبانة ومش نشيطة… بس ناوية يومك يصير أحلى شوي.', drink:'Iced Pistachio Latte' },
    { name:'THE STEADY SOUL', tag:'موزونة اليوم، وبدك كوب يحافظلك على هالتوازن.', drink:'Hot Flat White' },
    { name:'THE FOCUSED GRINDER', tag:'يومك عادي بس لسته طويل، وبدك وقود يخليك على المسار.', drink:'Hot Spanish Latte' }
  ],
  [ // high energy
    { name:'THE ICE BREAKER', tag:'طاقتك عالية والمود اجتماعي… كوب يناسب الحكي والضحك.', drink:'Iced White Mocha' },
    { name:'THE WARM ENGINE', tag:'نشيطة بس بدك تبطي شوي وتستمتعي بفنجانك.', drink:'Cappuccino' },
    { name:'THE UNSTOPPABLE FORCE', tag:'كل شي جاهز إلك اليوم… إلا الوقود. هاد الكوب رح يكمّل الصورة.', drink:'Espresso' }
  ]
];

const contextLine = [
  ' وحدك بهدوء البيت.',
  ' مع ناس بتحبيهم.',
  ' وسط زحمة شغل.'
];

let currentResult = null;

function computeResult(){
  const p = matrix[state.energy][state.temp];
  currentResult = {
    name: p.name,
    tag: p.tag,
    contextNote: contextLine[state.context],
    drink: p.drink
  };
  document.getElementById('personaName').textContent = currentResult.name;
  document.getElementById('personaTag').textContent = currentResult.tag;
  document.getElementById('matchDrink').textContent = currentResult.drink;
}

function restart(){
  state.energy=state.context=state.temp=null;
  goTo(0);
}

async function downloadCard(){
  await document.fonts.ready;
  const canvas = document.getElementById('exportCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // background
  ctx.fillStyle = '#120D0A';
  ctx.fillRect(0,0,W,H);

  const g1 = ctx.createRadialGradient(W*0.15,H*0.12,10,W*0.15,H*0.12,W*0.6);
  g1.addColorStop(0,'rgba(193,83,29,0.35)');
  g1.addColorStop(1,'rgba(193,83,29,0)');
  ctx.fillStyle = g1; ctx.fillRect(0,0,W,H);

  const g2 = ctx.createRadialGradient(W*0.85,H*0.9,10,W*0.85,H*0.9,W*0.6);
  g2.addColorStop(0,'rgba(95,216,209,0.30)');
  g2.addColorStop(1,'rgba(95,216,209,0)');
  ctx.fillStyle = g2; ctx.fillRect(0,0,W,H);

  ctx.textAlign='center';

  // wordmark
  ctx.fillStyle = '#A6957F';
  ctx.font = '600 30px "IBM Plex Sans Arabic"';
  ctx.fillText('BLK MOOD DROP', W/2, 120);

  // eyebrow
  ctx.fillStyle = '#5FD8D1';
  ctx.font = '600 26px "IBM Plex Sans Arabic"';
  ctx.fillText('YOUR MOOD DROP', W/2, 300);

  // persona name (wrap if needed)
  ctx.fillStyle = '#F4EEE3';
  ctx.font = 'italic 700 76px "Fraunces"';
  wrapCanvasText(ctx, currentResult.name, W/2, 420, W-160, 84);

  // tagline
  ctx.fillStyle = '#A6957F';
  ctx.font = '400 32px "IBM Plex Sans Arabic"';
  wrapCanvasText(ctx, currentResult.tag, W/2, 660, W-220, 46);

  // divider
  ctx.strokeStyle = 'rgba(244,238,227,0.15)';
  ctx.setLineDash([8,10]);
  ctx.beginPath();
  ctx.moveTo(140, H-330);
  ctx.lineTo(W-140, H-330);
  ctx.stroke();
  ctx.setLineDash([]);

  // match label
  ctx.fillStyle = '#5FD8D1';
  ctx.font = '600 24px "IBM Plex Sans Arabic"';
  ctx.fillText('BLK MATCH', W/2, H-260);

  // match drink
  ctx.fillStyle = '#F4EEE3';
  ctx.font = '600 46px "Fraunces"';
  ctx.fillText(currentResult.drink, W/2, H-190);

  // footer
  ctx.fillStyle = 'rgba(166,149,127,0.7)';
  ctx.font = '400 22px "IBM Plex Sans Arabic"';
  ctx.fillText('Fan concept — تجربة مستقلة، مش تطبيق رسمي', W/2, H-70);

  const link = document.createElement('a');
  link.download = 'blk-mood-drop.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + ' ';
    if(ctx.measureText(testLine).width > maxWidth && n>0){
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  const startY = y - ((lines.length-1)*lineHeight)/2;
  lines.forEach((l,i)=> ctx.fillText(l.trim(), x, startY + i*lineHeight));
}

goTo(0);
