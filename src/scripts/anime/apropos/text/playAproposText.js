import anime from '../../../../../node_modules/animejs/lib/anime.es.js';

export function playAproposTextAnimation(items) {
  anime({
    targets:items,
    duration: 400,
    opacity:['1'],
    translateY: ['150px','0'],
    easing: 'linear'
  })
}