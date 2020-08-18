import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const existingProductName = await this.ormRepository.findOne({
      where: {
        name,
      },
    });
    return existingProductName;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const ids = products.map(({ id }) => id);
    const productsById = await this.ormRepository.find({
      where: { id: In(ids) },
    });
    return productsById;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const ids = products.map(({ id }) => id);

    const findProducts = await this.ormRepository.find({
      where: { id: In(ids) },
    });

    products.forEach(data => {
      const indexArrayProduct = findProducts.findIndex(
        product => product.id === data.id,
      );
      findProducts[indexArrayProduct].quantity -= data.quantity;
    });

    await this.ormRepository.save(findProducts);

    return findProducts;
  }
}

export default ProductsRepository;
