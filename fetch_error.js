const https = require('https');

https.get('https://react.dev/errors/441', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.match(/Cannot (.*?)</g)?.[0] || data.substring(2000, 3000));
  });
});
