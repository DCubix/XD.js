namespace core {
	export interface IDict<T> {
		[K: string]: T;
	}

	export class Dict<T> {
		containsKey(key: string): boolean {
			return typeof this[key] != "undefined";
		}
	}
}
