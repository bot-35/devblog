import { playById } from "../anime/functions/playbyid";
import { playAproposTextAnimation } from "../anime/apropos/text/playAproposText"
import anime from '../../../node_modules/animejs/lib/anime.es.js';

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Exécutez votre fonction ici
            if(entry.target.dataset.replace){
                let replaceClasses = JSON.parse(entry.target.dataset.replace.replace(/'/g, '"'));
                Object.keys(replaceClasses).forEach(function(key) {
                    entry.target.classList.remove(key);
                    entry.target.classList.add(replaceClasses[key]);
                });
            }
            if (entry.target.classList.contains('astro-postcard')) {
                const postCardAnimation = anime.timeline({
                    autoplay: false,
                });
            
                postCardAnimation.add({
                    targets: entry.target,
                    opacity: ['0', '1'],
                    translateY: ['100', '0'],
                    easing: 'linear',
                    duration: 500,
                });
            
                postCardAnimation.play();
                observer.unobserve(entry.target);
            }
            if (entry.target.classList.contains('animationOpacity')) {
                const animationOpacity = anime.timeline ({
                    autoplay: false,
                });
                animationOpacity.add({
                    targets: entry.target,
                    easing: 'linear',
                    duration: 500,
                    opacity: ['0','1'],
                })
                animationOpacity.play();
                observer.unobserve(entry.target);
            }
            if(entry.target.dataset.animation){
                var animationObjectName = entry.target.dataset.animation;
                if(window[animationObjectName] && typeof window[animationObjectName].play === "function") {
                    window[animationObjectName].targets = entry.target;
                    window[animationObjectName].play();
                }
                if(animationObjectName === 'textAnimation'){
                    playAproposTextAnimation(entry.target.querySelectorAll('p, h1'));
                }
            }
            if(entry.target.dataset.particles){
                var id = entry.target.dataset.id;
                playById(id);
            } 
            // Désactiver l'observation de cet élément si nécessaire
            observer.unobserve(entry.target);
        }
        
    });
}
    
function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '0% 0% -5% 0%',
        threshold: 0.25
    };
    
    const observer = new IntersectionObserver(handleIntersection, options);
    
    const elements = document.querySelectorAll('*'); // Sélectionnez tous les éléments du DOM
      elements.forEach(element => {
        observer.observe(element);
    });
}


export const setupEventIntersectionObserver =() => {
    document.addEventListener("DOMContentLoaded", function() {
        setupIntersectionObserver();
    });
}
  