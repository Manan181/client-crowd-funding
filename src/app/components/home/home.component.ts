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

	public toggleGridColumns() {
		this.gridColumns = this.gridColumns === 3 ? 4 : 3;
	}

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

	public async getDonorsList(campaignAddress, donors) {
		try {
			const donorsList = await this.apiService.getCampaignDonors(campaignAddress, donors);
			return donorsList;
		} catch (error) {
			console.error(error);
		}
	}

	openDonorsList(index: number) {
		this.isPopoverOpen[index] = !this.isPopoverOpen[index];
	}

	onTabChange(campaignIndex: number, milestoneIndex: number) {
		this.selectedMilestoneIndexes[campaignIndex] = milestoneIndex;
	}

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
