import { MongoSchema } from '@app/common/config/database/mongo.schema';
import { PageRequest } from '@app/common/pagination/page-request';
import { Logger, NotFoundException } from '@nestjs/common';
import { Connection, FilterQuery, Model, SaveOptions, Types, UpdateQuery } from 'mongoose';

export abstract class MongoRepository<TSchema extends MongoSchema> {
	protected abstract readonly logger: Logger;

	protected constructor(
		protected readonly model: Model<TSchema>,
		private readonly connection: Connection
	) {}

	async create(schema: Omit<TSchema, '_id'>, options?: SaveOptions): Promise<TSchema> {
		const createdDocument = new this.model({
			...schema,
			_id: new Types.ObjectId()
		});
		const document = await createdDocument.save(options);

		return document.toJSON() as unknown as TSchema;
	}

	async findOne(filterQuery: FilterQuery<TSchema>, ...joins: string[]) {
		const document = await this.model
			.findOne(filterQuery, {}, { lean: true })
			.populate(joins)
			.exec();
		if (!document) {
			this.logger.warn(`Document not found with filterQuery: ${filterQuery}`);
			throw new NotFoundException('Document not found.');
		}

		return document;
	}

	async findOneAndUpdate(filterQuery: FilterQuery<TSchema>, update: UpdateQuery<TSchema>) {
		const document = await this.model.findOneAndUpdate(filterQuery, update, {
			lean: true,
			new: true
		});
		if (!document) {
			this.logger.warn(`Document not found with filterQuery: ${filterQuery}`);
			throw new NotFoundException('Document not found.');
		}

		return document;
	}

	async upsert(filterQuery: FilterQuery<TSchema>, document: Partial<TSchema>) {
		return this.model.findOneAndUpdate(filterQuery, document, {
			lean: true,
			upsert: true,
			new: true
		});
	}

	async findAll(filterQuery: FilterQuery<TSchema>, page?: PageRequest, ...joins: string[]) {
		const items = await this.model
			.find(filterQuery, {}, { lean: true })
			.populate(joins)
			.skip(page?.getOffset())
			.limit(page?.getLimit())
			.exec();

		const total = await this.model.countDocuments();

		return { total, items };
	}

	async exists(filterQuery: FilterQuery<TSchema>): Promise<boolean> {
		const found = await this.model.find(filterQuery, {}, { lean: true });
		return found.length > 0;
	}

	async startTransaction() {
		const session = await this.connection.startSession();
		session.startTransaction();

		return session;
	}
}
