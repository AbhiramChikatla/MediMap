# MediMap - Find the Best Healthcare Centers Near You

![MediMap](public/medimap-logo.svg)

MediMap is a comprehensive healthcare center finder application that helps users discover and compare healthcare facilities based on wait times, services, patient reviews, and proximity. The application uses advanced mapping technology, symptom analysis, and personalized health dashboards to provide a complete healthcare navigation experience.

## Features

### 🌐 Healthcare Center Mapping
- **Interactive Map Interface**: Find healthcare centers near your location
- **Route Planning**: Get directions to healthcare facilities with distance and duration estimates
- **Search Radius Control**: Customize your search area based on how far you're willing to travel

### 🩺 Symptom Analysis
- **Symptom Input**: Enter your symptoms through an intuitive interface
- **Specialty Matching**: AI-powered matching of symptoms to medical specialties
- **Emergency Mode**: Prioritize urgent care facilities when needed

### 📊 Health Dashboard
- **Personal Health Metrics**: Track BMI, calorie needs, target heart rate, and water intake
- **Health Tips**: Receive personalized health recommendations
- **3D Human Model**: Interactive visualization for symptom location

### 🔐 User Authentication
- Secure sign-up and login through Clerk authentication
- Personalized experience based on user profile

## Technologies Used

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI component library
- **TailwindCSS 4**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **Three.js/React Three Fiber**: 3D globe visualization
- **Shadcn UI**: Component library for consistent design

### Maps & Geolocation
- **Google Maps API**: Location services and route planning
- **Mapbox**: Alternative mapping provider

### AI & Machine Learning
- **TensorFlow.js**: Client-side machine learning for symptom analysis

### Authentication
- **Clerk**: User authentication and management

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/medimap.git
cd medimap
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Mapbox (if using)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Project Structure

```
/src
  /app - Next.js app router pages
  /components - React components
    /auth - Authentication components
    /dashboard - Health dashboard components
    /human-model - 3D human model visualization
    /landing - Landing page components
    /map - Map and route finding components
    /symptom-selector - Symptom input interface
    /ui - Reusable UI components
  /data - Static data files
  /lib - Utility functions and services
```

## Deployment

The easiest way to deploy MediMap is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org) - The React Framework
- [Clerk](https://clerk.dev) - Authentication provider
- [Google Maps Platform](https://developers.google.com/maps) - Maps and location services
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning library
- [Three.js](https://threejs.org) - 3D library for web graphics
