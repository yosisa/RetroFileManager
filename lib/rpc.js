'use strict';

const grpc = require('grpc');
const rfm = grpc.load('./rfm-pb/rfm.proto').rfm;
const client = new rfm.FS('127.0.0.1:50051', grpc.credentials.createInsecure());

function readDir(base_dir, target) {
  return new Promise((resolve, reject) => {
    client.readDir({base_dir, target}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

module.exports = {
  readDir
};
