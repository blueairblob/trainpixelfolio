
#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Make sure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  
  // Create placeholder images
  const placeholders = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
  placeholders.forEach(file => {
    fs.copyFileSync(
      path.join(__dirname, 'public', 'placeholder.svg'),
      path.join(assetsDir, file)
    );
  });
}

// Start Expo
const expo = spawn('npx', ['expo', 'start'], {
  stdio: 'inherit',
  shell: true
});

expo.on('close', code => {
  process.exit(code);
});
