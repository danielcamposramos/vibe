# Agent Instructions

- Always run `npm run lint` and `cargo test` before committing, capturing the last 20 lines of output.
- If a command fails due to missing dependencies or network problems, mention this in your PR summary.
- Keep the package requirements documented in `docs/building.md` up to date.
- Whenever adding or updating system dependencies, list them here and update the project files accordingly.
- Every time you find a missing dependency or package, include it at all appropriate places after success, including but not limited to this file.


## Required system packages
- ffmpeg
- libopenblas-dev
- pkg-config
- build-essential
- libglib2.0-dev (>= 2.80)
- libgtk-3-dev
- libwebkit2gtk-4.1-dev
- libsoup-3.0-dev
- libjavascriptcoregtk-4.1-dev
- clang
- cmake
- libssl-dev
- libavutil-dev
- libavformat-dev
- libavfilter-dev
- libavdevice-dev
