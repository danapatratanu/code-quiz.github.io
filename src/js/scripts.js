const ScrollReveal = require('scrollreveal');
const SmoothScroll = require('smooth-scroll');
const styles = require('../scss/style.scss');

window.sr = ScrollReveal({ duration: 600, easing: 'ease-out', viewFactor: .3 });
sr.reveal('.animate');
new SmoothScroll('a[href*="#"]');