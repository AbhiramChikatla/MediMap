// Clerk authentication configuration
import { dark } from "@clerk/themes";

export const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Clerk appearance configuration
export const clerkAppearance = {
  baseTheme: dark,
  elements: {
    formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
    card: "bg-white dark:bg-gray-900 shadow-md rounded-lg",
    headerTitle: "text-blue-600 font-bold",
    headerSubtitle: "text-gray-600 dark:text-gray-300",
  },
};