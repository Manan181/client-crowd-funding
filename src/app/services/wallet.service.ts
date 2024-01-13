import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ethers, providers } from 'ethers';

@Injectable({
	providedIn: 'root',
})
export class WalletService {
	public selectedAccount: Subject<string> = new Subject<string>();
	public ethereum = window['ethereum'];
	public signer: any;
	public provider: providers.Web3Provider;

	constructor() {
		this.setupEventListeners();
	}

	/**
	 * The function sets up event listeners for changes in Ethereum accounts and calls the
	 * checkWalletConnected function when a change occurs.
	 */
	private setupEventListeners() {
		if (this.ethereum) {
			this.ethereum.on('accountsChanged', () => {
				this.checkWalletConnected();
			});
		}
	}

	/**
	 * The function "getSigner" returns the signer.
	 * @returns The `getSigner()` method is returning the value of `this.signer`.
	 */
	public async getSigner() {
		return this.signer;
	}

	/* The `connectWallet` function is an asynchronous arrow function that is used to connect the wallet
	to the application. */
	public connectWallet = async () => {
		try {
			if (this.ethereum) {
				const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
				this.provider = new ethers.providers.Web3Provider(this.ethereum);
				this.signer = this.provider.getSigner();
				this.updateSelectedAccount(accounts[0]);
			} else {
				throw new Error('No Ethereum object found. Please install MetaMask.');
			}
		} catch (e) {
			console.error('Error connecting wallet:', e);
			throw new Error('Failed to connect wallet');
		}
	};

	/* The `checkWalletConnected` function is an asynchronous arrow function that is used to check if a
	wallet is connected to the application. */
	public checkWalletConnected = async () => {
		try {
			const accounts = await this.ethereum.request({ method: 'eth_accounts' });
			if (accounts[0]) {
				this.updateSelectedAccount(accounts[0]);
			} else {
				this.updateSelectedAccount(null);
			}
		} catch (e) {
			console.error('Error checking wallet connection:', e);
			throw new Error('Failed to check wallet connection');
		}
	};

	/**
	 * The function "updateSelectedAccount" updates the selected account by emitting a new value through
	 * the "selectedAccount" subject.
	 * @param account - The account parameter is the new account object that you want to set as the
	 * selected account.
	 */
	private async updateSelectedAccount(account) {
		this.selectedAccount.next(account);
	}

	/**
	 * The function converts a value to its equivalent in Ether.
	 * @param value - The parameter "value" is the value that you want to convert to Ether.
	 * @returns the value converted to Ether.
	 */
	public convertToEther(value) {
		return ethers.utils.formatEther(value);
	}

	/**
	 * The function converts a value to its equivalent in Wei, a unit of ether in the Ethereum blockchain.
	 * @param value - The value parameter is the amount of ether you want to convert to wei.
	 * @returns the value converted to wei.
	 */
	public convertToWei(value) {
		return ethers.utils.parseEther(value);
	}

	/**
	 * The function `getLatestBlockTimeStamp` retrieves the timestamp of the latest block in the Ethereum
	 * blockchain using the ethers library in TypeScript.
	 * @returns the timestamp of the latest block.
	 */
	public async getLatestBlockTimeStamp() {
		try {
			this.provider = new ethers.providers.Web3Provider(this.ethereum);
			const blockNumber = await this.provider.getBlockNumber();
			const block = await this.provider.getBlock(blockNumber);
			const timestamp = block.timestamp;
			return timestamp;
		} catch (error) {
			return error;
		}
	}
}
