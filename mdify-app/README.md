# MDify Android

Native Android app for converting DOCX and PDF files into Markdown, inspired by `mdify-web` and the design brief in [prompt.md](./prompt.md).

## Stack

- Kotlin
- Jetpack Compose
- Material 3
- DataStore for recent history
- `pdfbox-android` for PDF text extraction
- Custom DOCX XML parsing for offline conversion

## Implemented

- Home screen with upload CTA, supported format chips, recent files, and motion-rich gradient styling
- Processing screen with animated progress state
- Markdown preview workflow with editor, preview, split mode on larger screens, copy/share/export actions
- Offline conversion pipeline for `.docx` and `.pdf`
- Persistent recent file history
- Adaptive app icon and light/dark themes

## Open in Android Studio

1. Open [C:\Users\gowda\Downloads\Anti Neo Project\mdify\mdify-app](C:\Users\gowda\Downloads\Anti Neo Project\mdify\mdify-app).
2. Let Android Studio generate the Gradle wrapper if prompted.
3. Sync the project and run on an Android 8.0+ device or emulator.

## Notes

- This environment does not currently have `java` or `gradle`, so I could not run a local build verification here.
- The conversion pipeline is offline-first and intentionally lightweight; complex DOCX styling and advanced PDF structure inference can be extended next if needed.
