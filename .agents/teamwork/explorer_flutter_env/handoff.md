# Flutter Environment Survey Handoff Report (`libs/ui/fl-mat`)

**Summary**: `libs/ui/fl-mat` targets Dart SDK `^3.14.0` and Flutter `3.50.0` (CI default & `.metadata` revision). No Flutter or Dart SDK is currently installed in this container, `/home/antigravity` has `17G` free disk space with `.local` writable, and `https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json` + `https://pub.dev` are reachable—so a Worker can cleanly install Flutter `3.50.0` (~1.52 GB `.tar.xz`) into `/home/antigravity/.local/flutter`.

---

## 1. Observation

### A. Project & CI Configuration (`libs/ui/fl-mat` & `.github/`)

1. **`libs/ui/fl-mat/pubspec.yaml`** (lines 1–19):
   - Package `fl_mat`, version `0.0.1`.
   - SDK constraints (lines 6–8):
     ```yaml
     environment:
       sdk: ^3.14.0
       flutter: ">=1.17.0"
     ```
   - Dependencies (lines 10–18):
     - `flutter` (sdk: flutter)
     - `widgetbook: ^3.25.0`
     - `dev_dependencies`: `flutter_test` (sdk: flutter), `flutter_lints: ^6.0.0`
   - Note: `libs/ui/fl-mat/pubspec.lock` does not exist (ignored via `libs/ui/fl-mat/.gitignore:26`).

2. **`libs/ui/fl-mat/.metadata`** (lines 6–10):
   ```yaml
   version:
     revision: "ab2912035e160d9cad6306df307576da6128ebdb"
     channel: "stable"
   project_type: package
   ```
   Revision `ab2912035e160d9cad6306df307576da6128ebdb` corresponds exactly to Flutter `3.50.0` (`stable`).

3. **`libs/ui/fl-mat/project.json`** (lines 7–39) & `pnpm nx show project fl-mat --json`:
   - `lint`: `flutter analyze` (cwd `libs/ui/fl-mat`, `cache: true`)
   - `test`: `flutter test` (cwd `libs/ui/fl-mat`, `cache: true`, `dependsOn: ["^build"]`)
   - `widgetbook`: `flutter run -d chrome -t lib/widgetbook.dart` (cwd `libs/ui/fl-mat`)
   - `build-widgetbook`: `flutter build web --release -t lib/widgetbook.dart` (cwd `libs/ui/fl-mat`, `outputs: ["{projectRoot}/build/web"]`)

4. **`libs/ui/fl-mat/analysis_options.yaml`** (lines 1–14):
   - Includes `package:flutter_lints/flutter.yaml`.
   - Sets `analyzer.errors.deprecated_member_use: ignore` and excludes `build/**`, `android/**`, `ios/**`, `web/**`, `windows/**`, `macos/**`, `linux/**`.

5. **`.github/workflows/ci.yml`** (lines 20–24):
   - Calls `./.github/actions/setup-pnpm` then `./.github/actions/setup-flutter` (no inputs overridden), then runs `pnpm nx affected -t lint test build`.

6. **`.github/workflows/storybook-gh-pages.yml`** (lines 47–53):
   - For `matrix.type == 'widgetbook'`, calls `./.github/actions/setup-flutter` (no inputs overridden), then runs `node tools/ci/storybook-pages.mjs build "${{ matrix.name }}"`.

7. **`.github/actions/setup-flutter/action.yml`** (lines 4–30):
   - Inputs default to `flutter-version: '3.50.0'` (line 8) and `channel: 'stable'` (line 12).
   - Uses `subosito/flutter-action@v2` with `cache: true`.
   - Runs `flutter pub get` in every directory under `apps` and `libs` containing `pubspec.yaml` (currently only `libs/ui/fl-mat/pubspec.yaml`).

### B. Local Environment, SDK Availability, and Disk Space

- **OS / Architecture**: `Linux sandbox 6.12.105+ #1 SMP Sat Sep 19 19:37:41 UTC 2026 x86_64 GNU/Linux`
- **User**: `uid=1000(antigravity) gid=1000(antigravity) groups=1000(antigravity)`
- **PATH & Env**:
  - `PATH=/tmp/exebox-escape-3707785024/exeboxtools:/opt/antigravity/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`
  - `which flutter` -> exit 1 (`no flutter in PATH`)
  - `which dart` -> exit 1 (`no dart in PATH`)
  - No `FLUTTER_ROOT`, `PUB_CACHE`, or Dart/Flutter env vars set in `env`.
- **Filesystem search** (`find /opt /usr /home /var -maxdepth 4 \( -name "flutter" -o -name "dart" \) 2>/dev/null`):
  - Returned 0 matches (exit code 1 only due to `/root` being `drwx------ nobody nogroup`, permission denied).
  - `/home/antigravity/.local` exists (`drwxrwxrwx`), contains `share/` and `state/`, no `bin/` or `flutter/` yet, and is writable by `antigravity`.
  - `/home/antigravity/.profile` already adds `$HOME/.local/bin` to `PATH` when that directory exists, though non-login shells inherit the container `PATH` unless explicitly exported or invoked by full path.
- **Available Tools**:
  - `/usr/bin/xz`, `/usr/bin/tar`, `/usr/bin/curl`, `/usr/bin/git`, `/usr/bin/unzip` are all present.
- **Disk Space (`df -h`)**:
  - `/dev/vdb` mounted at `/home/antigravity`: `Size 19G`, `Used 2.1G`, `Avail 17G`, `Use% 11%`.
  - `/` (`3.9G` avail), `/app` & `/mnt` (`42G` avail on `overlay`), `/opt` (`17G` avail on `overlay`).

### C. Reachability & Linux Release Metadata

- **Network reachability**:
  - `https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json` returned HTTP 200 JSON (via container proxy `http://127.0.0.1:45003`).
  - `https://pub.dev` returned `HTTP/2 200`.
- **Base URL**: `https://storage.googleapis.com/flutter_infra_release/releases`
- **Available Matching Releases** (`channel: stable`, `dart_sdk_arch: x64`):
  - **`3.50.0`** (matches `.github/actions/setup-flutter/action.yml` and `libs/ui/fl-mat/.metadata`):
    - `hash`: `ab2912035e160d9cad6306df307576da6128ebdb`
    - `dart_sdk_version`: `3.14.0`
    - `release_date`: `2026-11-11T19:05:47.758707Z`
    - `archive`: `stable/linux/flutter_linux_3.50.0-stable.tar.xz`
    - Full URL: `https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.0-stable.tar.xz`
    - `content-length`: `1517633656` bytes (~1.41 GiB / ~1.52 GB)
    - `sha256`: `6ea2d806fd57269ae783e6788e2a81fc26eaad782f1e0d0ff38623bb765ff9f5`
  - **`3.50.1`** (current `stable` tip):
    - `hash`: `ae9b586f34a8443573f82ef57c3bf914a908cbf7`
    - `dart_sdk_version`: `3.14.0`
    - `release_date`: `2026-11-20T00:24:27.186534Z`
    - `archive`: `stable/linux/flutter_linux_3.50.1-stable.tar.xz`
    - Full URL: `https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.1-stable.tar.xz`
    - `content-length`: `1518418752` bytes (~1.41 GiB / ~1.52 GB)
    - `sha256`: `4ad17fc8462fbcef2ba19ff4a78c0a16b7147fde1add8578e267ea62cdb92678`
  - Earlier stable releases (`3.47.x` -> Dart `3.13.x`, `3.44.x` -> Dart `3.12.x`, `3.41.x` -> Dart `3.11.x`) do **not** satisfy `sdk: ^3.14.0` in `libs/ui/fl-mat/pubspec.yaml:7`.

---

## 2. Logic Chain

1. From `libs/ui/fl-mat/pubspec.yaml:7`, `fl-mat` strictly requires Dart SDK `^3.14.0`, which eliminates any Flutter release older than `3.50.0` (since `3.47.9` ships Dart `3.13.7`).
2. Both `.github/actions/setup-flutter/action.yml:8` and `libs/ui/fl-mat/.metadata:7` pin/reference Flutter `3.50.0` (`ab2912035e160d9cad6306df307576da6128ebdb`, Dart `3.14.0`). `3.50.1` also ships Dart `3.14.0`, so `3.50.0` provides exact CI parity while `3.50.1` is the latest stable patch.
3. Local checks (`which`, `find`, `env`) confirm neither `flutter` nor `dart` is pre-installed anywhere accessible in the sandbox.
4. Installing into `/home/antigravity/.local/flutter` is feasible and safe:
   - `/home/antigravity/.local` is writable by `antigravity` (`uid=1000`) and outside the git repo `/home/antigravity/sukrutsathaye/mono-magic`.
   - `/home/antigravity` has `17G` available on `/dev/vdb`. Downloading the `~1.52 GB` `.tar.xz`, extracting (`~3–4 GB` uncompressed), plus pub/build caches (`~1–2 GB`) requires roughly `5–7 GB` total (or `~3.5–5 GB` if removing the tarball after extraction), fitting comfortably within `17G` free.
   - `curl`, `xz`, `tar`, `git`, and network access to both `storage.googleapis.com` and `pub.dev` are verified working.
5. **Important PATH note for Nx**: `libs/ui/fl-mat/project.json` runs bare `flutter analyze`, `flutter test`, and `flutter build web --release -t lib/widgetbook.dart` via `nx:run-commands`. Because non-interactive bash subshells in this container do not automatically add `/home/antigravity/.local/flutter/bin` to `PATH`, a Worker installing Flutter to `/home/antigravity/.local/flutter` must either:
   - Prefix commands with `PATH="/home/antigravity/.local/flutter/bin:$PATH" pnpm nx ...`, or
   - Symlink `flutter` and `dart` into `/home/antigravity/.local/bin` **and** export `PATH` in `/home/antigravity/.bashrc` / current shell (note `.bashrc` is referenced via `BASH_ENV=/home/antigravity/.bashrc` in `env`!). Adding `export PATH="/home/antigravity/.local/flutter/bin:$PATH"` to `~/.bashrc` (or symlinking + `BASH_ENV`) will make `pnpm nx lint fl-mat`, `pnpm nx test fl-mat`, and `pnpm nx build-widgetbook fl-mat` work seamlessly in bash shells.

---

## 3. Caveats

- `/root` could not be inspected (`Permission denied` for `uid=1000`), though even if anything existed there it would not be usable by `antigravity`.
- `flutter_linux_3.50.0-stable.tar.xz` download speed and uncompressed disk size were not tested end-to-end (read-only survey); exact uncompressed size is estimated from standard Flutter Linux tarballs (`~3.5 GB`).
- First invocation of `flutter` may download additional platform artifacts (e.g., web SDK/canvaskit when running `build-widgetbook`), requiring `pub.dev` and `storage.googleapis.com` access (already verified reachable, `pub.dev` returned HTTP 200).
- The `widgetbook` dev target (`flutter run -d chrome`) requires a Chrome/Chromium binary; we did not check whether `chrome`/`chromium` is installed since the prompt asked specifically about `flutter analyze`, `flutter test`, and `build-widgetbook` (which only builds `build/web` and does not launch Chrome).

---

## 4. Conclusion

1. **SDK Requirement**: `libs/ui/fl-mat` requires **Dart `^3.14.0`** and **Flutter `3.50.0`** (CI default in `.github/actions/setup-flutter/action.yml:8` and `.metadata:7`). Earlier branches (`3.29`, `3.35`, `3.41`, `3.47`) ship Dart `<=3.13.x` and are **incompatible** with `pubspec.yaml:7`.
2. **Current Availability**: Neither `flutter` nor `dart` is installed anywhere accessible in this environment.
3. **Install Feasibility**: **Ready to install**. `/home/antigravity` has `17G` free on `/dev/vdb`, `/home/antigravity/.local` is writable, required archive tools (`curl`, `xz`, `tar`, `git`) are present, and `https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.0-stable.tar.xz` (`1,517,633,656` bytes, sha256 `6ea2d806fd57269ae783e6788e2a81fc26eaad782f1e0d0ff38623bb765ff9f5`) plus `https://pub.dev` are reachable.
4. **Recommended Worker Setup**:
   - Download & extract `flutter_linux_3.50.0-stable.tar.xz` into `/home/antigravity/.local/flutter`, verify `sha256sum`, and delete the `.tar.xz` after extraction to save ~1.5 GB.
   - Ensure `/home/antigravity/.local/flutter/bin` is on `PATH` (e.g., export in `~/.bashrc` since `BASH_ENV=/home/antigravity/.bashrc` is active, and/or pass `PATH="/home/antigravity/.local/flutter/bin:$PATH"` when invoking `pnpm nx` targets).
   - Run `flutter --version`, `cd libs/ui/fl-mat && flutter pub get`, then `pnpm nx lint fl-mat`, `pnpm nx test fl-mat`, and `pnpm nx build-widgetbook fl-mat`.

---

## 5. Verification Method

To independently verify these findings or validate a subsequent Flutter install:

1. **Inspect config & constraints**:
   - `libs/ui/fl-mat/pubspec.yaml` (lines 6–8: `sdk: ^3.14.0`)
   - `libs/ui/fl-mat/.metadata` (line 7: revision `ab2912035e160d9cad6306df307576da6128ebdb`)
   - `.github/actions/setup-flutter/action.yml` (line 8: `default: '3.50.0'`)
   - `libs/ui/fl-mat/project.json` (lines 7–39: `lint`, `test`, `build-widgetbook` targets)
2. **Verify local state & disk space**:
   ```bash
   which flutter dart; df -h /home/antigravity
   ```
3. **Verify release metadata & reachability**:
   ```bash
   curl -sI https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.0-stable.tar.xz
   ```
4. **Post-install verification (for the Worker)**:
   ```bash
   flutter --version
   pnpm nx lint fl-mat
   pnpm nx test fl-mat
   pnpm nx build-widgetbook fl-mat
   ```
- **Invalidation conditions**: Disk space on `/home/antigravity` drops below ~7 GB prior to extraction, or proxy/network access to `storage.googleapis.com` / `pub.dev` is interrupted.
