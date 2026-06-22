import { Provider } from "@angular/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";

import { ZedereMockApiInterceptor } from "./zedere-mock-api.interceptor";

/**
 * เพิ่มใน providers ของ AppModule หรือ provider กลาง:
 *
 * providers: [
 *   ...ZEDERE_DEMO_MODE_PROVIDERS,
 * ]
 */
export const ZEDERE_DEMO_MODE_PROVIDERS: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ZedereMockApiInterceptor,
    multi: true,
  },
];
