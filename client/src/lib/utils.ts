import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

// Combine class names with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date using date-fns
export function formatDate(date: Date | string, formatStr: string = "PP") {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return format(parsedDate, formatStr);
}

// Format a date as a relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return formatDistance(parsedDate, new Date(), { addSuffix: true });
}

// Helper to truncate text
export function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Map status to display text and colors
export const statusConfig = {
  open: {
    label: "Open",
    bgColor: "bg-neutral-100",
    textColor: "text-neutral-800",
  },
  in_progress: {
    label: "In Progress",
    bgColor: "bg-primary bg-opacity-10",
    textColor: "text-primary",
  },
  on_hold: {
    label: "On Hold",
    bgColor: "bg-warning bg-opacity-10",
    textColor: "text-warning",
  },
  resolved: {
    label: "Resolved",
    bgColor: "bg-secondary bg-opacity-10",
    textColor: "text-secondary",
  },
  closed: {
    label: "Closed",
    bgColor: "bg-neutral-400 bg-opacity-10",
    textColor: "text-neutral-600",
  },
};

// Map priority to display text and colors
export const priorityConfig = {
  low: {
    label: "Low",
    bgColor: "bg-neutral-100",
    textColor: "text-neutral-800",
  },
  medium: {
    label: "Medium",
    bgColor: "bg-neutral-100",
    textColor: "text-neutral-800",
  },
  high: {
    label: "High",
    bgColor: "bg-warning bg-opacity-10",
    textColor: "text-warning",
  },
  critical: {
    label: "Critical",
    bgColor: "bg-danger bg-opacity-10",
    textColor: "text-danger",
  },
};

// Format a ticket number to be more readable
export function formatTicketNumber(ticketNumber: string) {
  return ticketNumber;
}

// Generate dummy avatar URL if no avatar is provided
export function getAvatarUrl(avatarUrl: string | null) {
  return avatarUrl || 'https://ui-avatars.com/api/?background=random';
}
