// Ride Confirmation Diagnostic Script
// Run this in browser console to debug ride confirmation issues

console.log('🔍 Starting Ride Confirmation Diagnostic...');

// Test 1: Check if required data is available
function testRideData() {
    console.log('\n📋 Test 1: Checking ride data availability...');
    
    const pickupLocation = localStorage.getItem('pickupLocation') || 'Test Pickup';
    const destinationLocation = localStorage.getItem('destinationLocation') || 'Test Destination';
    const selectedVehicle = localStorage.getItem('selectedVehicle') || 'car';
    
    console.log('Pickup Location:', pickupLocation);
    console.log('Destination Location:', destinationLocation);
    console.log('Selected Vehicle:', selectedVehicle);
    
    // Check if fare data exists
    const rideDetails = localStorage.getItem('rideDetails');
    if (rideDetails) {
        const parsed = JSON.parse(rideDetails);
        console.log('Stored Ride Details:', parsed);
        console.log('Fare Data:', parsed.fare);
    } else {
        console.log('❌ No ride details found in localStorage');
    }
    
    return { pickupLocation, destinationLocation, selectedVehicle };
}

// Test 2: Check API endpoint
async function testRideCreationAPI() {
    console.log('\n🌐 Test 2: Testing ride creation API...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No authentication token found');
        return false;
    }
    
    const serverUrl = import.meta?.env?.VITE_SERVER_URL || 'http://localhost:4000';
    console.log('Server URL:', serverUrl);
    
    try {
        // Test server connectivity
        const healthResponse = await fetch(`${serverUrl}/health`);
        if (healthResponse.ok) {
            console.log('✅ Server is reachable');
        } else {
            console.log('⚠️ Server health check failed');
        }
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        return false;
    }
    
    // Test ride creation endpoint with mock data
    try {
        const testRideData = {
            pickup: 'Test Pickup Location',
            destination: 'Test Destination Location',
            vehicleType: 'car',
            paymentMethod: { type: 'cash', name: 'Cash Payment' }
        };
        
        console.log('Testing with data:', testRideData);
        
        const response = await fetch(`${serverUrl}/ride/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify(testRideData)
        });
        
        console.log('API Response Status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API call successful:', result);
            return true;
        } else {
            const error = await response.text();
            console.log('❌ API call failed:', error);
            return false;
        }
    } catch (error) {
        console.log('❌ API call error:', error.message);
        return false;
    }
}

// Test 3: Check component state
function testComponentState() {
    console.log('\n🔧 Test 3: Checking component state...');
    
    // Check if React components are loaded
    const reactRoot = document.querySelector('#root');
    if (reactRoot) {
        console.log('✅ React root element found');
    } else {
        console.log('❌ React root element not found');
    }
    
    // Check for confirmation button
    const confirmButton = document.querySelector('[data-testid="confirm-ride-button"]') || 
                         document.querySelector('button[class*="confirm"]') ||
                         document.querySelector('button:contains("Confirm")');
    
    if (confirmButton) {
        console.log('✅ Confirmation button found:', confirmButton);
        console.log('Button disabled:', confirmButton.disabled);
        console.log('Button classes:', confirmButton.className);
    } else {
        console.log('❌ Confirmation button not found');
    }
    
    return { reactRoot, confirmButton };
}

// Test 4: Check for JavaScript errors
function testForErrors() {
    console.log('\n🐛 Test 4: Checking for JavaScript errors...');
    
    // Override console.error to catch errors
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Restore after a short delay
    setTimeout(() => {
        console.error = originalError;
        if (errors.length > 0) {
            console.log('❌ JavaScript errors found:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        } else {
            console.log('✅ No JavaScript errors detected');
        }
    }, 1000);
}

// Test 5: Simulate button click
function testButtonClick() {
    console.log('\n🖱️ Test 5: Simulating button click...');
    
    const confirmButton = document.querySelector('button[class*="confirm"]') ||
                         document.querySelector('button:contains("Confirm")') ||
                         document.querySelector('[role="button"]');
    
    if (confirmButton && !confirmButton.disabled) {
        console.log('Attempting to click button:', confirmButton);
        
        // Add event listener to catch click
        confirmButton.addEventListener('click', (e) => {
            console.log('✅ Button click event fired:', e);
        }, { once: true });
        
        // Simulate click
        confirmButton.click();
        
        return true;
    } else {
        console.log('❌ Cannot click button - not found or disabled');
        return false;
    }
}

// Run all tests
async function runDiagnostic() {
    console.log('🚀 Running complete diagnostic...\n');
    
    const rideData = testRideData();
    const apiWorking = await testRideCreationAPI();
    const componentState = testComponentState();
    testForErrors();
    
    console.log('\n📊 Diagnostic Summary:');
    console.log('- Ride Data Available:', !!rideData.pickupLocation && !!rideData.destinationLocation);
    console.log('- API Working:', apiWorking);
    console.log('- React Components Loaded:', !!componentState.reactRoot);
    console.log('- Confirmation Button Found:', !!componentState.confirmButton);
    
    if (componentState.confirmButton) {
        console.log('\n🔧 Button Analysis:');
        console.log('- Disabled:', componentState.confirmButton.disabled);
        console.log('- Visible:', componentState.confirmButton.offsetParent !== null);
        console.log('- Has Click Handler:', componentState.confirmButton.onclick !== null);
    }
    
    console.log('\n💡 Recommendations:');
    if (!apiWorking) {
        console.log('- Check server connection and authentication');
    }
    if (!componentState.confirmButton) {
        console.log('- Check if RideDetails component is properly rendered');
    }
    if (componentState.confirmButton?.disabled) {
        console.log('- Check validation logic - button may be disabled due to missing data');
    }
    
    return {
        rideData,
        apiWorking,
        componentState
    };
}

// Export for manual testing
window.rideConfirmationDiagnostic = {
    runDiagnostic,
    testRideData,
    testRideCreationAPI,
    testComponentState,
    testButtonClick
};

console.log('✅ Diagnostic script loaded. Run window.rideConfirmationDiagnostic.runDiagnostic() to start.');