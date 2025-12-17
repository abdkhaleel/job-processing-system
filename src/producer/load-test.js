const { spawn } = require('child_process');

console.log('--- STARTING LOAD TEST (10 Orders) ---');

for (let i = 1; i <= 10; i++) {
  const curl = spawn('curl', [
    '-X', 'POST', 'http://localhost:3000/order',
    '-H', 'Content-Type: application/json',
    '-d', JSON.stringify({ item: `LoadTest_Item_${i}`, quantity: 1 }),
    '-s' 
  ]);

  curl.stdout.on('data', (data) => {
    const res = JSON.parse(data.toString());
    console.log(`Sent Order #${i}: ${res.orderId}`);
  });
}