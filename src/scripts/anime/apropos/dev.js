import anime from '../../../../node_modules/animejs/lib/anime.es.js';


const lines = document.querySelectorAll(`[id*="bgdev_line-"]`);
const buttons = document.querySelectorAll(`[id*="bgdev_window-button-"]`);


export  const bgDevAnimation = anime.timeline ({
   easing: 'linear',
   duration: 200,
   opacity: '1',
   autoplay: false,
});

bgDevAnimation.add ({
   targets: '#bgdev_window',
   strokeDashoffset: [anime.setDashoffset, 0],     
   opacity: '1',
})

bgDevAnimation.add ({
   targets: '#bgdev_window-up-bg',
   opacity: ['0','1'],
   height: ['0','17.612'],
})

bgDevAnimation.add({
   targets: '#bgdev_window-logo',
   opacity: '1',
})

bgDevAnimation.add ({
   targets: buttons,
   opacity: ['0','1'],
   duration: 200,
   delay: function(el, i, l) {
      return i * 150;
    },
   scale: ['0','1'],
})

bgDevAnimation.add ({
   targets: lines,
   opacity: ['0','1'],
   width: ['0','187'],
   delay: function(el, i, l) {
      return i * 200;
    },
    endDelay: function(el, i, l) {
      return (l - i) * 200;
    },
    complete: animDevBox1_1

})



function animDevBox1_1(){
   anime({
      targets: '#bgdevdiv',
      translateX: ['0', '-10', '0', '10', '0'],
      direction: 'reverse',
      loop: 6,
      easing: 'linear',
      duration: 50,
   })
   anime({
      delay: 200,
      duration: 1000,
      targets: '#bgdev_line-8',
      scale: 1.05,
      direction: 'reverse',
   })
   anime({
      targets: '#bgdev_line-8',
      fill: '#ff3939',
      complete: animDevBox1_2
   })
   }

   function animDevBox1_2(){
      anime({
         duration: 1000,
         targets: '#bgdev_line-8',
         width: '0',
         easing: 'steps(20)',
         loop: 0,
         complete: function () {
            anime({
               targets: '#bgdev_line-8',
               fill: '#5a5a5a',
            })
            anime ({
               duration: 1000,
               targets: '#bgdev_line-8',
               width: '187.96',
               easing: 'steps(20)',
               complete: animDevBox1_3
            })
         }
      })
      }

      function animDevBox1_3() {
         anime ({
            targets: lines,
            fill: '#e1ff56',
            delay: function(el, i, l) {
               return i * 200;
             },
             endDelay: function(el, i, l) {
               return (l - i) * 200;
             },
             complete: function () {
               anime({
                  targets: '#bgdevdiv',
                  scale: '5',
                  duration: 2500,
                  opacity: 0.02,
                  easing: 'linear',
                  rotate: '45deg',
                  complete: function() {
                     anime ({
                        targets: lines,
                        fill: '#e8b871',
                        duration: 200,
                        easing: 'linear',
                     })
                  }
               })
             }        
          })
}
