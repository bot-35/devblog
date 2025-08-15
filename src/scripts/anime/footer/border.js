import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const footerBorder = document.querySelector('#footerBorder');


export const footerBorderAnimation = anime.timeline ({
    easing:'easeInQuad',
    duration: 500,
    autoplay: false
 });


 
 footerBorderAnimation.add ({
    targets: footerBorder,
    scaleX: ['0', '1']
 })