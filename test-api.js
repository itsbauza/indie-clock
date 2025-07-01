const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testing Indie Clock API...\n');

  // Test 1: Check if server is running
  try {
    const response = await fetch('http://localhost:3002');
    console.log('✅ Server is running on http://localhost:3002');
  } catch (error) {
    console.log('❌ Server not running on http://localhost:3002');
    return;
  }

  // Test 2: Test GitHub contributions endpoint (without auth)
  try {
    const data = await response.json();
    
    if (response.status === 400) {
      console.log('✅ API endpoint working (correctly requires access_token)');
      console.log('   Response:', data.error);
    } else {
      console.log('⚠️  Unexpected response:', data);
    }
  } catch (error) {
    console.log('❌ API endpoint error:', error.message);
  }

  // Test 3: Test with invalid parameters
  try {
    const response = await fetch('http://localhost:3002/api/github/contributions?access_token=invalid&username=testuser');
    const data = await response.json();
    
    if (response.status === 404) {
      console.log('✅ API correctly handles invalid user');
    } else {
      console.log('⚠️  Unexpected response for invalid user:', data);
    }
  } catch (error) {
    console.log('❌ API endpoint error:', error.message);
  }

  console.log('\n🎉 API testing completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Open http://localhost:3002 in your browser');
  console.log('2. Check RabbitMQ Management UI at http://localhost:15672');
  console.log('3. Check Prisma Studio at http://localhost:5555');
  console.log('4. Configure your Awtrix clock with MQTT settings');
}

testAPI().catch(console.error); 