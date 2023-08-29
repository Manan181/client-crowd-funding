import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ethers } from 'ethers';
import CrowdSourcingFactory from '../artifacts/CrowdSourcingFactory.json';
import CrowdFundingContract from '../artifacts/CrowdFundingContract.json';
import { WalletService } from './wallet.service';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	private signer;
	private crowdSourcingContract;
	private provider;
	private contractAddress = environment.crowdSourcingFactoryAddress;

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
			console.log('🚀 ~ file: api.service.ts:38 ~ ApiService ~ createCrowdFundingContract ~ error:', error);
			return error;
		}
	}

	async getDeployedContracts(): Promise<any> {
		try {
			const txResponse = await this.crowdSourcingContract['deployedContracts']();
			return txResponse;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:47 ~ ApiService ~ getDeployedContracts ~ error:', error);
			return error;
		}
	}

	async getCampaignDetails(params): Promise<any> {
		try {
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.provider);
			const txResponse = await contract['getCampaignInfo']();
			return txResponse;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:59 ~ ApiService ~ getCampaignDetails ~ error:', error);
			return error;
		}
	}

	async withdrawMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);

			const contractTransaction = await contract.populateTransaction['withdrawMilestone'](params.milestoneCounter, {
				gasLimit: 500000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:77 ~ ApiService ~ withdrawMilestone ~ error:', error);
			return error;
		}
	}

	async createNewMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);
			const contractTransaction = await contract.populateTransaction['createNewMilestone'](params.milestoneCID, params.votingPeriod, params.milestoneCounter, {
				gasLimit: 200000,
			});

			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:89 ~ ApiService ~ createNewMilestone ~ error:', error);
			return error;
		}
	}

	async makeDonation(params): Promise<any> {
		try {
			if (!params) throw new Error('params must be provided');
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
			console.log('🚀 ~ file: api.service.ts:108 ~ ApiService ~ makeDonation ~ error:', error);
			return error;
		}
	}

	async voteOnMilestone(params): Promise<any> {
		try {
			this.signer = this.provider.getSigner();
			const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.signer);
			const contractTransaction = await contract.populateTransaction['voteOnMilestone'](params.vote, params.milestoneCounter, {
				gasLimit: 500000,
			});
			const txResponse = await this.signer.sendTransaction(contractTransaction);
			const txReceipt = await txResponse.wait();
			return txReceipt;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:126 ~ ApiService ~ voteOnMilestone ~ error:', error);
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
			console.log('🚀 ~ file: api.service.ts:142 ~ ApiService ~ withdrawFunds ~ error:', error);
			return error;
		}
	}

	async getCampaignDonors(campaignAddress, donors): Promise<any> {
		try {
			const contract = new ethers.Contract(campaignAddress, CrowdFundingContract.abi, this.provider);
			let donorsInfo = [];
			for (let donor of donors) {
				const txResponse = await contract['s_donors'](donor);
				let donorObj = { address: donor, amount: `${this.walletService.convertToEther(txResponse)} ETH` };
				donorsInfo.push(donorObj);
			}
			return donorsInfo;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:151 ~ ApiService ~ getCampaignDonors ~ error:', error);
			return error;
		}
	}

	async getMilestones(campaignAddress): Promise<any[]> {
		try {
			const contract = new ethers.Contract(campaignAddress, CrowdFundingContract.abi, this.provider);
			let milestones = [];
			for (let milestone of [1, 2, 3]) {
				const txResponse = await contract['getMilestones'](milestone);
				milestones.push({ milestone: txResponse });
			}
			return milestones;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:151 ~ ApiService ~ getCampaignDonors ~ error:', error);
			return error;
		}
	}

	async queryFilter(params) {
		const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.provider);
		const transactions = await contract.queryFilter(params.query);
		transactions.map((item) => {
			console.log(item.args, ':', item.args);
		});
	}
}
