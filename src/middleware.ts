// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

const middleware = createMiddleware(routing);

export default function (req: any) {
  return middleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
