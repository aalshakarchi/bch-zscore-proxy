document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('apiTestForm');
    const loadExampleBtn = document.getElementById('loadExample');
    const testApiBtn = document.getElementById('testApiBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const results = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const customJsonTextarea = document.getElementById('customJson');

    // Example payload data
    const examplePayload = {
        "LastContext": "Echo",
        "LastGroup": "Aorta",
        "LastRegressionNum": "12",
        "LastImperialHeightUnits": "False",
        "LastImperialWeightUnits": "False",
        "ImperialHeightUnits": "false",
        "HeightValue": "172",
        "ImperialWeightUnits": "false",
        "WeightValue": "32",
        "AgeValue": "1",
        "Context": "Echo",
        "Group": "Aorta",
        "RegressionNum": "12",
        "XAxisValue": "1.11",
        "YAxisValue": "1.2",
        "AgeRange": "0.000 - 30.000",
        "BSARange": "0.000 - 3.000",
        "BMIRange": "0.000 - 30.000",
        "InvertGraph": "false"
    };

    // Load example data
    loadExampleBtn.addEventListener('click', function() {
        // Fill form fields
        document.getElementById('heightValue').value = examplePayload.HeightValue;
        document.getElementById('weightValue').value = examplePayload.WeightValue;
        document.getElementById('ageValue').value = examplePayload.AgeValue;
        document.getElementById('context').value = examplePayload.Context;
        document.getElementById('group').value = examplePayload.Group;
        document.getElementById('regressionNum').value = examplePayload.RegressionNum;
        document.getElementById('xAxisValue').value = examplePayload.XAxisValue;
        document.getElementById('yAxisValue').value = examplePayload.YAxisValue;

        // Show full example in custom JSON
        customJsonTextarea.value = JSON.stringify(examplePayload, null, 2);

        // Show success message
        showAlert('Example data loaded successfully!', 'success');
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let payload;
        
        // Check if custom JSON is provided
        const customJson = customJsonTextarea.value.trim();
        if (customJson) {
            try {
                payload = JSON.parse(customJson);
            } catch (error) {
                showAlert('Invalid JSON in custom payload field', 'danger');
                return;
            }
        } else {
            // Build payload from form fields
            payload = {};
            const formData = new FormData(form);
            
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    payload[key] = value.trim();
                }
            }

            if (Object.keys(payload).length === 0) {
                showAlert('Please provide either form data or custom JSON payload', 'warning');
                return;
            }
        }

        // Make API call
        callZScoreAPI(payload);
    });

    function callZScoreAPI(payload) {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        results.style.display = 'none';
        testApiBtn.disabled = true;

        fetch('/calculate-zscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';
            testApiBtn.disabled = false;
            
            if (data.status === 'success') {
                displayResults(data.data, payload);
                showAlert(data.message, 'success');
            } else {
                displayError(data.error);
                showAlert(data.error, 'danger');
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            testApiBtn.disabled = false;
            displayError('Network error: ' + error.message);
            showAlert('Network error occurred', 'danger');
        });
    }

    function displayResults(data, payload) {
        const html = `
            <div class="card border-success">
                <div class="card-header bg-success text-white">
                    <h6 class="mb-0"><i class="fas fa-check-circle me-2"></i>Calculation Results</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-sm">
                                <tr>
                                    <td><strong>Z-Score:</strong></td>
                                    <td class="text-info">${data.ZScore}</td>
                                </tr>
                                <tr>
                                    <td><strong>Percentile:</strong></td>
                                    <td class="text-info">${data.Percentile}</td>
                                </tr>
                                <tr>
                                    <td><strong>5th Percentile:</strong></td>
                                    <td class="text-info">${data['5th']}</td>
                                </tr>
                                <tr>
                                    <td><strong>50th Percentile:</strong></td>
                                    <td class="text-info">${data['50th']}</td>
                                </tr>
                                <tr>
                                    <td><strong>95th Percentile:</strong></td>
                                    <td class="text-info">${data['95th']}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Request Payload:</h6>
                            <pre class="bg-dark p-2 rounded"><code class="text-light">${JSON.stringify(payload, null, 2)}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
        resultsContent.innerHTML = html;
        results.style.display = 'block';
    }

    function displayError(errorMessage) {
        const html = `
            <div class="card border-danger">
                <div class="card-header bg-danger text-white">
                    <h6 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Error</h6>
                </div>
                <div class="card-body">
                    <p class="text-danger mb-0">${errorMessage}</p>
                </div>
            </div>
        `;
        resultsContent.innerHTML = html;
        results.style.display = 'block';
    }

    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert after the form
        form.parentNode.insertBefore(alertDiv, form.nextSibling);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
});
