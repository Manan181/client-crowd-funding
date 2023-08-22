import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ethers } from 'ethers';
import { MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-create-crowdfunding-modal',
	templateUrl: './create-crowdfunding-modal.component.html',
	styleUrls: ['./create-crowdfunding-modal.component.css'],
})
export class CreateCrowdfundingModalComponent {
	public formData = {
		fundingCID: 'QmVRyzazgw98tG54hPYaJsC8ssBguUjrK4cmKLqQ8fKmHw',
		amountToRaise: '1',
		value: '0.001',
		duration: 600,
	};
	signer: any;
	ethereum = window['ethereum'];
	isLoading = false;

	constructor(private apiService: ApiService, public dialog: MatDialog) {}

	async onSubmit() {
		const provider = new ethers.providers.Web3Provider(window['ethereum']);
		const signer = provider.getSigner();
		let params = {
			fundingCID: this.formData.fundingCID,
			amountToRaise: ethers.utils.parseEther(this.formData.amountToRaise),
			value: ethers.utils.parseEther(this.formData.value),
			duration: this.formData.duration,
			signer,
		};
		this.isLoading = true;
		const receipt = await this.apiService.createCrowdFundingContract(params);
		this.isLoading = false;
		console.log('🚀 ~ file: create-crowdfunding-modal.component.ts:36 ~ CreateCrowdfundingModalComponent ~ onSubmit ~ receipt:', receipt);
		if (receipt) {
			alert(`Created a new campaign with address ${receipt.logs[0].address}!`);
		}
		this.closeDialog();
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}
}
