import { clerkMiddleware } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Get authentication state
  const { userId } = await auth();
  
  // Define public routes
  const isPublicRoute = req.nextUrl.pathname === "/" || 
                       req.nextUrl.pathname.startsWith("/api");
  
  // Handle users who aren't authenticated
  if (!userId && !isPublicRoute) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  // Redirect users to the dashboard after successful login if they're on the home page
  if (userId && req.nextUrl.pathname === "/") {
    // Check if there's a query parameter indicating they should proceed to dashboard
    if (req.nextUrl.searchParams.get("proceed") === "true") {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Allow users to access the dashboard and app routes only if they're authenticated
  if (userId && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/app"))) {
    return NextResponse.next();
  }

  // Allow users to continue to the landing page
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};