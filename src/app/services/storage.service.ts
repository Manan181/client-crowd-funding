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

	/**
	 * The function `openDatabase()` opens an indexedDB database, creates an object store if it doesn't
	 * exist, and handles any errors that occur.
	 */
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

	/**
	 * The function adds an object to a specified store in a database transaction.
	 * @param {string} storeName - The name of the object store where the object will be added.
	 * @param {any} object - The "object" parameter is of type "any", which means it can accept any data
	 * type. It represents the object that you want to add to the specified store in the database.
	 */
	public addObject(storeName: string, object: any) {
		const transaction = this.db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.add(object);
	}

	/**
	 * The function `getAllObjects` retrieves all objects from a specified store in a database and passes
	 * them to a callback function.
	 * @param {string} storeName - The name of the object store from which you want to retrieve all
	 * objects.
	 * @param callback - The callback parameter is a function that will be called once the objects are
	 * retrieved from the object store. It takes an array of objects as its parameter.
	 */
	public getAllObjects(storeName: string, callback: (objects: any[]) => void) {
		const transaction = this.db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		request.onsuccess = (event) => {
			const objects = request.result;
			callback(objects);
		};
	}

	/**
	 * The function clears all data from a specified object store in a database.
	 * @param {string} storeName - The storeName parameter is a string that represents the name of the
	 * object store in the database that you want to clear.
	 */
	public clearStore(storeName: string) {
		const transaction = this.db.transaction(storeName, 'readwrite');

		transaction.onerror = (event) => {
			console.error('Error clearing the database:', (event.target as IDBTransaction).error);
		};

		transaction.objectStore(storeName).clear();
	}
}
