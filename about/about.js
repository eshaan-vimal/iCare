window.onload = () => 
{
    particlesJS('particles-js', {
        particles: {
            number: { value: 100, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
            opacity: { value: 0.4, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 1.6, direction: 'none', random: false, straight: false, out_mode: 'out', attract: { enable: false } }
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
                resize: true },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
        retina_detect: true
    });
}