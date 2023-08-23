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

	public toggleGridColumns() {
		this.gridColumns = this.gridColumns === 3 ? 4 : 3;
	}

	public async getCampaigns() {
		try {
			const campaignAddresses = await this.apiService.getDeployedContracts();
			await this.fetchAllCampaignDetails(campaignAddresses);
		} catch (error) {
			console.error(error);
		}
	}

	private async fetchAllCampaignDetails(campaignsList) {
		try {
			for (let campaignAddress of campaignsList) {
				const params = { campaignAddress };
				const campaignDetails = await this.apiService.getCampaignDetails(params);
				const votingPeriod = campaignDetails[6][2].toString();
				let status: string;
				if (votingPeriod > 0 && campaignDetails[6][3] === 0) {
					status = 'Approved';
				} else if (campaignDetails[6][3] === 1) {
					status = 'Declined';
				} else if (campaignDetails[6][3] === 2) {
					status = 'Pending';
				} else {
					status = '--';
				}
				console.log(campaignDetails[8]);
				const progressValue = (campaignDetails[8] / 3) * 100;
				const campaignDetailsObj = {
					campaignAddress: campaignAddress,
					campaignOwner: campaignDetails[0],
					campaignDuration: campaignDetails[1].toString(),
					campaignTargetAmount: `${this.walletService.convertToEther(campaignDetails[2])} ETH`,
					fundingCID: campaignDetails[3],
					noOfDonors: campaignDetails[4].toString(),
					receivedDonation: `${this.walletService.convertToEther(campaignDetails[5])} ETH`,
					currentMilestone: {
						milestoneCID: campaignDetails[6][0],
						approved: campaignDetails[6][1] ? 'Yes' : 'No',
						votingPeriod: campaignDetails[6][2].toString(),
						votes: campaignDetails[6][4].length,
						status,
					},
					hasCampaignEnded: campaignDetails[7],
					balance: `${this.walletService.convertToEther(campaignDetails[9])} ETH`,
					progressValue: progressValue.toFixed(1),
				};
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

		dialogRef.afterClosed().subscribe((result) => {
			this.getCampaigns();
			console.log('The dialog was closed', result);
		});
	}

	async donate(campaignAddress, amount) {
		try {
			this.isLoading = true;
			const params = { amount: this.walletService.convertToWei(amount), campaignAddress };
			const receipt = await this.apiService.makeDonation(params);
			this.isLoading = false;
			if (receipt.logs.length > 0) {
				alert(`Donation received from ${receipt.from} to ${receipt.from} campaign!`);
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}

	openCreateMilestoneModal(campaignAddress): void {
		const dialogRef = this.dialog.open(CreateMilestoneModalComponent, {
			width: '250px',
			hasBackdrop: true,
			disableClose: false,
			data: { campaignAddress },
		});

		dialogRef.afterClosed().subscribe((result) => {
			this.getCampaigns();
			console.log('The dialog was closed', result);
		});
	}

	async voteOnMilestone(campaignAddress, voteMilestone) {
		try {
			this.isLoading = true;
			const params = { vote: voteMilestone, campaignAddress };
			const receipt = await this.apiService.voteOnMilestone(params);
			this.isLoading = false;
			if (receipt.logs.length > 0) {
				alert(`Vote received from ${receipt.from} for ${receipt.from} campaign milestone!`);
				this.getCampaigns();
			}
		} catch (error) {
			console.error(error);
		}
	}
	
	async withdrawMilestone(campaignAddress) {
		try {
			this.isLoading = true;
			const params = { campaignAddress };
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
