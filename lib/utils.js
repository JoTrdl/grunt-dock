
var moment = require('moment');

var utils = {};

/**
 * Default options
 * @type {Object}
 */
utils.defaultOptions = {
  protocol: 'http',
  host: '192.168.59.103',
  port: '2376'
};


utils.format = function(name, value) {

  var format = "";

  switch(name) {
    case 'repotag':
      var split = value.split(':');
      format = {
        'repository': split[0],
        'tag': split[1]
      };
      break;
    case 'id':
      format = value.split("").slice(0,12).join("");
      break;
    case 'command':
      format = value.split("").slice(0,16).join("");
      break;
    case 'date':
      format = moment.unix(value).fromNow();
      break;
    case 'size':
      format = (value/1000000).toFixed(1) + ' MB';
      break;
    case 'ports':
      for (var p = 0; p < value.length; p++) {
        format += value[p].IP + ':' + value[p].PublicPort + '->' + value[p].PrivatePort + '/' + value[p].Type;
        if (p !== value.length - 1) // Not the last item
          format += "\n";
      }
      break;
    case 'names':
      for (var p = 0; p < value.length; p++) {
        format += value[p].replace('/', '');
        if (p !== value.length - 1) // Not the last item
          format += "\n";
      }
      break;
  }
  
  return format;

};

module.exports = utils;