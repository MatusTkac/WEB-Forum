import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Application Configuration - sets up core Angular features
// This configures routing, HTTP, animations, and Material components
export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handling
    provideBrowserGlobalErrorListeners(),
    // Enable routing (navigation between pages)
    provideRouter(routes),
    // Enable HTTP client for server communication
    provideHttpClient(withFetch()),
    // Enable animations for Material components
    provideAnimations(),
    // Import Material Snackbar for toast notifications
    importProvidersFrom(MatSnackBarModule),
    // Enable server-side rendering optimization
    provideClientHydration(withEventReplay())
  ]
};