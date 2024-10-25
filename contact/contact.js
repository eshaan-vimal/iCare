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

function initMap() 
{
    let location = { lat: 19.0760, lng: 72.8777 };

    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: location
    });

    let marker = new google.maps.Marker({
        position: location,
        map: map
    });
}
document.getElementById('contact-form').addEventListener('submit', async (e) => 
{
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try 
    {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.status === 'success') 
        {
            alert('Thank you for your feedback!');
            document.getElementById('contact-form').reset();
        } 
        else 
        {
            alert('Error: ' + data.message);
        }
    } 
    catch (error) 
    {
        console.error('Error:', error);
        alert('An error occurred while submitting the form');
    }
});