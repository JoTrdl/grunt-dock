####################
# Docker installation
# http://viget.com/extend/how-to-use-docker-on-os-x-the-missing-guide
# options :ro
###############################################################
# docker build -t altar/stack .
# docker run --name altar -d altar/stack
# docker run -p 8080:8080 -d -v .:/bundle altar/stack

####################
# Clear containers
###############################################################
# docker ps -a -q --filter "status=exited" | xargs docker rm
# docker rmi `docker images -q --filter "dangling=true"`
#############################################################################################

# http://stackoverflow.com/questions/18805073/docker-multiple-entrypoints

# DOCKER-VERSION 1.3.0
FROM    centos:latest

# Enable EPEL
#RUN     rpm -Uvh http://fedora-epel.mirror.iweb.com/7/x86_64/e/epel-release-7-2.noarch.rpm

# Install Node.js and npm
RUN     yum install -y wget tar > /dev/null
RUN     wget http://nodejs.org/dist/v0.10.33/node-v0.10.33-linux-x64.tar.gz > /dev/null
RUN     tar --strip-components 1 -xzf node-v* -C /usr/local > /dev/null
RUN     node --version


#RUN     yum install -y npm

# Install nodemon
#RUN     npm install -g nodemon

# Install Redis
#RUN     yum install -y redis

# Bundle app source
#COPY     . /bundle
# Install app dependencies
#RUN     cd /bundle; npm install -d

RUN   mkdir /bundle; cd /bundle

EXPOSE  8080

# Prepare commands
#RUN      echo "service redis-server start" && echo "Redis started" > /etc/bash.bashrc
#RUN      echo "node /bundle/app/app.js" && echo "App started" >> /etc/bash.bashrc
#ENTRYPOINT ["/bin/bash"]

CMD ["node", "/bundle/app/app.js"]

