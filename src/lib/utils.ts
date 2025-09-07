import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a username for use in URLs by replacing spaces with underscores
 * @param username - The username to normalize
 * @returns The normalized username safe for URLs
 */
export function normalizeUsernameForUrl(username: string): string {
  return username.replace(/ /g, '_')
}

/**
 * Denormalizes a username from URL format by replacing underscores with spaces
 * @param urlUsername - The username from URL (with underscores)
 * @returns The denormalized username with spaces
 */
export function denormalizeUsernameFromUrl(urlUsername: string): string {
  return urlUsername.replace(/_/g, ' ')
}
