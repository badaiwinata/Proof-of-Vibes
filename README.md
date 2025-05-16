# Proof of Vibes - Memento NFT

A Web3 platform on Solana that allows event attendees to use a photobooth to take a selfie and claim NFTs as souvenirs. These NFTs can be proof of participation (Proof of Vibes) and can be shared on social media or even used for future giveaways.

🚀 [View the Pitch Deck](https://drive.google.com/file/d/1I68xMx4YUda_yAQfetL_w-5bDw591zQV/view)


## 📸 Demo

- Check Live Project: https://proof-of-vibes.replit.app/
- Snapshot: [Home Screenshot](https://github.com/badaiwinata/Proof-of-Vibes/blob/9820aace212d5824d995eb4e8937f0334b084eb5/attached_assets/home%20-%20pov.png) | [NFT Screenshot](https://github.com/badaiwinata/Proof-of-Vibes/blob/787d04033a340fd96c4c3dddc3a1e142364541b4/attached_assets/nft%20detail%20-%20pov.png)


## 🚀 Features Value

- ✨ Consumer App with availability in Event Photobooth
- 🔒 Turn your selfi into NFT
- ⚡ Onboard massive people using onchain by claiming their photo directly into wallet 

## Overview
Proof of Vibes is designed for mass crypto adoption through an event-based photobooth experience. The application allows users to:
- Take selfies or upload photos
- Select their favorite photos
- Choose template styles (Classic, Neon, Retro, Minimal)
- Create personalized digital collectibles (NFTs) as event mementos
- Create multiple editions/copies of group photos
- Claim digital collectibles via email or QR codes
The platform handles all blockchain interactions invisibly in the background, making the NFT experience accessible to users without requiring crypto knowledge.

## Technologies Used
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: In-memory storage (can be extended with PostgreSQL)
- **Blockchain**: Solana integration
- **State Management**: React Context API, TanStack Query
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom theme

## Features
### 1. Photobooth Experience
- Camera integration for taking selfies
- Photo gallery and selection
- Template selection with various visual styles
- Vibe tags for categorizing photos
- Custom messaging
### 2. NFT Creation and Management
- Automatic minting of NFTs in the background
- Support for multiple editions/copies of the same photo
- Collection management for organizing related NFTs
- Certificate of authenticity generation
### 3. Claiming System
- Email-based claiming for non-crypto users
- QR code generation for in-person events
- Ownership verification and tracking
### 4. Admin Panel
- Data management for event organizers
- Reset functionality for demo purposes
- Protected admin route with token authentication

## Setup and Installation
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps
1. Clone the repository:
```
git clone https://github.com/yourusername/proof-of-vibes.git
cd proof-of-vibes
```

2. Install dependencies:
```npm install```

3. Start the development server:
```npm run dev```

4. Open your browser and navigate to:
```http://localhost:5000```

## Deployment
This project is configured for easy deployment on Replit:
1. Click the "Deploy" button in Replit
2. Configure your subdomain and environment settings
3. Click "Deploy" to build and publish your application

### Usage
## User Flow
1. Home Gallery: Browse existing NFTs or start creating your own
2. Take Photos: Use the camera to capture selfies or upload photos
3. Select Photos: Choose your favorite photos to mint
4. Choose Template: Select a visual style and add tags/messages
5. Set Editions: Specify how many copies of each NFT to create
6. Create Collectible: Mint the NFTs on the blockchain
7. Claim: Receive a claim link or QR code to access your digital collectible

### Admin Features
Access the admin panel at /admin to:
- Reset user-generated data for demo purposes
- View system statistics
- Default admin token: proof-of-vibes-admin

### Project Structure
```
/client             # Frontend React application
  /src
    /components     # Reusable UI components
    /context        # React Context providers
    /hooks          # Custom React hooks
    /lib            # Utility functions
    /pages          # Main application pages
/server             # Backend Express application
  /routes.ts        # API endpoints
  /storage.ts       # Data storage implementation
/shared             # Shared code between client and server
  /schema.ts        # Database schema definitions
```

## Configuration
Environment variables can be set in a .env file:
```
# API Keys
ADMIN_TOKEN=your-secure-admin-token
# Blockchain Configuration
SOLANA_NETWORK=devnet
# Server Configuration
PORT=5000
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgements
- shadcn/ui - UI components
- Tailwind CSS - Styling
- Solana Web3.js - Blockchain integration

## Contributors
@0xwnrft https://x.com/0xwnrft
