import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ethers } from 'ethers';
import CrowdSourcingFactory from '../artifacts/CrowdSourcingFactory.json';
import CrowdFundingContract from '../artifacts/CrowdFundingContract.json';
import { WalletService } from './wallet.service';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	private apiURL = environment.apiURL;
	private signer;
	private crowdSourcingContract;
	private provider;
	private contractAddress = environment.crowdSourcingFactoryAddress;
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json',
		}),
	};

	constructor(private walletService: WalletService) {
		this.provider = new ethers.providers.Web3Provider(window['ethereum']);
		this.crowdSourcingContract = new ethers.Contract(this.contractAddress, CrowdSourcingFactory.abi, this.provider);
	}

	async createCrowdFundingContract(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(this.contractAddress, CrowdSourcingFactory.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['createCrowdFundingContract'](
				params.fundingCID,
				params.amountToRaise,
				params.duration,
				{ value: params.value, gasLimit: 500000 }
			);

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:57 ~ ApiService ~ createCrowdFundingContract ~ error:', error);
			return error;
		}
	}

	async getDeployedContracts(): Promise<any> {
		const txResponse = await this.crowdSourcingContract['deployedContracts']();
		return txResponse;
	}

	async etherBalance(params): Promise<any> {
		const txResponse = await this.crowdSourcingContract['etherBalance']();
		return txResponse;
	}

	async getCampaignDetails(params): Promise<any> {
		const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.provider);
		const txResponse = await contract['getCampaignInfo']();
		return txResponse;
	}

	async withdrawMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['withdrawMilestone']({
				gasLimit: 500000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:57 ~ ApiService ~ createCrowdFundingContract ~ error:', error);
			return error;
		}
	}

	async createNewMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['createNewMilestone'](params.milestoneCID, params.votingPeriod, {
				gasLimit: 500000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:57 ~ ApiService ~ createCrowdFundingContract ~ error:', error);
			return error;
		}
	}

	async makeDonation(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['makeDonation']({
				value: params.amount,
				gasLimit: 500000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:96 ~ ApiService ~ makeDonation ~ error:', error);
			return error;
		}
	}

	async voteOnMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['voteOnMilestone'](params.vote, {
				gasLimit: 500000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:96 ~ ApiService ~ makeDonation ~ error:', error);
			return error;
		}
	}

	async withdrawFunds(): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(this.contractAddress, CrowdSourcingFactory.abi, this.signer);
			
			const contractTransaction = await contract.populateTransaction['withdrawFunds']({ gasLimit: 500000 });

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:96 ~ ApiService ~ makeDonation ~ error:', error);
			return error;
		}
	}
}
