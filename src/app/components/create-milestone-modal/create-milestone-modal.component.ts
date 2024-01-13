import { Component, Inject } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WalletService } from 'src/app/services/wallet.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
	public milestoneForm: FormGroup;
	isLoading = false;

	constructor(
		private apiService: ApiService,
		public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public campaignAddress,
		@Inject(MAT_DIALOG_DATA) public milestoneCounter,
		private walletService: WalletService,
		private formBuilder: FormBuilder
	) {
		this.milestoneForm = this.formBuilder.group({
			milestoneCID: ['', Validators.required],
			votingPeriod: ['', [Validators.required, Validators.min(1)]],
		});
	}

	/**
	 * The `onSubmit` function is an asynchronous function that handles the submission of a milestone
	 * form, validates the form, retrieves the latest block timestamp, calculates the voting period,
	 * creates a new milestone with the provided parameters, logs the receipt, displays an alert if the
	 * milestone is created successfully, and closes the dialog.
	 */
	async onSubmit() {
		try {
			if (this.milestoneForm.valid) {
				this.isLoading = true;
				const timestamp = await this.walletService.getLatestBlockTimeStamp();
				const votingPeriod = Number(this.formData.votingPeriod) + timestamp;
				let params = {
					milestoneCID: this.formData.milestoneCID,
					votingPeriod,
					campaignAddress: this.campaignAddress.campaignAddress,
					milestoneCounter: this.milestoneCounter.milestoneCounter,
				};
				const receipt = await this.apiService.createNewMilestone(params);
				console.log('🚀 ~ create milestone receipt:', receipt);
				this.isLoading = false;
				if (receipt) {
					alert(`Created a new milestone!`);
				}
				this.closeDialog();
			} else {
				console.log('Milestone Form is invalid');
			}
		} catch (error) {
			this.isLoading = false;
			console.error(error);
		}
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}
}
