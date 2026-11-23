# Local Firebase Emulator Suite (`@mono-magic/data-access-ts-firebase`)

Self-contained Dockerized Firebase Emulator Suite configured for project `demo-mono-magic` (`demo-*` prefix enables offline zero-cloud mode in `firebase-tools`).

## Emulated Services & Ports

| Service | Host Port | Environment Variable |
| --- | --- | --- |
| Emulator Suite UI | `http://localhost:4000` | — |
| Cloud Firestore | `localhost:8080` | `FIRESTORE_EMULATOR_HOST=localhost:8080` |
| Realtime Database (RTDB) | `localhost:9000` | `FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000` |
| Firebase Authentication | `localhost:9099` | `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099` |
| Cloud Storage | `localhost:9199` | `FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199` |

## Nx Commands

```bash
# Start the Firebase Emulator Suite container
pnpm nx emulator-up data-access-ts-firebase

# Run integration tests against the emulator suite
pnpm nx test-integration data-access-ts-firebase

# Stop and remove the emulator container
pnpm nx emulator-down data-access-ts-firebase
```
