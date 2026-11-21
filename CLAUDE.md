# home-ui-theme

The `@home/ui` Angular library: the app shell, theme CSS, shared components, the household gate
(`@home/ui/household`) and real-time updates (`@home/ui/realtime`) for the five home apps at
`home.ksl-apps.dev`. The stack lives in `~/WebstormProjects/home-server`; read its `README.md` for
the full picture.

- Workspace: `home/ui-app` (run every command there). Library source: `projects/home/ui/`. The demo
  app in `src/` reads the built library from `dist/home/ui`, so build the library first.
- Library docs: `home/ui-app/projects/home/ui/README.md`. Read the section for the part you're
  changing, and update it in the same commit.

## Consumers

Each pins a tarball in `package.json` (`file:…/home-ui-theme/home/ui-app/builds/home-ui-X.Y.Z.tgz`).
All five use the shell, the theme and the household gate; all but home-server-ui also use
`@home/ui/realtime`. A breaking change touches every one of them.

| App repo (`~/WebstormProjects/`) | Package manager |
|---|---|
| `home-server/apps/home-server-ui` | pnpm |
| `home-budget` | pnpm |
| `personal-recipe/personal-recipe` | pnpm |
| `pet-qol` | pnpm |
| `filet-crochet-grid` | npm |

## Releasing a change

1. Bump `version` in `projects/home/ui/package.json` (semver: `feat!` is a major).
2. `ng test @home/ui`, then `pnpm build:lib`. That writes `builds/home-ui-X.Y.Z.tgz`.
3. Commit and push here. Messages: `feat: …` / `fix: …` / `feat!: …`.
4. In each consumer: edit the pin, reinstall, commit `Bump @home/ui to X.Y.Z: <what changed>`, push.
   Then deploy them all from `home-server` with `make angular`.

The tarballs in `builds/` are gitignored and exist only on this machine. Every app installs from
them, so never delete or overwrite an old one: bump the version instead.
