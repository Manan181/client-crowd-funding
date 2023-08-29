import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	private dbName: string = 'crowdFundingDB';
	private dbVersion: number = 1;
	private db: IDBDatabase;

	constructor() {
		this.openDatabase();
	}

	private openDatabase() {
		const request = indexedDB.open(this.dbName, this.dbVersion);

		request.onsuccess = (event) => {
			this.db = request.result;
		};

		request.onupgradeneeded = (event) => {
			this.db = (event.target as IDBOpenDBRequest).result;
			if (!this.db.objectStoreNames.contains('campaigns')) {
				this.db.createObjectStore('campaigns', { keyPath: 'campaignAddress' });
			}
		};

		request.onerror = (event) => {
			console.error('Database error:', (event.target as IDBOpenDBRequest).error);
		};
	}

	public addObject(storeName: string, object: any) {
		const transaction = this.db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.add(object);
	}

	public getAllObjects(storeName: string, callback: (objects: any[]) => void) {
		const transaction = this.db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		request.onsuccess = (event) => {
			const objects = request.result;
			callback(objects);
		};
	}

	public clearStore(storeName: string) {
		const transaction = this.db.transaction(storeName, 'readwrite');

		transaction.onerror = (event) => {
			console.error('Error clearing the database:', (event.target as IDBTransaction).error);
		};

		transaction.objectStore(storeName).clear();
	}
}
