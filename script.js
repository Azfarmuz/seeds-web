const layers = [
  document.querySelector('.atmo-night'),
  document.querySelector('.atmo-morning'),
  document.querySelector('.atmo-day'),
  document.querySelector('.atmo-windmill'),
  document.querySelector('.atmo-sunset'),
  document.querySelector('.atmo-tree')
];

const stars = document.querySelector('.stars');
const moon = document.querySelector('.moon');
const sun = document.querySelector('.sun');
const warmGlow = document.querySelector('.warm-glow');
const clouds = [...document.querySelectorAll('.cloud')];

const fire = document.querySelector('.fire-hotspot');
const dino = document.querySelector('.dino-hotspot');

const bird = document.querySelector('.bird-hotspot');
const birdSound = document.querySelector('.bird-sound');

const orangutan = document.querySelector('.orangutan-hotspot');

const fish = document.querySelector('.fish-hotspot');
const seaHotspot = document.querySelector('.sea-hotspot');

const treeHotspot = document.querySelector('.tree-hotspot');
const returningOrangutan = document.querySelector('.orangutan-return');

const clamp = (v,a=0,b=1) => Math.max(a, Math.min(b,v));
const smooth = t => t*t*(3-2*t);
const smoother = t => t*t*t*(t*(t*6-15)+10);

let target = 0;
let current = 0;

function readScroll(){
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  target = clamp(scrollY / max);
}

function sceneBlend(progress, index){
  const count = layers.length;
  const pos = progress * (count - 1);
  const distance = Math.abs(pos - index);
  const fade = clamp(1 - distance / 0.82);
  return smoother(fade);
}

function updateAtmosphere(){
  const p = current;

  layers.forEach((layer,i)=>{
    if(layer) layer.style.opacity = sceneBlend(p,i);
  });

  // Stars belong to the opening night only.
  const starAlpha = smoother(clamp(1 - p / 0.19)) * .95;
  if(stars) stars.style.opacity = starAlpha;

  // The moon sets once during the first transition and never comes back.
  const moonAlpha = smoother(clamp(1 - p / 0.18));
  if(moon){
    moon.style.opacity = moonAlpha;
    moon.style.transform = `translateY(${p * 24}px)`;
  }

  // Sun gently arrives in the morning and glows again near sunset.
  const morningSun = clamp((p - 0.15) / 0.22);
  const sunsetSun = clamp(1 - Math.abs(p - 0.80) / 0.18);
  const sunAlpha = Math.max(
    smoother(morningSun) * .62,
    smoother(sunsetSun) * .72
  );
  if(sun){
    sun.style.opacity = sunAlpha;
    sun.style.transform = `translateY(${(1 - morningSun) * 20}px)`;
  }

  const cloudAlpha = Math.max(
    smoother(clamp(1 - Math.abs(p - 0.32) / .22)),
    smoother(clamp(1 - Math.abs(p - 0.57) / .25))
  ) * .72;

  clouds.forEach((cloud,i)=>{
    cloud.style.opacity = cloudAlpha;
    cloud.style.transform =
      `translateX(${Math.sin(p * 7 + i) * 18}px) scale(${i ? .78 : 1})`;
  });

  const sunsetWarmth = smoother(clamp(1 - Math.abs(p - 0.80) / .20));
  if(warmGlow) warmGlow.style.opacity = sunsetWarmth * .75;
}

let rafId = 0;
function animateAtmosphere(){
  current += (target - current) * 0.075;
  if(Math.abs(target-current) < 0.00025){
    current = target;
    updateAtmosphere();
    rafId = 0;
    return;
  }
  updateAtmosphere();
  rafId = requestAnimationFrame(animateAtmosphere);
}
function startAtmosphere(){
  if(!rafId) rafId = requestAnimationFrame(animateAtmosphere);
}

/* 01 · Campfire */
if(fire){
  fire.addEventListener('click',()=>{
    const active = fire.classList.toggle('active');
    fire.setAttribute('aria-pressed',String(active));
    fire.setAttribute(
      'aria-label',
      active ? 'Put out the campfire' : 'Light the campfire'
    );
  });
}

/* 01 · Dinosaur: first click big, second click small again. */
if(dino){
  dino.addEventListener('click',()=>{
    const big = dino.classList.toggle('big');
    dino.setAttribute('aria-pressed',String(big));
    dino.setAttribute(
      'aria-label',
      big ? 'Make the dinosaur small again' : 'Make the dinosaur bigger'
    );
  });
}

/* 02 · Bird peck + animated "citt citt". */
if(bird){
  bird.addEventListener('click',()=>{
    bird.classList.remove('peck');
    birdSound.classList.remove('show');
    void bird.offsetWidth;
    void birdSound.offsetWidth;
    bird.classList.add('peck');
    birdSound.classList.add('show');
    setTimeout(()=>bird.classList.remove('peck'),800);
    setTimeout(()=>birdSound.classList.remove('show'),1000);
  });
}

/* 02 · Orangutan runs away to the left. */
if(orangutan){
  orangutan.addEventListener('click',()=>{
    if(orangutan.classList.contains('running')) return;
    orangutan.classList.add('running');
    orangutan.setAttribute('aria-pressed','true');
  });
}

/* 03 · Fish dives away from below the boat. */
if(fish && seaHotspot){
  const returnFish = document.querySelector('.fish-return');

  const diveFish = (el)=>{
    if(!el || el.classList.contains('diving')) return;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('diving');
    seaHotspot.classList.add('ready');
  };

  fish.addEventListener('click',()=>{
    diveFish(fish);
    fish.setAttribute('aria-label','The pufferfish is diving');
  });

  /* Click the sea after the fish has disappeared: it surfaces at the same safe spot. */
  seaHotspot.addEventListener('click',()=>{
    if(!seaHotspot.classList.contains('ready') || !returnFish) return;

    seaHotspot.classList.remove('ready');
    returnFish.classList.remove('diving','show');
    void returnFish.offsetWidth;
    returnFish.classList.add('show');
  });

  /* The surfaced fish can be clicked again to dive back down. */
  if(returnFish){
    returnFish.addEventListener('click',()=>{
      diveFish(returnFish);
      returnFish.setAttribute('aria-label','The pufferfish is diving again');
    });
  }
}

/* 06 · Click the tree to bring the orangutan back. */
if(treeHotspot && returningOrangutan){
  treeHotspot.addEventListener('click',()=>{
    returningOrangutan.classList.remove('show');
    void returningOrangutan.offsetWidth;
    returningOrangutan.classList.add('show');
    treeHotspot.setAttribute('aria-pressed','true');
  });
}

addEventListener('scroll',()=>{ readScroll(); startAtmosphere(); },{passive:true});
addEventListener('resize',()=>{ readScroll(); startAtmosphere(); });

readScroll();
startAtmosphere();
