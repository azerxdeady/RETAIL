const app = require('./server/app');
const db = require('./server/services/db');
const os = require('os');

const PORT = process.env.PORT || 5000;

// Ensure database is initialized
db.init();

function getLocalIpAddresses() {
  const ifaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

app.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  const primaryLanIp = localIps[0] || '127.0.0.1';
  const hostname = os.hostname();

  console.log('================================================================');
  console.log(' ✨  KARTHIK JEWELLERS - LOCAL ENTERPRISE SERVER HOST  ✨');
  console.log('================================================================');
  console.log(` 💻  This Computer:      http://localhost:${PORT}`);
  if (localIps.length > 0) {
    console.log(` 📶  Wi-Fi / LAN Network: http://${primaryLanIp}:${PORT}`);
  }
  console.log(` 🏷️  Hostname Access:    http://${hostname}:${PORT}`);
  console.log('----------------------------------------------------------------');
  console.log(` 🛍️  Karthik Storefront:   http://${primaryLanIp}:${PORT}`);
  console.log(` 👑  Viswanandini Bridal: http://${primaryLanIp}:${PORT}/viswanandini`);
  console.log(` 🎛️  Master Hub Cockpit:  http://${primaryLanIp}:${PORT}/dashboard`);
  console.log(` ⚙️  Admin Operations:    http://${primaryLanIp}:${PORT}/admin`);
  console.log(` 📄  GST Tax Invoice:     http://${primaryLanIp}:${PORT}/invoice`);
  console.log('================================================================');
  console.log(' Serving showroom devices, tablets & billing counters on LAN.');
});

