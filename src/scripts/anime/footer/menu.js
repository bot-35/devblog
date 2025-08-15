import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const items = document.querySelectorAll('#menuFooter a');


export const menuFooterAnimation = anime.timeline ({
    easing: 'linear',
    duration: 250,
    autoplay: false,
  });
  
  menuFooterAnimation.add ({
    targets: items,
    easing: 'linear',
    opacity: ['0','1'],
    translateY: ['-150px','0', '50', '0'],
    delay: function(el, i, l) {
        return i * 200;
    },
      endDelay: function(el, i, l) {
        return (l - i) * 200;
    },
  })