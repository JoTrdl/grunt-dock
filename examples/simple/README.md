# Grunt-Dock | Simple sample

A simple sample that starts a Node.js container with a mounted volume.

**Note for Mac OS X: the volume must be in /Users in order to work properly (Docker limitation)**

## Getting started:

Update the options to connect with Docker.
For supported options, see [dockerode](https://github.com/apocas/dockerode#getting-started).

For example, in a Mac environment with Boot2Docker, it should like:
```javascript
docker: {
  protocol: 'https',
  host: '192.168.59.103',
  port: '2376',
  
  ca: fs.readFileSync('PATH_TO_CA_PEM'),
  cert: fs.readFileSync('PATH_TO_CERT_PEM'),
  key: fs.readFileSync('PATH_TO_KEY_PEM')
}
```

Next, you can use the container like this:

```bash
# To build the image, enter:
grunt dock:build

# To start the image, use:
grunt dock:start

# Other options: stop/kill/logs/pause/unpause
```

You can then test the container by accessing [http://localhost:8080](http://localhost:8080) in your browser. It should display a html page. You can edit this page and it should be up to date when refreshing the page, meaning that the container mounted volume has successfully worked.

Note: for Boot2Docker user, you will need to add a port forwarding in your VM.

