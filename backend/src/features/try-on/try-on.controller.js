const tryOnService = require('./try-on.service');

async function createTryOn(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error('User image is required');
      error.statusCode = 400;
      throw error;
    }

    const { productId } = req.body;
    if (!productId) {
      const error = new Error('productId is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await tryOnService.processTryOn({
      file: req.file,
      productId,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { createTryOn };
