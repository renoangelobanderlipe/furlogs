@AGENTS.md

## FurLog Frontend — Next.js 16.2.0

**MCP first:** Query `nextjs` and `mui` MCP servers before writing any framework code.

### Stack

- Next.js 16.2.0 with App Router + Turbopack
- React 19 + React Compiler (enabled via `babel-plugin-react-compiler`)
- MUI 7.3.9 + Emotion
- Biome 2.2 (lint + format)
- TanStack Query v5, Zustand, Axios, Zod, React Hook Form
- Sonner (toasts)

### Key Patterns

**Proxy (replaces middleware in Next.js 16):**

```ts
// proxy.ts at apps/web/ root
export function proxy(request: NextRequest) { ... }
export const config = { matcher: [...] };
```

**Theme:**

```ts
import { darkTheme, lightTheme } from "@/theme";
// Theme files: theme/palette.ts, theme/typography.ts, theme/components.ts, theme/index.ts
// Dark = default, toggle via useThemeStore
```

**Providers:**
- `ThemeProvider` — wraps MUI + reads from `useThemeStore`
- `QueryProvider` — TanStack Query client

**API client:**

```ts
import { apiClient } from "@/lib/api/client";
// Always withCredentials + withXSRFToken true
// 401 → redirect to /login (interceptor)
```

**Auth store:**

```ts
import { useAuthStore } from "@/stores/useAuthStore";
const { user, fetchUser, logout } = useAuthStore();
```

**Forms:**

```ts
const { register, handleSubmit, formState } = useForm<T>({
  resolver: zodResolver(schema),
});
```

### Route Groups

- `app/(auth)/` — Auth pages (login, register, forgot-password, verify-email)
- `app/(dashboard)/` — Protected app pages (add as feature grows)
- `app/(onboarding)/` — Onboarding wizard (create household)

### Path Alias

`@/*` → `apps/web/*`

### Biome

```bash
bun run lint     # biome check
bun run format   # biome format --write
```
