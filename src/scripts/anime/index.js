import anime from '../../../node_modules/animejs/lib/anime.es.js';



export  const animationOpacity = anime.timeline ({
    autoplay: false,
 });

 animationOpacity.add({
    targets: '.animationOpacity',
    easing: 'linear',
    duration: 500,
    opacity: ['0','1'],
 })


 export const animationLayoutBg = anime.timeline ({
   autoplay: true,
   loop: true,
   duration: '30000',
   easing: 'easeInOutSine',
   direction: 'alternate',

 });

 animationLayoutBg.add({
   targets: '#layoutBG',
   scale: ['1','10'],
   rotate:'180deg',
 })

