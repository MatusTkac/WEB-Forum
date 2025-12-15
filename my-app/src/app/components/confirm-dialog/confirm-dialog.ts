import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

// Komponenta pre potvrdzovací dialog - asi hláška s Áno/Nie
@Component({
  selector: 'app-confirm-dialog',
  // importujeme Material veci na tlačidlá a dialog prvky
  imports: [ MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose],
  templateUrl: './confirm-dialog.html', // HTML šablóna pre dialog
  styleUrl: './confirm-dialog.scss', // štýly pre dialog
})
export class ConfirmDialog {
  // ref na dialog - asi pomocou toho vieme zatváať dialog a vraciať výsledok
  dialogRef = inject(MatDialogRef<ConfirmDialog>);
  // dáta z dialógu - nadpis a správa čo chceme zobraziť
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  // keď klikneme na Nie
  onNoClick() {
    // zatvárame dialog a vraciame false
    this.dialogRef.close(false);
  }
}

// trieda na uloženie dát pre dialog - asi potrebujeme nadpis a správu
export class ConfirmDialogData {
  constructor(
    public title: string, // nadpis dialógu
    public message: string // správa čo sa má zobraziť
  ){}
}