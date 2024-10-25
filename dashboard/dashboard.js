function showPage(pageId) 
{
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    document.getElementById(pageId).style.display = 'block';

    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    document.querySelector(`.sidebar a[href="#${pageId}"]`).classList.add('active');
}


particlesJS('particles-js', {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
        opacity: { value: 0.9, random: false },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 1.6, direction: 'none', random: false, straight: false, out_mode: 'out', attract: { enable: false } }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});


const token = localStorage.getItem('token');
async function apiCall(endpoint, method = 'GET', data = null) 
{
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    if (data) 
    {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`/api/${endpoint}`, options);
    return response.json();
}


async function loadReports() 
{
    try 
    {
        const response = await apiCall('reports');
        if (response.status === 'success') 
        {
            const reportsDiv = document.getElementById('my-reports');
            reportsDiv.innerHTML = '<h2>My Reports</h2>';

            response.data.forEach(report => {
                reportsDiv.innerHTML += `
                    <div class="report">
                        <h3>Report Date: ${new Date(report.date).toLocaleDateString()}</h3>
                        <p><strong>Symptoms:</strong> ${report.symptoms.join(', ')}</p>
                        <p><strong>Diagnosis:</strong> ${report.diagnosis}</p>
                        <p><strong>Recommendations:</strong> ${report.recommendations}</p>
                    </div>
                `;
            });
        }
    } 
    catch (error) 
    {
        console.error('Error loading reports:', error);
    }
}


function sanitizeHTML(str) 
{
    let temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
document.addEventListener('DOMContentLoaded', function() 
{
    showPage('personal-information');
    const personalInfoForm = document.getElementById('personal-information-form');

    if (personalInfoForm) 
    {
        personalInfoForm.addEventListener('submit', async function(e) 
        {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value,
                height: parseFloat(document.getElementById('height').value),
                weight: parseFloat(document.getElementById('weight').value)
            };

            try 
            {
                const response = await apiCall('personal-info', 'POST', formData);
                if (response.status === 'success') 
                {
                    alert('Personal information saved successfully!');
                } 
                else 
                {
                    alert('Error saving information: ' + response.message);
                }
            } 
            catch (error) 
            {
                console.error('Error:', error);
                alert('An error occurred while saving your information');
            }
        });
    }

    document.getElementById('symptoms-form').addEventListener('submit', async function(e) 
    {
        e.preventDefault();
        const symptomsInput = document.getElementById('symptoms').value;
        const resultSection = document.getElementById('diagnosis-result');
        const predictedDiseaseElement = document.getElementById('predicted-disease');
        const treatmentRemedyElement = document.getElementById('treatment-remedy');
        predictedDiseaseElement.textContent = 'Processing diagnosis...';
        treatmentRemedyElement.textContent = 'Processing Treatment...';
        resultSection.style.display = 'block';

        try 
        {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symptomsInput }),
            });
            const data = await response.json();
            predictedDiseaseElement.textContent = `Predicted Disease: ${data.disease}`;
            treatmentRemedyElement.textContent = `Recommended Treatment: ${data.remedy}`;
        } 
        catch (error) 
        {
            predictedDiseaseElement.textContent = 'Error fetching diagnosis. Try again later.';
            treatmentRemedyElement.textContent = 'Error fetching treatment. Try again later.';
            console.error('Error:', error);
        }
    });

    document.querySelectorAll('.sidebar a').forEach(link => 
    {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('logout-button')) 
            {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to log out?')) 
                {
                    window.location.href = "../home/home.html";
                }
            } 
            else 
            {
                e.preventDefault();
                const pageId = this.getAttribute('href').substr(1);
                showPage(pageId);
            }
        });
    });

    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) 
    {
        sendBtn.addEventListener('click', function() 
        {
            const userInput = document.getElementById('user-input');
            const chatbox = document.getElementById('chatbox');

            if (userInput.value.trim() !== '') 
            {
                chatbox.innerHTML += `<p><strong>You:</strong> ${sanitizeHTML(userInput.value)}</p>`;
                const botResponse = "I'm sorry, I'm a simple demo bot. I can't provide real medical advice or doctor referrals. Please consult with a healthcare professional for accurate information and referrals.";
                chatbox.innerHTML += `<p><strong>SickSense AI:</strong> ${botResponse}</p>`;
                userInput.value = '';
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        });
    }
    loadReports();
});
particlesJS.load('particles-js', 'path/to/particles.json', function() 
{
    console.log('callback - particles.js config loaded');
});