# p5.js v2 Playground

A Vite-powered environment for creating and playing with p5.js v2 sketches with live reloading.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    Open the link in your browser (usually `http://localhost:5173`).

3.  **Create a new sketch:**
    ```bash
    npm run new <sketch-name>
    ```

## Project Structure

- `sketches/`: Each subfolder here is an independent p5.js sketch.
- `sketches/_template/`: The template used for new sketches.
- `scripts/new.js`: Automation script for creating new sketches.
- `index.html`: The main dashboard that lists all your sketches.

## Workflow

- Edit `sketches/<your-sketch>/sketch.js` and see changes instantly in the browser.
- Use `window.setup`, `window.draw`, etc., to define your p5 sketch logic (Global Mode).
