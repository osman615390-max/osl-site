
const nav=document.querySelector('.nav'); const menu=document.querySelector('.menu');
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>30));
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.12});
document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();alert('Merci ! Votre demande est prête à être envoyée. Remplacez cette action par votre adresse e-mail ou votre outil de formulaire.');}));
