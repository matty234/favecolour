document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('colorCanvas');
    const ctx = canvas.getContext('2d');
    const nameInput = document.getElementById('name');
    const colorValue = document.getElementById('colorValue');
    const submitButton = document.getElementById('submit');
    const coordinates = document.getElementById('coordinates');
    const colorPreview = document.getElementById('colorPreview');
    const ENDPOINT_URL = 'https://eoaunqjil70n6ru.m.pipedream.net';

    let selectedColor = '#ff0000';
    let mouseX = 0;
    let mouseY = 0;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawColorSpectrum();
    }

    // Draw color spectrum
    function drawColorSpectrum() {
        const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient1.addColorStop(0, '#ff0000');    // Red
        gradient1.addColorStop(0.17, '#ff00ff'); // Magenta
        gradient1.addColorStop(0.33, '#0000ff'); // Blue
        gradient1.addColorStop(0.5, '#00ffff');  // Cyan
        gradient1.addColorStop(0.67, '#00ff00'); // Green
        gradient1.addColorStop(0.83, '#ffff00'); // Yellow
        gradient1.addColorStop(1, '#ff0000');    // Red

        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient2.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient2.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 1)');

        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get color at position
    function getColor(x, y) {
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    }

    // Convert RGB to Hex
    function rgbToHex(rgb) {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return rgb;
        
        function hex(x) {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }
        
        return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }

    // Update color display
    function updateColorDisplay(color) {
        selectedColor = color;
        colorValue.textContent = color;
        colorValue.style.backgroundColor = color;
        colorValue.style.color = getBrightness(color) > 128 ? '#000' : '#fff';
        colorPreview.style.backgroundColor = color;
    }

    // Calculate brightness
    function getBrightness(color) {
        const rgb = color.match(/\d+/g);
        return (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    }

    // Save data to endpoint
    async function saveData(data) {
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const response = await fetch(ENDPOINT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            alert(`Thanks ${data.name}! Your favorite color (${data.favoriteColor}) has been saved!`);
            console.log('Saved data:', data);
            
            // Reset form
            nameInput.value = '';
            colorValue.textContent = 'Click anywhere to select a color';
            colorValue.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            colorValue.style.color = '#000';
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Sorry, there was an error saving your data. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save';
        }
    }

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        const color = getColor(mouseX, mouseY);
        coordinates.textContent = `${color}`;
        coordinates.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });

    canvas.addEventListener('click', (e) => {
        const color = getColor(e.clientX, e.clientY);
        updateColorDisplay(color);
    });

    // Handle form submission
    submitButton.addEventListener('click', () => {
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter your name');
            return;
        }

        const data = {
            name: name,
            favoriteColor: selectedColor,
            hex: rgbToHex(selectedColor),
            timestamp: new Date().toISOString()
        };

        saveData(data);
    });

    // Initialize
    resizeCanvas();
}); 