import { seedZedereDemoSession } from "./app/core/mock/zedere-demo-auth.util";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

seedZedereDemoSession();

platformBrowserDynamic().bootstrapModule(AppModule).catch((err) => console.error(err));
