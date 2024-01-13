import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { WalletService } from 'src/app/services/wallet.service';
import { CreateCrowdfundingModalComponent } from '../create-crowdfunding-modal/create-crowdfunding-modal.component';
import { StorageService } from 'src/app/services/storage.service';
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component';
import { CampaignDetails } from '../../states/campaign.state';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	public campaignsList: CampaignDetails[] = [];
	public signer: any;
	public gridColumns = 3;
	isLoading = false;
	voteOptions: Array<any> = [];
	remainingVotingTime: any;
	donorsList = [];
	isPopoverOpen: boolean[] = [];
	selectedMilestoneIndexes: number[] = new Array(3).fill(0);

	constructor(
		private apiService: ApiService,
		private walletService: WalletService,
		public dialog: MatDialog,
		public storageService: StorageService
	) {
		this.voteOptions = [
			{ code: 0, value: '' },
			{ code: 1, value: true },
			{ code: 2, value: false },
		];
	}

	ngOnInit(): void {
		this.signer = this.walletService.signer;
		this.getCampaigns();
	}

	/**
	 * The function calculates the remaining time by subtracting the latest block timestamp from a given
	 * time period.
	 * @param timePeriod - The time period is a number representing a specific duration of time.
	 * @returns the remaining time, which is calculated by subtracting the latest block timestamp from the
	 * given time period. If the remaining time is greater than 0, it is returned. Otherwise, 0 is
	 * returned.
	 */
	private async calculateRemainingTime(timePeriod) {
		try {
			const timestamp = await this.walletService.getLatestBlockTimeStamp();
			const remainingTime = Number(timePeriod) - Number(timestamp);
			return remainingTime > 0 ? remainingTime : 0;
		} catch (error) {
			console.error(error);
			return error;
		}
	}

	/**
	 * The function toggles between 3 and 4 grid columns.
	 */
	public toggleGridColumns() {
		this.gridColumns = this.gridColumns === 3 ? 4 : 3;
	}

	/**
	 * The function getCampaigns retrieves the addresses of deployed contracts and fetches the details of
	 * all campaigns if there are any.
	 */
	public async getCampaigns() {
		try {
			const campaignAddresses = await this.apiService.getDeployedContracts();
			if (campaignAddresses.length > 0) {
				await this.fetchAllCampaignDetails(campaignAddresses);
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function fetches details of multiple campaigns, calculates remaining time, progress value,
	 * milestones, and donors list, and stores the campaign details in an object and an array.
	 * @param campaignsList - An array of campaign addresses.
	 */
	private async fetchAllCampaignDetails(campaignsList) {
		try {
			for (let campaignAddress of campaignsList) {
				const params = { campaignAddress };
				const campaignDetails = await this.apiService.getCampaignDetails(params);
				const remainingDuration = await this.calculateRemainingTime(campaignDetails[1].toString());
				const progressValue = (campaignDetails[7] / 3) * 100;
				const milestones = await this.getMilestones(campaignAddress);
				const donorsList = await this.getDonorsList(campaignAddress, campaignDetails[9]);
				const campaignDetailsObj = {
					campaignAddress: campaignAddress,
					campaignOwner: campaignDetails[0],
					campaignDuration: campaignDetails[1].toString(),
					remainingDuration,
					campaignTargetAmount: `${this.walletService.convertToEther(campaignDetails[2])} ETH`,
					fundingCID: campaignDetails[3],
					noOfDonors: campaignDetails[4].toString(),
					receivedDonation: `${this.walletService.convertToEther(campaignDetails[5])} ETH`,
					hasCampaignEnded: campaignDetails[6],
					balance: `${this.walletService.convertToEther(campaignDetails[8])} ETH`,
					progressValue: progressValue.toFixed(1),
					donors: campaignDetails[9],
					milestones,
					donorsList,
				};
				this.storageService.clearStore('campaigns');
				this.storageService.addObject('campaigns', campaignDetailsObj);

				const existingIndex = this.campaignsList.findIndex((obj) => obj.campaignAddress === campaignAddress);
				if (existingIndex === -1) {
					this.campaignsList.push(campaignDetailsObj);
				} else {
					this.campaignsList[existingIndex] = campaignDetailsObj;
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function `getMilestones` retrieves milestones for a given campaign address and returns an array
	 * of milestone objects with various properties.
	 * @param campaignAddress - The `campaignAddress` parameter is the address of a campaign. It is used
	 * to fetch the milestones associated with that campaign.
	 * @returns an array of milestone objects.
	 */
	public async getMilestones(campaignAddress) {
		try {
			const milestonesList = await this.apiService.getMilestones(campaignAddress);
			let milestones = [],
				i = 0;
			for (const milestone of milestonesList) {
				const votingPeriod = milestone.milestone.votingPeriod.toString();
				const remainingVotingTime = await this.calculateRemainingTime(votingPeriod);
				let status: string;
				if (votingPeriod > 0 && milestone.milestone.status === 0) {
					status = 'Approved';
				} else if (milestone.milestone.status === 1) {
					status = 'Declined';
				} else if (milestone.milestone.status === 2) {
					status = 'Pending';
				} else {
					status = '--';
				}
				let milestonesObj = {
					label: `Milestone ${++i}`,
					milestoneCID: milestone.milestone.milestoneCID,
					approved: milestone.milestone.approved,
					votingPeriod: milestone.milestone.votingPeriod.toString(),
					remainingVotingTime,
					status,
					votes: milestone.milestone.votes,
				};
				milestones.push(milestonesObj);
			}
			return milestones;
		} catch (error) {
			console.error(error);
			return error;
		}
	}

	/**
	 * The function "getDonorsList" retrieves a list of donors for a given campaign address using an API
	 * service.
	 * @param campaignAddress - The campaignAddress parameter is the address of a campaign. It is used to
	 * identify a specific campaign for which we want to retrieve the list of donors.
	 * @param donors - The "donors" parameter is an array that contains the addresses of the donors for a
	 * specific campaign.
	 * @returns the list of donors for a campaign.
	 */
	public async getDonorsList(campaignAddress, donors) {
		try {
			const donorsList = await this.apiService.getCampaignDonors(campaignAddress, donors);
			return donorsList;
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function toggles the state of a popover at a specific index in an array.
	 * @param {number} index - The index parameter is a number that represents the position of an item in
	 * a list or array. It is used to access or manipulate specific elements in the list or array.
	 */
	openDonorsList(index: number) {
		this.isPopoverOpen[index] = !this.isPopoverOpen[index];
	}

	/**
	 * The function updates the selected milestone index for a given campaign index.
	 * @param {number} campaignIndex - The campaignIndex parameter is a number that represents the index
	 * of the campaign. It is used to identify which campaign is being selected or changed.
	 * @param {number} milestoneIndex - The `milestoneIndex` parameter is a number that represents the
	 * index of the selected milestone within a campaign.
	 */
	onTabChange(campaignIndex: number, milestoneIndex: number) {
		this.selectedMilestoneIndexes[campaignIndex] = milestoneIndex;
	}

	/**
	 * The function "viewCampaignDetails" retrieves a campaign object from storage based on its address
	 * and returns it.
	 * @param campaignAddress - The `campaignAddress` parameter is the address of a campaign. It is used
	 * to search for a specific campaign in the list of all campaigns stored in the `storageService`.
	 */
	public viewCampaignDetails(campaignAddress) {
		try {
			this.storageService.getAllObjects('campaigns', (objects) => {
				let campaign = objects.find((obj) => obj.campaignAddress == campaignAddress);
				return campaign;
			});
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function opens a modal dialog for creating a crowdfunding contract and refreshes the list of
	 * campaigns after the dialog is closed.
	 */
	openCrowdFundingContractModal(): void {
		const dialogRef = this.dialog.open(CreateCrowdfundingModalComponent, {
			width: '250px',
			hasBackdrop: true,
			disableClose: false,
			data: {},
		});

		dialogRef.afterClosed().subscribe(() => {
			this.getCampaigns();
		});
	}

	/**
	 * The `donate` function is an asynchronous function that handles making a donation to a campaign by
	 * calling an API service, converting the donation amount to wei, and displaying an alert message if
	 * the donation is successful.
	 * @param campaignAddress - The campaignAddress parameter is the address of the campaign to which the
	 * donation is being made.
	 * @param amount - The amount parameter represents the amount of donation that the user wants to make.
	 */
	async donate(campaignAddress, amount) {
		try {
			this.isLoading = true;
			let params;
			if (campaignAddress && amount) {
				params = { amount: this.walletService.convertToWei(amount), campaignAddress };
			} else {
				params = {};
			}
			const receipt = await this.apiService.makeDonation(params);
			this.isLoading = false;
			if (receipt.logs?.length > 0) {
				alert(`Donation received from ${receipt.from} to ${receipt.from} campaign!`);
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function `openCreateMilestoneModal` opens a modal dialog for creating a milestone and updates
	 * the campaigns list after the dialog is closed.
	 * @param campaignAddress - The campaignAddress parameter is the address of a campaign. It is used to
	 * identify a specific campaign in the system.
	 * @param milestoneCounter - The `milestoneCounter` parameter is a counter or identifier for the
	 * milestone. It is used to uniquely identify each milestone within a campaign.
	 */
	openCreateMilestoneModal(campaignAddress, milestoneCounter): void {
		const dialogRef = this.dialog.open(CreateMilestoneModalComponent, {
			width: '250px',
			hasBackdrop: true,
			disableClose: false,
			data: { campaignAddress, milestoneCounter },
		});

		dialogRef.afterClosed().subscribe(() => {
			this.getCampaigns();
		});
	}

	/**
	 * The function `voteOnMilestone` is an asynchronous function that handles voting on a milestone in a
	 * campaign.
	 * @param campaignAddress - The campaignAddress parameter is the address of the campaign for which the
	 * milestone is being voted on.
	 * @param voteMilestone - A boolean value indicating whether the user has voted for the milestone or
	 * not.
	 * @param milestoneCounter - The `milestoneCounter` parameter is used to specify the counter or index
	 * of the milestone in the campaign that you want to vote on. It is typically a numeric value that
	 * represents the position of the milestone in the campaign's milestones array.
	 * @returns The function does not have a return statement.
	 */
	async voteOnMilestone(campaignAddress, voteMilestone, milestoneCounter) {
		try {
			this.isLoading = true;
			let vote: Boolean;
			if (voteMilestone) {
				vote = JSON.parse(voteMilestone);
			} else {
				this.isLoading = false;
				return alert('Vote Not Selected!');
			}
			const params = {
				vote,
				campaignAddress,
				milestoneCounter,
			};
			const receipt = await this.apiService.voteOnMilestone(params);
			this.isLoading = false;
			if (receipt.logs?.length > 0) {
				alert(`Vote received from ${receipt.from} for ${receipt.from} campaign milestone!`);
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function `withdrawMilestone` is an asynchronous function that withdraws a milestone from a
	 * campaign and updates the UI accordingly.
	 * @param campaignAddress - The campaignAddress parameter is the address of the campaign from which
	 * you want to withdraw the milestone.
	 * @param milestoneCounter - The `milestoneCounter` parameter is used to specify the index or number
	 * of the milestone within a campaign. It is used to identify which milestone's funds should be
	 * withdrawn.
	 */
	async withdrawMilestone(campaignAddress, milestoneCounter) {
		try {
			this.isLoading = true;
			const params = { campaignAddress, milestoneCounter };
			const receipt = await this.apiService.withdrawMilestone(params);
			this.isLoading = false;
			if (receipt.logs?.length > 0) {
				console.log(receipt, 'receipt');
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * The function `withdrawFunds` is an asynchronous function that withdraws funds from a campaign
	 * address and updates the state accordingly.
	 * @param campaignAddress - The `campaignAddress` parameter is the address of a campaign. It is used
	 * as a parameter when calling the `withdrawFunds` function from the `apiService`.
	 */
	async withdrawFunds(campaignAddress) {
		try {
			this.isLoading = true;
			const params = { campaignAddress };
			const receipt = await this.apiService.withdrawFunds();
			this.isLoading = false;
			if (receipt.logs?.length > 0) {
				console.log(receipt, 'receipt');
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}
}
