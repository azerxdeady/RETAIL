const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const repoConf = path.join(repoDir, 'apache', 'karthik-jewellers.conf');
const apacheBase = 'C:\\Users\\Star-PC\\Apache24';
const apacheExtraDir = path.join(apacheBase, 'conf', 'extra');
const targetExtraConf = path.join(apacheExtraDir, 'karthik-jewellers.conf');

if (!fs.existsSync(apacheExtraDir)) {
  fs.mkdirSync(apacheExtraDir, { recursive: true });
}
fs.copyFileSync(repoConf, targetExtraConf);
console.log('Successfully copied karthik-jewellers.conf to Apache extra conf');

const httpdConfPath = path.join(apacheBase, 'conf', 'httpd.conf');
let httpd = fs.readFileSync(httpdConfPath, 'utf8');

// Replace SRVROOT
httpd = httpd.replace(/Define SRVROOT "C:\/Apache24"/g, 'Define SRVROOT "C:/Users/Star-PC/Apache24"');

// Enable modules
httpd = httpd.replace(/#\s*LoadModule proxy_module modules\/mod_proxy\.so/, 'LoadModule proxy_module modules/mod_proxy.so');
httpd = httpd.replace(/#\s*LoadModule proxy_http_module modules\/mod_proxy_http\.so/, 'LoadModule proxy_http_module modules/mod_proxy_http.so');
httpd = httpd.replace(/#\s*LoadModule proxy_wstunnel_module modules\/mod_proxy_wstunnel\.so/, 'LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so');
httpd = httpd.replace(/#\s*LoadModule proxy_connect_module modules\/mod_proxy_connect\.so/, 'LoadModule proxy_connect_module modules/mod_proxy_connect.so');
httpd = httpd.replace(/#\s*LoadModule rewrite_module modules\/mod_rewrite\.so/, 'LoadModule rewrite_module modules/mod_rewrite.so');
httpd = httpd.replace(/#\s*LoadModule deflate_module modules\/mod_deflate\.so/, 'LoadModule deflate_module modules/mod_deflate.so');
httpd = httpd.replace(/#\s*LoadModule expires_module modules\/mod_expires\.so/, 'LoadModule expires_module modules/mod_expires.so');

// Set ServerName
httpd = httpd.replace(/#ServerName www\.example\.com:80/, 'ServerName localhost:80');

// Add Include if not present
if (!httpd.includes('karthik-jewellers.conf')) {
  httpd += '\n\n# Karthik Jewellers Reverse Proxy\nInclude conf/extra/karthik-jewellers.conf\n';
}

fs.writeFileSync(httpdConfPath, httpd, 'utf8');
console.log('httpd.conf configured successfully.');
