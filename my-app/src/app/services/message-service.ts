import { inject, Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private snackBar = inject(MatSnackBar);

  public printError(msg: string, duration = 3000) {
    this.snackBar.open(msg, 'ERROR', {
      duration,
      panelClass: 'errorbutton'
    });
  }

  public printInfo(msg: string, duration = 3000) {
    this.snackBar.open(msg, 'INFO', {
      duration
    });    
  }

}
