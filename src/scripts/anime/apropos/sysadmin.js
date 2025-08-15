import anime from '../../../../node_modules/animejs/lib/anime.es.js';


export const bgSysAdminAnimation = anime.timeline ({
    targets: '#bgsysadmin_bourdon_tete',
    easing:'easeInQuad',
    opacity: '1',
    strokeDashoffset: [anime.setDashoffset, 0],     
    duration: 500,
    autoplay: false,
 });


 bgSysAdminAnimation.add({
   targets:'#bgsysadmin_bourdon_oeilg, #bgsysadmin_bourdon_oeild',
   strokeDashoffset: [anime.setDashoffset, 0],     
   opacity: '1',

})

bgSysAdminAnimation.add({
   targets:'#bgsysadmin_bourdon_antenneg, #bgsysadmin_bourdon_antenned',
   strokeDashoffset: [anime.setDashoffset, 0],     
   opacity: '1',
})

bgSysAdminAnimation.add({
   targets:'#bgsysadmin_bourdon_bouleg, #bgsysadmin_bourdon_bouled',
   strokeDashoffset: [anime.setDashoffset, 0],     
   opacity: '1',
})


bgSysAdminAnimation.add({
   targets:'#bgsysadmin_bourdon_ondeg, #bgsysadmin_bourdon_onded',
   opacity: '0',
   complete: function () {
        anime({
            targets:'#bgsysadmin_bourdon_ondeg, #bgsysadmin_bourdon_onded, #bgsysadmin_bourdon_ondegg, #bgsysadmin_bourdon_ondedd, #bgsysadmin_bourdon_ondeggg, #bgsysadmin_bourdon_ondeddd ' ,
            opacity: ['0','1', '0'],
            delay: anime.stagger(100),
            duration: 500,
            easing: 'easeOutInBounce',
            complete: function () {
            anime ({
                targets: '#tsparticles_admin',
                easing: 'linear',
                duration: '500',
                opacity: '0.5',
                complete: function () {
                  anime ({
                     targets:'#bgsysadmin_bourdon_ondeg, #bgsysadmin_bourdon_onded, #bgsysadmin_bourdon_ondegg, #bgsysadmin_bourdon_ondedd, #bgsysadmin_bourdon_ondeggg, #bgsysadmin_bourdon_ondeddd ' ,
                     opacity: ['0','1', '0'],
                     loop: true,
                     delay: anime.stagger(100),
                     duration: 500,
                     easing: 'easeOutInBounce',
                  })
                }
             })
        }
        })
   }
})



