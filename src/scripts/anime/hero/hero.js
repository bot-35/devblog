import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const heroCases = document.querySelectorAll('.heroCases');


export const heroCasesAnimation = anime.timeline ({
    easing: 'easeInOutSine',
    duration: 30,
    autoplay: false,
  });
  
  heroCasesAnimation.add ({
    targets: heroCases,
    opacity: ['1','0.5'],
    delay: function(el, i, l) {
        return i * 10; // i est l'index de l'élément actuel
    },
    complete: function(anim) {
        anime({
            targets: anim.animatables.map(a => a.target),
            opacity: 0,
            delay: function(el, i, l) {
                return i * 10;
            },
            easing: 'easeInOutSine',
            duration: 10,
        });
    },
})