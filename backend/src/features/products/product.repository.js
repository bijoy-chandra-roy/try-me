const Product = require('./product.model');

class ProductRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.inStock !== undefined) query.inStock = filters.inStock;
    return Product.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return Product.findById(id).lean();
  }

  async create(data) {
    return Product.create(data);
  }

  async insertMany(products) {
    return Product.insertMany(products);
  }

  async deleteAll() {
    return Product.deleteMany({});
  }
}

module.exports = new ProductRepository();
