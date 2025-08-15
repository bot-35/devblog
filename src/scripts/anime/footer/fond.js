import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const bgContactFooter = document.querySelector('#bgContactFooter');


export const bgContactFooterAnimation = anime.timeline ({
    easing:'easeInQuad',
    duration: 500,
    autoplay: false
 });


 
 bgContactFooterAnimation.add ({
    targets: bgContactFooter,
    translateX: '-69px',
    rotate: '12deg',
    scale: ['0.7','1'],
    opacity: 0.4
 })