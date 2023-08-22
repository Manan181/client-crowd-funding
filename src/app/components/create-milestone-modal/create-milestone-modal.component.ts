import { Component, Inject } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-create-milestone-modal',
	templateUrl: './create-milestone-modal.component.html',
	styleUrls: ['./create-milestone-modal.component.css'],
})
export class CreateMilestoneModalComponent {
  
	public formData = {
		milestoneCID: 'QmVRyzazgw98tG54hPYaJsC8ssBguUjrK4cmKLqQ8fKmHw',
		votingPeriod: '1'
	};
	isLoading = false;

	constructor(private apiService: ApiService, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) 
   public campaignAddress) {}

	async onSubmit() {    
		let params = {
			milestoneCID: this.formData.milestoneCID,
			votingPeriod: this.formData.votingPeriod,
			campaignAddress: this.campaignAddress.campaignAddress
		};
		this.isLoading = true;
		const receipt = await this.apiService.createNewMilestone(params);
		console.log('🚀 ~ file: create-milestone-modal.component.ts:26 ~ CreateMilestoneModalComponent ~ onSubmit ~ receipt:', receipt);
		this.isLoading = false;
		this.closeDialog();
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}
}
