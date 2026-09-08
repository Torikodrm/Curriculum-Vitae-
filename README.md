# Arian Rohe CV

An App Router portfolio built with Next.js, Bun, Tailwind CSS, GSAP, Lenis, and React Three Fiber.

## Setup

```bash
bun create next-app@latest awesome-cv --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun --yes
cd awesome-cv
bun add @react-three/drei @react-three/fiber @types/three gsap lenis three
bun install
cp .env.example .env.local
bun run dev
```

## Scripts

- `bun run dev` starts development
- `bun run lint` runs ESLint
- `bun run build` creates a production build
- `bun run start` serves the production build

## Avatar configuration

Set `NEXT_PUBLIC_AVATAR_GENDER` to `male` or `female`. Any other or missing value falls back safely to `male`.

Optional models must be named exactly `public/models/avatar-male.glb` and `public/models/avatar-female.glb`. Supply self-contained GLB files centered at the origin, facing positive Z, upright on the XZ ground plane, and at a roughly human scale. A procedural low-poly avatar is shown if model files are absent or fail to load.

## Profile configuration

The profile uses `NEXT_PUBLIC_PROFILE_FIRST_NAME`, `NEXT_PUBLIC_PROFILE_LAST_NAME`, `NEXT_PUBLIC_PROFILE_ROLE`, `NEXT_PUBLIC_PROFILE_EMAIL`, `NEXT_PUBLIC_PROFILE_INTRO`, `NEXT_PUBLIC_PROFILE_AVAILABILITY`, and `NEXT_PUBLIC_PROFILE_YEAR`. These `NEXT_PUBLIC_*` values are inlined when compiling, so restart `bun run dev` after editing `.env.local` and rebuild for production.

When GLB files are unavailable, the procedural fallback still respects the configured avatar gender.
