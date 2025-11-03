import React, { useEffect } from 'react';
import { useCaptain } from '../src/contexts/CaptainContext';

const TestCaptainHome = () => {
  const { captain } = useCaptain();
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    console.log('🧪 Test Captain Home - Debug Info:');
    console.log('1. Token:', token ? 'Present' : 'Missing');
    console.log('2. UserData:', userData);
    console.log('3. Captain:', captain);
    console.log('4. Captain ID:', captain?._id);
    console.log('5. Captain Name:', captain?.fullname);
    console.log('6. Captain Vehicle:', captain?.vehicle);
  }, [captain, token, userData]);

  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>❌ No Token Found</h1>
        <p>Please login as a captain first.</p>
        <button onClick={() => window.location.href = '/captain/login'}>
          Go to Captain Login
        </button>
      </div>
    );
  }

  if (!captain || !captain._id) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>⏳ Loading Captain Data...</h1>
        <p>Token: {token ? '✅' : '❌'}</p>
        <p>UserData Type: {userData?.type || 'Not set'}</p>
        <p>Captain Object: {captain ? 'Present' : 'Missing'}</p>
        <p>Captain ID: {captain?._id || 'Not loaded'}</p>
        
        <div style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify({ userData, captain }, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>✅ Captain Home Screen Test</h1>
      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Captain Information:</h2>
        <p><strong>ID:</strong> {captain._id}</p>
        <p><strong>Name:</strong> {captain.fullname?.firstname} {captain.fullname?.lastname}</p>
        <p><strong>Email:</strong> {captain.email}</p>
        <p><strong>Phone:</strong> {captain.phone}</p>
        <p><strong>Vehicle Type:</strong> {captain.vehicle?.type}</p>
        <p><strong>Vehicle Number:</strong> {captain.vehicle?.number}</p>
        <p><strong>Status:</strong> {captain.status}</p>
      </div>
      
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
        <h3>✅ Captain data loaded successfully!</h3>
        <p>The captain home screen should work now.</p>
        <button 
          onClick={() => window.location.href = '/captain/home'}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Go to Captain Home
        </button>
      </div>
    </div>
  );
};

export default TestCaptainHome;