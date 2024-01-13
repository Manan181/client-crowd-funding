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

	/**
	 * The function `createCrowdFundingContract` creates a crowdfunding contract by sending a transaction
	 * to the contract with the specified parameters.
	 * @param params - The `params` object contains the following properties:
	 * @returns the transaction receipt.
	 */
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

	/**
	 * The function `getDeployedContracts` is an asynchronous function that retrieves the deployed
	 * contracts from the `crowdSourcingContract` and returns the transaction response or an error if it
	 * occurs.
	 * @returns The function `getDeployedContracts` returns a Promise that resolves to the result of
	 * calling the `deployedContracts` function on the `crowdSourcingContract`.
	 */
	async getDeployedContracts(): Promise<any> {
		try {
			const txResponse = await this.crowdSourcingContract['deployedContracts']();
			return txResponse;
		} catch (error) {
			console.log('🚀 ~ file: api.service.ts:47 ~ ApiService ~ getDeployedContracts ~ error:', error);
			return error;
		}
	}

	/**
	 * The function `getCampaignDetails` is an asynchronous function that retrieves campaign details from
	 * a smart contract using the provided parameters.
	 * @param params - The `params` parameter is an object that contains the following properties:
	 * @returns either the transaction response or an error.
	 */
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

	/**
	 * The function `withdrawMilestone` is an asynchronous function that withdraws funds from a milestone
	 * in a crowdfunding contract.
	 * @param params - The `params` parameter is an object that contains the following properties:
	 * @returns the transaction receipt after successfully withdrawing a milestone from a crowdfunding
	 * contract. If there is an error, it will return the error object.
	 */
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

	/**
	 * The function `createNewMilestone` is an asynchronous function that creates a new milestone in a
	 * crowdfunding contract using the provided parameters.
	 * @param params - - campaignAddress: The address of the campaign contract.
	 * @returns the transaction receipt.
	 */
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

	/**
	 * The `makeDonation` function is an asynchronous function that makes a donation to a crowdfunding
	 * campaign contract using the provided parameters.
	 * @param params - The `params` parameter is an object that contains the following properties:
	 * @returns either the transaction receipt if the donation was successful, or an error object if there
	 * was an error during the donation process.
	 */
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

	/**
	 * The function `voteOnMilestone` is an asynchronous function that allows a user to vote on a
	 * milestone in a crowdfunding campaign by sending a transaction to the smart contract.
	 * @param params - The `params` object contains the following properties:
	 * @returns the transaction receipt.
	 */
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

	/**
	 * The function `withdrawFunds` is an asynchronous function that withdraws funds from a contract using
	 * ethers.js and returns the transaction receipt.
	 * @returns The function `withdrawFunds` returns a Promise that resolves to the transaction receipt if
	 * the withdrawal is successful. If there is an error, it returns the error object.
	 */
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

	/**
	 * The function `getCampaignDonors` retrieves information about donors for a given campaign address.
	 * @param campaignAddress - The `campaignAddress` parameter is the address of a crowdfunding campaign
	 * contract. It is used to create an instance of the contract and interact with it.
	 * @param donors - An array of addresses representing the donors of a campaign.
	 * @returns an array of donor information objects. Each object contains the donor's address and the
	 * amount they donated in Ether.
	 */
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

	/**
	 * The function `getMilestones` retrieves milestones from a crowdfunding contract using the provided
	 * campaign address.
	 * @param campaignAddress - The `campaignAddress` parameter is the address of a smart contract
	 * representing a crowdfunding campaign.
	 * @returns an array of objects, where each object represents a milestone. Each object has a property
	 * called "milestone" which contains the transaction response for that milestone.
	 */
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

	/**
	 * The function `queryFilter` queries a contract using a specified filter and logs the arguments of
	 * each transaction.
	 * @param params - {
	 */
	async queryFilter(params) {
		const contract = new ethers.Contract(params.campaignAddress, CrowdFundingContract.abi, this.provider);
		const transactions = await contract.queryFilter(params.query);
		transactions.map((item) => {
			console.log(item.args, ':', item.args);
		});
	}
}
