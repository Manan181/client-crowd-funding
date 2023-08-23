import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { WalletService } from './services/wallet.service';
import { ApiService } from './services/api.service';
import { StorageService } from './services/storage.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CreateCrowdfundingModalComponent } from './components/create-crowdfunding-modal/create-crowdfunding-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatCardModule } from "@angular/material/card";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { FlexLayoutModule } from "@angular/flex-layout";
import { LoadingComponent } from './components/loading/loading.component';
import { CreateMilestoneModalComponent } from './components/create-milestone-modal/create-milestone-modal.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
	declarations: [AppComponent, HomeComponent, NavComponent, CreateCrowdfundingModalComponent, LoadingComponent, CreateMilestoneModalComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		BrowserAnimationsModule,
		MatCardModule,
		MatToolbarModule,
		MatButtonModule,
		MatMenuModule,
		MatIconModule,
		MatDividerModule,
		FlexLayoutModule,
		MatProgressBarModule,
	],
	providers: [HttpClient, ApiService, WalletService, StorageService],
	bootstrap: [AppComponent],
	exports: [MatDialogModule],
})
export class AppModule {}
