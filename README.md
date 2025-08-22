# Akave Testnet Faucet

A modern, user-friendly faucet application for the Akave testnet built with Next.js and TypeScript.

## Features

- 🚀 Built with Next.js 15 and React 19
- 💎 TypeScript for type safety
- 🎨 Modern UI with TailwindCSS
- ⛓️ Blockchain interaction using Viem
- 🔔 Toast notifications for better UX
- 🛠️ Development tools including ESLint, Prettier, and Husky

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd akave-faucet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
akave-faucet/
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   ├── fonts/         # Font assets
│   ├── page.tsx       # Main page component
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
├── public/            # Static assets
└── ...config files    # Various configuration files
```

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Viem](https://viem.sh/) - Ethereum interactions
- [React Hot Toast](https://react-hot-toast.com/) - Toast notifications

## Development

The project uses several development tools to ensure code quality:

- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- TypeScript for static type checking

## License

This project is licensed under the terms of the license included in the repository.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request