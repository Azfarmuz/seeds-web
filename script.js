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
const swiper = document.querySelector('.swiper-hotspot');

const bird = document.querySelector('.bird-hotspot');
const birdSound = document.querySelector('.bird-sound');
const sheep = document.querySelector('.sheep-hotspot');


const crab = document.querySelector('.crab-hotspot');


const cafeCat = document.querySelector('.cafe-cat-hotspot');
const cafeFriends = document.querySelector('.cafe-friends');

const treeHotspot = document.querySelector('.tree-hotspot');
const returningOrangutan = document.querySelector('.orangutan-return');

const clamp = (v,a=0,b=1) => Math.max(a, Math.min(b,v));
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

  const starAlpha = smoother(clamp(1 - p / 0.19)) * .95;
  if(stars) stars.style.opacity = starAlpha;

  const moonAlpha = smoother(clamp(1 - p / 0.18));
  if(moon){
    moon.style.opacity = moonAlpha;
    moon.style.transform = `translateY(${p * 24}px)`;
  }

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

/* 01 · Swiper: first click steals the ice cream, second click runs away. */
if(swiper){
  swiper.addEventListener('click',()=>{
    if(swiper.classList.contains('running')) return;

    if(!swiper.classList.contains('stealing')){
      swiper.classList.add('stealing');
      swiper.setAttribute('aria-pressed','true');
      swiper.setAttribute('aria-label','Swiper stole the ice cream. Click again to watch him run away');
      return;
    }

    swiper.classList.remove('stealing');
    void swiper.offsetWidth;
    swiper.classList.add('running');
    swiper.setAttribute('aria-label','Swiper is running away');

    window.setTimeout(()=>{
      swiper.classList.remove('stealing','running');
      swiper.setAttribute('aria-pressed','false');
      swiper.setAttribute('aria-label','Watch Swiper steal the ice cream');
    },1350);
  });
}

/* 02 · Bird peck + animated "citt citt". */
if(bird){
  bird.addEventListener('click',()=>{
    bird.classList.remove('peck');
    if(birdSound) birdSound.classList.remove('show');
    void bird.offsetWidth;
    if(birdSound) void birdSound.offsetWidth;
    bird.classList.add('peck');
    if(birdSound) birdSound.classList.add('show');
    setTimeout(()=>bird.classList.remove('peck'),800);
    setTimeout(()=>birdSound && birdSound.classList.remove('show'),1000);
  });
}

/* 02 · Garut sheep. */
if(sheep){
  sheep.addEventListener('click',()=>{
    sheep.classList.remove('say');
    void sheep.offsetWidth;
    sheep.classList.add('say');
  });
}


/* 03 · Crab walks vertically. */
if(crab){
  crab.addEventListener('click',()=>{
    const walking = crab.classList.toggle('walking');
    crab.setAttribute('aria-pressed',String(walking));
    crab.setAttribute(
      'aria-label',
      walking ? 'Stop the crab' : 'Make the crab walk vertically'
    );
  });
}

/* 05 · Cat in the café window calls the other animals. */
if(cafeCat && cafeFriends){
  cafeCat.addEventListener('click',()=>{
    cafeFriends.classList.remove('show');
    void cafeFriends.offsetWidth;
    cafeFriends.classList.add('show');
    cafeCat.setAttribute('aria-pressed','true');
  });
}

/* 06 · Tree brings the orangutan back beside it with a thank-you message. */
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
