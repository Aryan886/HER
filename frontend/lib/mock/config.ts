export const DEMO_CONFIG = {
  credentials: {
    email: "demo@her.app",
    password: "HER2024",
  },
  user: {
    id:
      process.env.NEXT_PUBLIC_DEMO_USER_ID ||
      "00000000-0000-0000-0000-000000000001",
    name: "Priya Sharma",
    email: "demo@her.app",
    createdAt: "2024-01-15T10:00:00Z",
  },
} as const;

export type DemoUser = typeof DEMO_CONFIG.user;
