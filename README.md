<p align="center">
  <img width="96px" alt="Vibe logo" src="./design/logo.png" />
</p>

<h1 align="center">Vibe - Transcribe on your own!</h1>

<p align="center">
  <strong>⌨️ Transcribe audio / video offline using OpenAI Whisper</strong>
  <br/>
</p>
## Screenshots

<p align="center">
  <img width=600 src="https://github.com/vibe/assets/61390950/22779ac6-9e49-4c21-b528-29647f039da2">
</p>



# Features 🌟

-   🌍 Transcribe almost every language
-   🔒 Ultimate privacy: fully offline transcription, no data ever leaves your device
-   🎨 User friendly design
-   🎙️ Transcribe audio / video
-   🎶 Option to transcribe audio from popular websites (YouTube, Vimeo, Facebook, Twitter and more!)
-   📂 Batch transcribe multiple files!
-   📝 Support `SRT`, `VTT`, `TXT`, `HTML`, `PDF`, `JSON`, `DOCX` formats
-   👀 Realtime preview
-   ✏️ Built-in subtitle editor with video preview and quick timestamp controls
-   ✨ Summarize transcripts: Get quick, multilingual summaries using the Claude API
-   🧠 Ollama support: Do local AI analysis and batch summaries with Ollama
-   🌐 Translate to English from any language
-   🖨️ Print transcript directly to any printer
-   🔄 Automatic updates
-   💻 Optimized for `GPU` (`macOS`, `Windows`, `Linux`)
-   🎮 Optimized for `Nvidia` / `AMD` / `Intel` GPUs! (`Vulkan`/`CoreML`)
-   🔧 Total Freedom: Customize Models Easily via Settings
-   ⚙️ Model arguments for advanced users
-   ⏳ Transcribe system audio
-   🎤 Transcribe from microphone
-   🖥️ CLI support: Use Vibe directly from the command line interface! (see `--help`)
-   👥 Speaker diarization
-   📱 ~iOS & Android support~ (coming soon)
-   📥 Integrate custom models from your own site: Use `vibe://download/?url=<model url>`
-   📹 Choose caption length optimized for videos / reels
-   ⚡ HTTP API with Swagger docs! (use `--server` and open `http://<host>:3022/docs` for docs)

# Supported platforms 🖥️

`MacOS`
`Windows`
`Linux`
## How to build

Clone the repository and build the desktop app for Linux:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg libopenblas-dev pkg-config build-essential libglib2.0-dev libgobject-2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev clang cmake libssl-dev libavutil-dev libavformat-dev libavfilter-dev libavdevice-dev
git clone https://github.com/danielcamposramos/vibe.git
cd vibe
bun install
bun run scripts/pre_build.js
cd desktop
bunx tauri build
```

_Support for Windows and macOS will be documented later._
# Contribute 🤝

PRs are welcomed!
In addition, you're welcome to add translations.

We would like to express our sincere gratitude to all the contributors.

<a href="graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vibe" />
</a>

# Community

[![Discord](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/EcxWSstQN8)

# Add translation 🌐

1. Copy `en` from `desktop/src-tauri/locales` folder to new directory eg `pt-BR` (use [bcp47 language code](https://gist.github.com/thewh1teagle/c8877e5c4c5e2780754ddd065ae2592e))
2. Change every value in the files there, to the new language and keep the keys as is
3. create PR / issue in Github

In addition you can add translation to [Vibe website](/) by creating new files in the `landing/static/locales`.

# Docs 📄

see [Vibe Docs](docs)
Check the [Subtitle Editor guide](docs/editor.md) to learn how to refine captions.

# I want to know more!

Medium [post](https://medium.com/@thewh1teagle/creating-vibe-multilingual-audio-transcription-872ab6d9dbb0)

# Issue report

You can open [new issue](https://github.com/vibe/issues/new?assignees=octocat&labels=bug&projects=&template=bug_report.yaml&title=[Short+title]) and it's recommend to check [debug.md](docs/debug.md) first.

# Privacy Policy 🔒

Your privacy is important to us. Please review our [Privacy Policy](landing/static/privacy_policy.md) to understand how we handle your data.

# Credits

Thanks for [tauri.app](https://tauri.app/) for making the best apps framework I ever seen

Thanks for [wang-bin/avbuild](https://github.com/wang-bin/avbuild) for pre built `ffmpeg`

Thanks for [github.com/whisper.cpp](https://github.com/ggerganov/whisper.cpp) for outstanding interface for the AI model.

Thanks for [openai.com](https://openai.com/) for their amazing [Whisper model](https://openai.com/research/whisper)

Thanks for [github.com](https://github.com/) for their support in open source projects, providing infastructure completely free.

And for all the amazing open source frameworks and libraries which this project uses...
Forked from Vibe, borrowed from SubtitleEditor and stitched together by Codex with Daniel Ramos's EchoSystems creative line and guidance.
