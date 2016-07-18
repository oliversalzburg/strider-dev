'use strict';

const Promise = require('bluebird');

const fs = require('fs');
const mkdirpAsync = Promise.promisify(require('mkdirp'));
const path = require('path');

module.exports = function copyFile(source, target) {
  return mkdirpAsync(path.dirname(target))
    .then(() => new Promise(function (resolve, reject) {
      var rd = fs.createReadStream(source);
      rd.on('error', reject);
      var wr = fs.createWriteStream(target);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    }));
};
