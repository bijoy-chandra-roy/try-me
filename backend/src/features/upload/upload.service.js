const imgbbClient = require('./imgbb.client');

class UploadService {
  async uploadUserImage(file) {
    return imgbbClient.uploadImage(file.buffer, file.originalname);
  }
}

module.exports = new UploadService();
