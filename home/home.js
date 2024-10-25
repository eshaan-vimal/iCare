const appointmentBtn = document.querySelector('#appointment-btn a');

if (appointmentBtn) {
    appointmentBtn.addEventListener('click', (event) => {
        
        window.location.href = appointmentBtn.getAttribute('href');
    });
}

particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#ffffff'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: false
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'repulse'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        }
    },
    retina_detect: true
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => 
{
    anchor.addEventListener('click', function (e) 
    {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const heroButtons = document.querySelectorAll('.hero-buttons-row .main-btn');

heroButtons.forEach(button => 
{
    button.addEventListener('mouseover', () => 
    {
        button.style.transform = 'translateY(-5px)'; 
        button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; 
    });

    button.addEventListener('mouseout', () => 
    {
        button.style.transform = 'translateY(0)'; 
        button.style.boxShadow = 'none'; 
    });
});

const faders = document.querySelectorAll('.fade-in');
const sliders = document.querySelectorAll('.slide-in');

const appearOptions = {
    threshold: 0,
    rootMargin: '0px 0px -200px 0px'
};

const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) 
{
    entries.forEach(entry => 
    {
        if (!entry.isIntersecting) 
        {
            return;
        } 
        else 
        {
            entry.target.classList.add('appear');
            appearOnScroll.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => 
{
    appearOnScroll.observe(fader);
});

sliders.forEach(slider => 
{
    appearOnScroll.observe(slider);
});

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => 
{
    navLinks.classList.toggle('open');
});