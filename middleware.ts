import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Verifikasi route publik vs terlindungi
  if (!isPublicRoute(req)) {
    const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
    // Jika key live terpasang, panggil proteksi auth Clerk
    if (pubKey.startsWith("pk_live_")) {
      await auth.protect();
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
