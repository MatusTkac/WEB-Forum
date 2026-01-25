import { inject, Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

// Message Service - shows pop-up notifications to users
// Uses Material Design Snackbar for displaying messages
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // MatSnackBar - Material component for toast notifications
  private snackBar = inject(MatSnackBar);

  // Show error message - appears as red toast notification
  // msg: the error text to display
  // duration: how long to show (in milliseconds, default 3 seconds)
  public printError(msg: string, duration = 3000) {
    this.snackBar.open(msg, 'ERROR', {
      duration,
      panelClass: 'errorbutton'
    });
  }

  // Show info message - appears as normal toast notification
  // msg: the info text to display
  // duration: how long to show (in milliseconds, default 3 seconds)
  public printInfo(msg: string, duration = 3000) {
    this.snackBar.open(msg, 'INFO', {
      duration
    });    
  }

}
