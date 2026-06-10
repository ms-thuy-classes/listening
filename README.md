# Learn with Ms. Thúy – English Listening Website

A modern, responsive platform for English listening lessons.  
Built with HTML, CSS, vanilla JS – **no backend**, deployable on GitHub Pages.

## Features

- 🎧 Audio lessons with custom player (speed, volume, progress)
- 📚 Dynamic lesson cards loaded from `data/lessons.json`
- 🔍 Instant search & category filter (A1–C2, Cambridge 10–20, IELTS)
- 🌗 Dark mode with localStorage persistence
- 📄 Individual lesson pages with transcript, vocabulary table, exercises
- 🧭 Pagination (10 lessons per page)
- 📱 Fully responsive (mobile, tablet, desktop)

## Folder Structure

- `index.html` – Homepage
- `css/style.css` – All styles
- `js/app.js` – Search, filters, pagination, dark mode
- `data/lessons.json` – Lesson database
- `listening/lessonX.html` – Lesson templates (copy and change `data-lesson-id`)
- `audio/` – MP3 files
- `assets/` – Images, logos

## How to add a new lesson

1. Put the audio file into `audio/` (e.g. `lesson21.mp3`)
2. Copy `listening/lesson1.html` → `listening/lesson21.html` and change the `lessonId` in the script (subtract 1 from the number)
3. Add a new object to `data/lessons.json` with the correct `title`, `category`, `level`, `duration`, `thumbnail`, `audio` path, and `file` path pointing to the new HTML.

The homepage will automatically show the new lesson – no extra edits needed.

## Deployment

Push the entire repository to GitHub, enable GitHub Pages in the repository settings (branch: main, root folder). Done.

## Credits

Designed for Ms. Thúy – premium English listening training.
