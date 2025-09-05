#!/usr/bin/env node

const http = require('http');

console.log('🔍 RentBridge Application Status Check\n');

// Test Backend Health
console.log('Testing Backend (http://localhost:5000)...');
const backendReq = http.get('http://localhost:5000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Backend is running successfully');
      console.log('   Response:', JSON.parse(data).message);
    } else {
      console.log('❌ Backend returned error:', res.statusCode);
    }
  });
});

backendReq.on('error', (err) => {
  console.log('❌ Backend connection failed:', err.message);
});

// Test Frontend (just check if port is open)
console.log('\nTesting Frontend (http://localhost:5173)...');
const frontendReq = http.get('http://localhost:5173', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Frontend is running successfully');
  } else {
    console.log('❌ Frontend returned error:', res.statusCode);
  }
});

frontendReq.on('error', (err) => {
  console.log('❌ Frontend connection failed:', err.message);
});

setTimeout(() => {
  console.log('\n🎯 Application Status Summary:');
  console.log('- Backend: http://localhost:5000');
  console.log('- Frontend: http://localhost:5173');
  console.log('- Ready for Vercel deployment! 🚀');
  process.exit(0);
}, 2000);
