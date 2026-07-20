const fs = require('fs/promises');
const config = require('../../config');

class VtoApiClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * Calls the IDM-VTON Hugging Face Space Gradio API.
   * Expects userImageUrl (person) and garmentImageUrl (product from MongoDB).
   */
  async generateTryOn(userImageUrl, garmentImageUrl) {
    const payload = {
      data: [
        {
          path: userImageUrl,
          meta: { _type: 'gradio.FileData' },
        },
        {
          path: garmentImageUrl,
          meta: { _type: 'gradio.FileData' },
        },
        'upper_body',
        false,
        false,
        30,
        42,
      ],
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`VTO API error: HTTP ${response.status}`);
    }

    const result = await response.json();
    const outputPath = this._extractOutputPath(result);

    if (!outputPath) {
      throw new Error('VTO API returned no composite image');
    }

    return {
      imageUrl: outputPath,
      source: 'vto-api',
    };
  }

  _extractOutputPath(result) {
    if (result?.data?.[0]?.url) return result.data[0].url;
    if (typeof result?.data?.[0] === 'string') return result.data[0];
    if (result?.data?.[0]?.path) return result.data[0].path;
    return null;
  }
}

class FallbackCache {
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  async getFallbackResult() {
    const buffer = await fs.readFile(this.imagePath);
    const base64 = buffer.toString('base64');
    return {
      imageUrl: `data:image/jpeg;base64,${base64}`,
      source: 'fallback-cache',
    };
  }
}

module.exports = {
  vtoApiClient: new VtoApiClient(config.vtoApiUrl),
  fallbackCache: new FallbackCache(config.fallbackImagePath),
};
