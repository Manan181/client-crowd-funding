import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('walletIdElement') walletIdElement: ElementRef;
	public walletConnected = false;
	walletId = '';
	connectedAccountSubscription: Subscription;

	constructor(private walletService: WalletService, private ngZone: NgZone) {}

	ngOnInit(): void {
		this.checkWalletConnected();
	}

	ngAfterViewInit(): void {
		this.subscribeToSelectedAccount();
	}

	ngOnDestroy(): void {
		this.unsubscribeConnectedAccount();
	}

	private checkWalletConnected(): void {
		this.walletService.checkWalletConnected();
	}

	private subscribeToSelectedAccount(): void {
		this.connectedAccountSubscription = this.walletService.selectedAccount.subscribe((account) => {
			console.log(
				'🚀 ~ file: nav.component.ts:39 ~ NavComponent ~ this.connectedAccountSubscription=this.walletService.selectedAccount.subscribe ~ account:',
				account
			);
			this.ngZone.run(() => {
				if (account) {
					setTimeout(() => {
						this.updateWalletInfo(account);
					});
				} else {
					this.walletConnected = false;
				}
			});
		});
	}

	private updateWalletInfo(account: string): void {
		if (this.walletIdElement) {
			this.walletId = account;
			this.walletConnected = true;
		}
	}

	connectToWallet(): void {
		this.walletService.connectWallet();
	}

	private unsubscribeConnectedAccount(): void {
		if (this.connectedAccountSubscription) {
			this.connectedAccountSubscription.unsubscribe();
		}
	}
}
