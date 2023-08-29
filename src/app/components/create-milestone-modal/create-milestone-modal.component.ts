import { Component, Inject } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
	selector: 'app-create-milestone-modal',
	templateUrl: './create-milestone-modal.component.html',
	styleUrls: ['./create-milestone-modal.component.css'],
})
export class CreateMilestoneModalComponent {
	public formData = {
		milestoneCID: '',
		votingPeriod: '',
	};
	isLoading = false;

	constructor(
		private apiService: ApiService,
		public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public campaignAddress,
		@Inject(MAT_DIALOG_DATA) public milestoneCounter,
		private walletService: WalletService
	) {}

	async onSubmit() {
		const timestamp = await this.walletService.getLatestBlockTimeStamp();
		const votingPeriod = Number(this.formData.votingPeriod) + timestamp;		
		let params = {
			milestoneCID: this.formData.milestoneCID,
			votingPeriod,
			campaignAddress: this.campaignAddress.campaignAddress,
			milestoneCounter: this.milestoneCounter.milestoneCounter,
		};
		this.isLoading = true;
		const receipt = await this.apiService.createNewMilestone(params);
		console.log('🚀 ~ create milestone receipt:', receipt);
		this.isLoading = false;
		this.closeDialog();
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}
}
