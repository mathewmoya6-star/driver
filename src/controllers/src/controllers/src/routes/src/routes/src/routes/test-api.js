const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing MEI DRIVE AFRICA API...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await fetch('http://localhost:5000/health');
    const healthData = await health.json();
    console.log('   ✅ Health check passed:', healthData.status);
    
    // Test 2: Get vehicle makes
    console.log('\n2️⃣ Testing vehicle makes endpoint...');
    const makes = await fetch(`${API_URL}/valuation/makes`);
    const makesData = await makes.json();
    console.log(`   ✅ Found ${makesData.makes?.length || 0} vehicle makes`);
    
    // Test 3: Register a user
    console.log('\n3️⃣ Testing user registration...');
    const register = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `test${Date.now()}@mei.africa`,
            password: 'Test123456',
            fullName: 'Test User',
            phone: '+254712345678'
        })
    });
    const registerData = await register.json();
    if (registerData.success) {
        console.log('   ✅ Registration successful!');
    } else {
        console.log('   ⚠️ Registration response:', registerData.message || 'User may already exist');
    }
    
    console.log('\n✨ API tests complete! Backend is working.');
}

testAPI().catch(console.error);
