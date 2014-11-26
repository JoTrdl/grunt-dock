var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.end('<h1>Hello World from node app</h1>');
  res.write('</body></html>');
  res.end();
});

server.listen(8080);

console.log('Server running at http://127.0.0.1:8000/');