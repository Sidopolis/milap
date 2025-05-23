# Milap

Milap is a platform that connects creators and builders, enabling them to find collaborators and work together on projects.

## Features

- Real-time chat with other builders
- Project showcase and discovery
- Builder profiles with tags and project information
- Connection requests and networking

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Firebase Realtime Database
- TailwindCSS for styling
- React Router for navigation
- GSAP and Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/milap.git
   cd milap
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_DATABASE_URL=your-database-url
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

This project is set up for easy deployment to Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in Vercel's dashboard
4. Deploy!

## License

[MIT](LICENSE) 