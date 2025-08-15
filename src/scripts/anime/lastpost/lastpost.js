import anime from '../../../../node_modules/animejs/lib/anime.es.js';



const lastPost = document.querySelector('#LastPost');



export  const lastPostAnimation = anime.timeline ({
    easing: 'linear',
    duration: 500,
    opacity: '1',
    autoplay: false,
 });


 lastPostAnimation.add ({
    targets: lastPost,
    opacity: '1',
    translateY: ['100', '0']
 })