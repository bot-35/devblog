import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const aproposBg = document.querySelector('#aproposBg');


export const aproposBgAnimation = anime.timeline ({
    easing:'easeInQuad',
    duration: 500,
    autoplay: false
 });


 
 aproposBgAnimation.add ({
    targets: aproposBg,
    opacity: ['0', '1']
 })



 const aproposBox = document.querySelector('#aproposBox');


export const aproposBoxAnimation = anime.timeline ({
    easing:'easeInQuad',
    duration: 1000,
    autoplay: false
 });


 
 aproposBoxAnimation.add ({
    targets: aproposBox,
    opacity: ['0', '1']
 })

