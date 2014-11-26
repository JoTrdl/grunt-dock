var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('<h1>Hello World from node app</h1>');
  
  
  res.write('<ul>');
  for (i in req.headers) {
    res.write('<li>');
    res.write(i + '&nbsp;:&nbsp;' + req.headers[i]);
    res.write('</li>');
  }
  res.write('</ul>');

  res.write('<p>Behind NGINX? ==> ' + (req.headers['x-forwarded-host'] == 'nginx') +  '</p>');

  res.write('</body></html>');
  res.end();
});

server.listen(8080);

console.log('Server running at http://127.0.0.1:8000/');