import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ethers } from 'ethers';
import { MatDialog } from '@angular/material/dialog';
import { WalletService } from 'src/app/services/wallet.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-create-crowdfunding-modal',
	templateUrl: './create-crowdfunding-modal.component.html',
	styleUrls: ['./create-crowdfunding-modal.component.css'],
})
export class CreateCrowdfundingModalComponent {
	public formData = {
		fundingCID: '',
		amountToRaise: '',
		value: '0.001',
		duration: 0,
	};
	public crowdfundingForm: FormGroup;
	signer: any;
	ethereum = window['ethereum'];
	isLoading = false;

	static greaterThanZero(control: AbstractControl): { [key: string]: boolean } | null {
		if (control.value <= 0) {
			return { greaterThanZero: true };
		}
		return null;
	}
	
	constructor(private apiService: ApiService, public dialog: MatDialog, private walletService: WalletService, private formBuilder: FormBuilder) {
		this.crowdfundingForm = this.formBuilder.group({
			fundingCID: ['', Validators.required],
			amountToRaise: ['', [Validators.required, CreateCrowdfundingModalComponent.greaterThanZero]],
			value: ['', [Validators.required, Validators.min(0.001)]],
			duration: ['', [Validators.required, Validators.min(1)]],
		});
	}

	async onSubmit() {
		if (this.crowdfundingForm.valid) {
			this.isLoading = true;
			const provider = new ethers.providers.Web3Provider(window['ethereum']);
			const signer = provider.getSigner();
			let params = {
				fundingCID: this.crowdfundingForm.controls['fundingCID'].value,
				amountToRaise: ethers.utils.parseEther(this.crowdfundingForm.controls['amountToRaise'].value),
				value: ethers.utils.parseEther(this.crowdfundingForm.controls['value'].value),
				duration: this.crowdfundingForm.controls['duration'].value,
				signer,
			};
			const receipt = await this.apiService.createCrowdFundingContract(params);
			this.isLoading = false;
			console.log('🚀 onSubmit ~ receipt:', receipt);
			if (receipt) {
				alert(`Created a new campaign with address ${receipt.logs[0].address}!`);
			}
			this.closeDialog();
		} else {
			console.log('Form is invalid');
		}
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}
}
