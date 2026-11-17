const app = require('./server/app');
const db = require('./server/services/db');

const PORT = process.env.PORT || 5000;

// Ensure database is initialized
db.init();

app.listen(PORT, () => {
  console.log('================================================================');
  console.log(' ✨  KARTHIK JEWELLERS - FINE JEWELLERY & ADMIN ECOSYSTEM  ✨');
  console.log('================================================================');
  console.log(` 🎛️  Master Hub Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(` 🛍️  Karthik Flagship:     http://localhost:${PORT}`);
  console.log(` 👑  Viswanandini Bridal:   http://localhost:${PORT}/viswanandini`);
  console.log(` ⚙️  Admin Command Center:  http://localhost:${PORT}/admin`);
  console.log(` 📄  GST Invoice System:    http://localhost:${PORT}/invoice`);
  console.log(` 📊  API Endpoints:        http://localhost:${PORT}/api/products`);
  console.log('================================================================');
  console.log(' Ready to serve customers with BIS 916 Hallmark guarantee.');
});

