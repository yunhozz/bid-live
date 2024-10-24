export class Page<T> {
	pageSize: number;
	totalCount: number;
	totalPage: number;
	items: T[];

	constructor(pageSize: number, totalCount: number, items: T[]) {
		this.pageSize = pageSize;
		this.totalCount = totalCount;
		this.totalPage = Math.ceil(totalCount / pageSize);
		this.items = items;
	}
}
