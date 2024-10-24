import { IsNumber } from 'class-validator';

export class PageRequest {
	@IsNumber()
	pageNo?: number;

	@IsNumber()
	pageSize?: number;

	constructor(pageNo?: number, pageSize?: number) {
		this.pageNo = pageNo ?? 1;
		this.pageSize = pageSize ?? 10;
	}

	getOffset(): number {
		const pageNo = this.pageNo && this.pageNo > 0 ? this.pageNo : 1;
		const pageSize = this.pageSize && this.pageSize > 0 ? this.pageSize : 10;
		return (pageNo - 1) * pageSize;
	}

	getLimit(): number {
		return this.pageSize && this.pageSize > 0 ? this.pageSize : 10;
	}
}
