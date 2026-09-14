// admin.js

document.getElementById('saveConfigBtn').addEventListener('click', async () => {
    const selectedBgColor = document.getElementById('bgColorPicker').value;

    // Package the changes
    const payload = {
        backgroundColor: selectedBgColor
    };

    try {
        // Send the changes to your backend API to save in Turso
        const response = await window.fetch('/api/update-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Settings saved and deployed successfully!');
        } else {
            alert('Failed to save settings.');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
    }
});