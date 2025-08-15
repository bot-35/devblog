import anime from '../../../../node_modules/animejs/lib/anime.es.js';





  const bgSysAdminAnimation = anime.timeline ({
    easing: 'linear',
    duration: 500,
    autoplay: true,
  });
  
  bgSysAdminAnimation.add ({
    targets: '#logo',
    easing: 'linear',
    opacity: ['0','1'],
    scale: ['0', '1'],
    translateY: ['-150px','0', '50', '0'],
  });