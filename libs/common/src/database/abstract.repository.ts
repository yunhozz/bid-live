import { AbstractSchema } from '@app/common/database/abstract.schema';
import { Connection, FilterQuery, Model, SaveOptions, Types, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TSchema extends AbstractSchema> {

    protected abstract readonly logger: Logger;

    protected constructor(
        protected readonly model: Model<TSchema>,
        private readonly connection: Connection
    ) {}

    async create(
        schema: Omit<TSchema, "_id">,
        options?: SaveOptions
    ): Promise<TSchema> {
        const createdDocument = new this.model({
            ...schema,
            _id: new Types.ObjectId()
        });
        const document = await createdDocument.save(options);

        return document.toJSON() as unknown as TSchema;
    }

    async findOne(filterQuery: FilterQuery<TSchema>) {
        const document = await this.model.findOne(filterQuery, {}, { lean: true });
        if (!document) {
            this.logger.warn(`Document not found with filterQuery: ${filterQuery}`);
            throw new NotFoundException("Document not found.");
        }

        return document;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TSchema>,
        update: UpdateQuery<TSchema>
    ) {
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            lean: true,
            new: true
        });
        if (!document) {
            this.logger.warn(`Document not found with filterQuery: ${filterQuery}`);
            throw new NotFoundException("Document not found.");
        }

        return document;
    }

    async upsert(
        filterQuery: FilterQuery<TSchema>,
        document: Partial<TSchema>
    ) {
        return this.model.findOneAndUpdate(filterQuery, document, {
            lean: true,
            upsert: true,
            new: true
        });
    }

    async find(filterQuery: FilterQuery<TSchema>) {
        return this.model.find(filterQuery, {}, { lean: true });
    }

    async startTransaction() {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }
}