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

	private setupEventListeners() {
		if (this.ethereum) {
			this.ethereum.on('accountsChanged', () => {
				this.checkWalletConnected();
			});
		}
	}

	public async getSigner() {
		return this.signer;
	}

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

	private async updateSelectedAccount(account) {
		this.selectedAccount.next(account);
	}

	public convertToEther(value) {
		return ethers.utils.formatEther(value);
	}

	public convertToWei(value) {
		return ethers.utils.parseEther(value);
	}
	
	public async getLatestBlockTimeStamp () {
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
