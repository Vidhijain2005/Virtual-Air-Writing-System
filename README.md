# Virtual Air Writing System

A fully functional web application that allows users to write in the air using their fingers via webcam. The system uses real-time hand tracking to detect finger movements and renders the writing on a digital canvas, with OCR capabilities to convert handwriting into text.

## Features

- **Real-time Hand Tracking**: Uses MediaPipe Hands for accurate finger detection
- **Gesture Controls**:
  - Index finger up → Writing mode
  - Closed fist → Erase mode
  - Open palm → Clear screen
- **Smooth Drawing**: Interpolated lines for reduced jitter
- **OCR Integration**: Convert drawings to text using Tesseract.js
- **Modern UI**: Built with Next.js, Tailwind CSS, and Framer Motion
- **Dark/Light Mode**: Theme toggle
- **Responsive Design**: Works on laptop and tablet screens
- **Save & Download**: Export drawings as images and text as .txt files
- **Undo/Redo**: Drawing history management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Hand Tracking**: MediaPipe Hands
- **OCR**: Tesseract.js
- **Icons**: Lucide React
- **Theme**: next-themes

## Setup Instructions

1. **Clone or download the project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Grant camera permission** when prompted
2. **Position your hand** in front of the webcam
3. **Writing Mode**: Point with index finger to draw
4. **Erasing Mode**: Make a fist to erase
5. **Clear Screen**: Open palm gesture
6. **Switch to Recognition**: Click the "Idle" mode to trigger OCR
7. **Edit Text**: Modify recognized text in the side panel
8. **Save/Download**: Use toolbar buttons to export

## Project Structure

```
app/
├── components/
│   ├── ui/
│   │   └── button.tsx
│   ├── drawing-canvas.tsx
│   ├── status-indicator.tsx
│   ├── text-panel.tsx
│   ├── theme-toggle.tsx
│   ├── toolbar.tsx
│   └── webcam-feed.tsx
├── hooks/
│   ├── use-drawing.ts
│   └── use-hand-tracking.ts
├── lib/
│   └── utils.ts
├── globals.css
├── layout.tsx
└── page.tsx
```

## Browser Compatibility

- Chrome/Edge (recommended for MediaPipe support)
- Firefox (may have limited MediaPipe support)
- Safari (limited support)

## Permissions Required

- Camera access for hand tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
