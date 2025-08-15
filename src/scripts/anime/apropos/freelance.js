import anime from '../../../../node_modules/animejs/lib/anime.es.js';


export  const bgFreelanceAnimation = anime.timeline ({
  easing: 'linear',
  duration: 3000,
  autoplay: false,
});

bgFreelanceAnimation.add ({
  targets: '#tsparticles_freelance',
  easing: 'linear',
  opacity: '0.5',
  scale: ['0','1'],
})