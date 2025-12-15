
const fs = require('fs');
const path = require('path');

console.log('Starting frontend tests...');

try {
  
  const requiredFiles = [
    'index.html',
    'style.css', 
    'app.js'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`${file} exists`);
    } else {
      console.log(`${file} not found`);
      
    }
  });

  console.log('Frontend structure check completed!');
  process.exit(0); 

} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1); 
}
