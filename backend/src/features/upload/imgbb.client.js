const fs = require('fs/promises');
const config = require('../../config');

class ImgBBClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.imgbb.com/1/upload';
  }

  async uploadImage(buffer, filename = 'user-photo.jpg') {
    if (!this.apiKey) {
      // Dev/demo fallback when ImgBB key is not configured
      const base64 = buffer.toString('base64');
      const mime = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return `data:${mime};base64,${base64}`;
    }

    const base64 = buffer.toString('base64');
    const body = new URLSearchParams({
      key: this.apiKey,
      image: base64,
      name: filename,
    });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success) {
      throw new Error(payload.error?.message || 'ImgBB upload failed');
    }

    return payload.data.url;
  }
}

module.exports = new ImgBBClient(config.imgbbApiKey);
