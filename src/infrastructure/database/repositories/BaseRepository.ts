import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  Types,
  QueryOptions,
  CreateOptions,
  InsertManyOptions,
} from "mongoose";

export interface IBaseRepository<T, TDocument> {
  findById(id: Types.ObjectId, options?: object): Promise<T | null>;
  findOne(query: FilterQuery<TDocument>, options?: object): Promise<T | null>;
  find(query: FilterQuery<TDocument>, options?: object): Promise<T[]>;
  create(doc: Partial<TDocument>, options?: object): Promise<T>;
  insertMany(docs: Partial<TDocument>[], options?: object): Promise<T[]>;
  findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<T | null>;
  findByIdAndUpdate(
    id: Types.ObjectId,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<T | null>;
  updateOne(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<void>;
  updateMany(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<UpdateQuery<T>>;
  findByIdAndDelete(id: Types.ObjectId, options?: object): Promise<void>;
  deleteOne(query: FilterQuery<TDocument>, options?: object): Promise<void>;
  deleteMany(query: FilterQuery<TDocument>, options?: object): Promise<void>;
  countDocuments(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<number>;
}

export abstract class BaseRepository<T, TDocument extends Document>
  implements IBaseRepository<T, TDocument>
{
  private model: Model<TDocument>;

  constructor(model: Model<TDocument>) {
    this.model = model;
  }

  abstract toEntity(doc: TDocument): T;

  public async findById(
    id: Types.ObjectId,
    options?: object
  ): Promise<T | null> {
    const doc = await this.model.findById(id, options).exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async findOne(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<T | null> {
    const doc = await this.model.findOne(query, options).exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async find(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<T[]> {
    // Extract pagination and sorting options to avoid projection conflicts
    const { skip, limit, sort, ...otherOptions } = options || ({} as any);

    let queryBuilder = this.model.find(query, otherOptions);

    // Apply sorting if provided
    if (sort) {
      queryBuilder = queryBuilder.sort(sort);
    }

    // Apply pagination if provided
    if (skip !== undefined) {
      queryBuilder = queryBuilder.skip(skip);
    }
    if (limit !== undefined) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const docs = await queryBuilder.exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  public async create(
    doc: Partial<TDocument>,
    options?: CreateOptions
  ): Promise<T> {
    const entity = await this.model.create([doc], options);
    return this.toEntity(entity[0]);
  }

  public async insertMany(
    docs: Partial<TDocument>[],
    options: InsertManyOptions
  ): Promise<T[]> {
    const entities = (await this.model.insertMany(
      docs,
      options
    )) as unknown as TDocument[];
    return entities.map((doc) => this.toEntity(doc));
  }

  public async findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<T | null> {
    const doc = await this.model
      .findOneAndUpdate(query, update, options)
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async findByIdAndUpdate(
    id: Types.ObjectId,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, update, options).exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async updateOne(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<void> {
    await this.model.updateOne(query, update, options).exec();
  }

  public async updateMany(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: object
  ): Promise<UpdateQuery<T>> {
    return await this.model.updateMany(query, update, options).exec();
  }

  public async findByIdAndDelete(
    id: Types.ObjectId,
    options?: object
  ): Promise<void> {
    await this.model.findByIdAndDelete(id, options).exec();
  }

  public async deleteMany(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<void> {
    await this.model.deleteMany(query, options).exec();
  }

  public async deleteOne(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<void> {
    await this.model.deleteOne(query, options).exec();
  }

  public async countDocuments(
    query: FilterQuery<TDocument>,
    options?: object
  ): Promise<number> {
    return await this.model.countDocuments(query, options).exec();
  }
}
