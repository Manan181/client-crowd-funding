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
	public walletConnectConnected = false;
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

	/**
	 * The function "checkWalletConnected" calls the "checkWalletConnected" method of the "walletService"
	 * object.
	 */
	private checkWalletConnected(): void {
		this.walletService.checkWalletConnected();
	}

	/**
	 * The function "subscribeToSelectedAccount" subscribes to changes in the selected account and updates
	 * the wallet information accordingly.
	 */
	private subscribeToSelectedAccount(): void {
		this.connectedAccountSubscription = this.walletService.selectedAccount.subscribe((account) => {
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

	/**
	 * The function updates the wallet information by setting the wallet ID and indicating that the wallet
	 * is connected.
	 * @param {string} account - The account parameter is a string that represents the wallet account.
	 */
	private updateWalletInfo(account: string): void {
		if (this.walletIdElement) {
			this.walletId = account;
			this.walletConnected = true;
		}
	}

	/**
	 * The function "connectToWallet" calls the "connectWallet" function from the "walletService" object.
	 */
	connectToWallet(): void {
		this.walletService.connectWallet();
	}

	/**
	 * The function "unsubscribeConnectedAccount" checks if there is a subscription to a connected account
	 * and unsubscribes from it if it exists.
	 */
	private unsubscribeConnectedAccount(): void {
		if (this.connectedAccountSubscription) {
			this.connectedAccountSubscription.unsubscribe();
		}
	}
}
