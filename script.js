document.addEventListener('DOMContentLoaded', () => {
    // Mock data for bike models and customizations
    // In a real application, this would likely come from a server or a more complex data structure
    const bikeModels = [
        {
            id: 'model_x',
            name: 'Kargo Model X',
            basePrice: 2500,
            image: 'https://via.placeholder.com/400x300.png?text=Kargo+Model+X', // Placeholder image
            customizations: [
                { id: 'gps', name: 'GPS Tracker', price: 150 },
                { id: 'lights', name: 'Premium Light Set', price: 75 },
                { id: 'basket', name: 'Large Front Basket', price: 120 },
                { id: 'lock', name: 'Heavy Duty Lock', price: 60 },
            ]
        },
        {
            id: 'model_y',
            name: 'Kargo Model Y',
            basePrice: 3200,
            image: 'https://via.placeholder.com/400x300.png?text=Kargo+Model+Y', // Placeholder image
            customizations: [
                { id: 'gps', name: 'GPS Tracker', price: 150 },
                { id: 'lights', name: 'Premium Light Set', price: 75 },
                { id: 'panniers', name: 'Waterproof Pannier Bags (Set of 2)', price: 180 },
                { id: 'alarm', name: 'Anti-theft Alarm System', price: 100 },
                { id: 'ext_battery', name: 'Extended Range Battery', price: 400 },
            ]
        },
        {
            id: 'model_z',
            name: 'Kargo Model Z',
            basePrice: 4000,
            image: 'https://via.placeholder.com/400x300.png?text=Kargo+Model+Z',
            customizations: [
                { id: 'gps', name: 'GPS Tracker Pro', price: 200 },
                { id: 'cargo_box', name: 'Insulated Cargo Box', price: 500 },
                { id: 'winter_tires', name: 'All-Weather Winter Tires', price: 250 },
                { id: 'custom_branding', name: 'Custom Company Branding Wrap', price: 300 },
            ]
        }
        // Add more models as needed
    ];

    let currentModel = null;
    let currentCustomizations = [];
    let currentBasePrice = 0;

    const modelSelect = document.getElementById('bike-model-select');
    const bikeImage = document.getElementById('bike-image');
    const basePriceDisplay = document.getElementById('base-price');
    const optionsContainer = document.getElementById('options-container');
    const totalPriceDisplay = document.getElementById('total-price');
    const contactForm = document.getElementById('contact-form');

    // Populate model selector
    bikeModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });

    // Event listener for model selection
    modelSelect.addEventListener('change', (event) => {
        const selectedModelId = event.target.value;
        currentModel = bikeModels.find(model => model.id === selectedModelId);
        currentCustomizations = []; // Reset customizations
        if (currentModel) {
            currentBasePrice = currentModel.basePrice;
            bikeImage.src = currentModel.image;
            bikeImage.alt = currentModel.name;
            bikeImage.style.display = 'block';
            basePriceDisplay.textContent = `€${currentModel.basePrice}`;
            renderCustomizationOptions();
        } else {
            currentBasePrice = 0;
            bikeImage.style.display = 'none';
            basePriceDisplay.textContent = `€0`;
            optionsContainer.innerHTML = ''; // Clear options
        }
        updateTotalPrice();
    });

    // Render customization options
    function renderCustomizationOptions() {
        optionsContainer.innerHTML = ''; // Clear previous options
        if (!currentModel || !currentModel.customizations) return;

        currentModel.customizations.forEach(cust => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `cust-${cust.id}`;
            checkbox.value = cust.price;
            checkbox.dataset.id = cust.id;
            checkbox.dataset.name = cust.name;

            const label = document.createElement('label');
            label.htmlFor = `cust-${cust.id}`;
            label.textContent = `${cust.name} (+€${cust.price})`;

            checkbox.addEventListener('change', handleCustomizationChange);

            div.appendChild(checkbox);
            div.appendChild(label);
            optionsContainer.appendChild(div);
        });
    }

    // Handle customization selection
    function handleCustomizationChange(event) {
        const custId = event.target.dataset.id;
        const custName = event.target.dataset.name;
        const custPrice = parseFloat(event.target.value);

        if (event.target.checked) {
            currentCustomizations.push({ id: custId, name: custName, price: custPrice });
        } else {
            currentCustomizations = currentCustomizations.filter(c => c.id !== custId);
        }
        updateTotalPrice();
    }

    // Update total price
    function updateTotalPrice() {
        let total = currentBasePrice;
        currentCustomizations.forEach(cust => {
            total += cust.price;
        });
        totalPriceDisplay.textContent = `€${total}`;
    }

    // Handle form submission
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent actual form submission

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const company = document.getElementById('company').value;

        if (!currentModel) {
            alert('Please select a bike model first.');
            return;
        }

        const configuration = {
            model: currentModel.name,
            basePrice: currentModel.basePrice,
            customizations: currentCustomizations,
            totalPrice: parseFloat(totalPriceDisplay.textContent.substring(1)), // Remove €
            contact: {
                name: name,
                email: email,
                company: company
            }
        };

        console.log('Bike Configuration Submitted:', configuration);

        // Function to trigger JSON download
        function downloadConfiguration(config) {
            const jsonString = JSON.stringify(config, null, 2); // Pretty print JSON
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Generate a somewhat unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `bike_configuration_${config.contact.name.replace(/\s+/g, '_') || 'user'}_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        downloadConfiguration(configuration);
        alert('Configuration submitted and downloaded! A salesman will contact you shortly. (Check console for details)');

        // Reset form and state
        contactForm.reset();
        modelSelect.value = ''; // Reset model selector
        bikeImage.style.display = 'none';
        basePriceDisplay.textContent = '€0';
        optionsContainer.innerHTML = '';
        totalPriceDisplay.textContent = '€0';
        currentModel = null;
        currentCustomizations = [];
        currentBasePrice = 0;
    });

    // Initialize with no model selected
    modelSelect.value = '';
    updateTotalPrice();
});
