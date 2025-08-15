import anime from '../../../../node_modules/animejs/lib/anime.es.js';





export const socialIconAnimation = anime.timeline ({
    easing:'easeInQuad',
    duration: 250,
    autoplay: false
 });

 socialIconAnimation.add ({
    targets: '.social1',
    opacity: ['0', '1'],
    scaleY: ['0', '1']
 })
.add ({
    targets: '.social2',
    opacity: ['0', '1'],
    scaleX: ['0', '1']
 })
 .add ({
    targets: '.social3',
    opacity: ['0', '1'],
    scaleY: ['0', '1']
 })
 .add ({
    targets: '.social4',
    opacity: ['0', '1'],
    scaleX: ['0', '1']
 })