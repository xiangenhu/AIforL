/**
 * Debug Test Script
 * 
 * This script tests the debugging functionality of the Lesson Plan Generator.
 * It makes a request to the API and logs the response.
 * 
 * Usage:
 * node debug-test.js
 */

const http = require('http');

console.log('Debug Test Script - Starting');
console.log('Making request to /api/debug/status...');

// Make a request to the debug status API
const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/debug/status',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      
      // Now make a request to toggle debug mode
      console.log('\nToggling debug mode...');
      const toggleOptions = {
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        path: '/api/debug/toggle',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const toggleReq = http.request(toggleOptions, (toggleRes) => {
        let toggleData = '';
        
        toggleRes.on('data', (chunk) => {
          toggleData += chunk;
        });
        
        toggleRes.on('end', () => {
          console.log('Toggle response received:');
          try {
            const parsedToggleData = JSON.parse(toggleData);
            console.log(JSON.stringify(parsedToggleData, null, 2));
            console.log('\nDebug Test Script - Complete');
          } catch (e) {
            console.error('Error parsing toggle response:', e);
          }
        });
      });
      
      toggleReq.on('error', (e) => {
        console.error(`Toggle request error: ${e.message}`);
      });
      
      // Send the toggle request with debug settings
      const toggleBody = JSON.stringify({
        enabled: !parsedData.debug.enabled,
        verbose: !parsedData.debug.verbose,
        logLLMRequests: !parsedData.debug.logLLMRequests,
        logLLMResponses: !parsedData.debug.logLLMResponses
      });
      
      toggleReq.write(toggleBody);
      toggleReq.end();
      
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
