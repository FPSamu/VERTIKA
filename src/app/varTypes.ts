export const ActivityType = {
  HIKING: "hiking",
  ALPINISMO: "alpinismo",
  TRAIL: "trail",
  ESCALADA: "escalada",
} as const;

export const DifficultyType = {
  FACIL: "fácil",
  MEDIO: "medio",
  DIFICIL: "difícil",
} as const;

export const CurrencyType = {
  MXN: "MXN",
  USD: "USD",
} as const;

export const StatusType = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  EXPIRED: "expired",
  CONFIRMED: "confirmed",
  PENDING: "pending",
  PROGRESS: "progress"
} as const;

export type UserType = 'customer' | 'guide'