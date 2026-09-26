# SwiftChain - Frontend

**SwiftChain** is a Blockchain-Powered Logistics & Escrow Delivery Platform built on the Stellar blockchain. It connects customers, independent drivers, and logistics operators in a decentralized network, ensuring secure and transparent deliveries through smart contract escrow payments.

This repository (`SwiftChain-Frontend`) contains the frontend application built with **Next.js**, **TypeScript**, and **TailwindCSS**.

---

## 🚀 Project Overview

### Core Problem
//Temproary fix for pr and commit
Traditional logistics systems suffer from:

- Lack of trust between senders and independent drivers.
- High fees and slow payments for drivers.
- Limited access for small courier businesses and unbanked drivers.
- Inefficient cross-border settlement.

### Solution

SwiftChain introduces a decentralized logistics network where:

- **Smart Contracts** hold funds in escrow until delivery is verified.
- **Stellar Blockchain** facilitates fast, low-cost payments.
- **Independent Drivers** and small businesses can compete on a level playing field.

### How It Works

1.  **Sender** creates a delivery request and locks payment in an escrow smart contract.
2.  **Driver** accepts the delivery job.
3.  **Package** is transported to the destination.
4.  **Recipient** confirms receipt (or driver provides proof).
5.  **Escrow** automatically releases payment to the driver.

### Financial Inclusion Benefits

- Empowers independent drivers and small courier businesses.
- Provides access to global logistics markets for underserved regions (e.g., African markets).
- Enables cross-border merchants to settle payments instantly.

---

## 🎯 Target Market

- **African Logistics Markets**: Connecting informal transport sectors.
- **Cross-Border Merchants**: Facilitating trade between regions.
- **SME Businesses**: Affordable and reliable delivery options.
- **E-commerce Sellers**: Integrated delivery solutions.
- **Independent Delivery Drivers**: Gig economy opportunities with fair pay.

---

## 💰 Revenue Model

The platform generates revenue through:

- **Delivery Commission Fee**: Small percentage of each successful delivery.
- **Escrow Service Fee**: Fee for securing funds in smart contracts.
- **Enterprise Logistics Integration**: Premium API access for large logistics companies.
- **Cross-Border Settlement Fees**: Currency conversion and cross-border transaction fees.
- **Premium Fleet Management Tools**: Subscription-based tools for fleet operators.

---

## 🏗️ Platform Architecture

The SwiftChain platform consists of three main repositories:

1.  **SwiftChain-Frontend** (This Repo): Next.js + TypeScript + TailwindCSS. Handles UI, user interaction, and client-side logic.
2.  **SwiftChain-Backend**: Express.js + Node.js + TypeScript + MongoDB. Manages off-chain data, user accounts, and API orchestration.
3.  **SwiftChain-SmartContract**: Stellar Soroban + Rust. Handles on-chain escrow logic, payments, and trustless verification.

---

## 🛠️ Technology Stack

**Frontend:**

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [React Query / TanStack Query](https://tanstack.com/query/latest) & [Zustand](https://github.com/pmndrs/zustand) (optional)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket Client
- **Notifications**: Toast Notifications (e.g., Sonner or React-Hot-Toast)

---

## ✨ Platform Features

### Authentication & User Management

- **Registration/Login**: Secure access for customers, drivers, and admins.
- **Admin Dashboard**: Overview of system activity and user management.
- **Profile Management**: Manage personal details and preferences.

### Logistics Operations

- **Create Delivery**: Form to input pickup, destination, and package details.
- **Delivery List**: Filterable and sortable list of active and past deliveries.
- **Shipment Management**: Detailed tracking and management of shipments.
- **Driver Assignment**: Tools for assigning drivers to specific deliveries.
- **File Upload**: Upload delivery receipts and proof of delivery (PDF/Images).

### Real-time Updates

- **Live Status**: Real-time updates on delivery status via WebSockets.
- **Notifications**: Instant alerts for successful actions or errors.

---

## 📅 Development Roadmap

### Phase 1 — MVP (Minimal Logistics Platform)

_Focus: Core logistics functionality and backend integration._

- [ ] Authentication (Login/Register).
- [ ] Create Delivery functionality.
- [ ] Delivery List view.
- [ ] Basic Driver Assignment.
- [ ] Admin Dashboard (Basic).
- [ ] Backend API Integration.

### Phase 2 — Escrow Integration

_Focus: Blockchain payments and trust._

- [ ] Stellar Wallet Connection.
- [ ] Payment Escrow UI.
- [ ] Locking payments for deliveries.
- [ ] Releasing payments upon confirmation.

### Phase 3 — Smart Contract Integration

_Focus: On-chain verification and automation._

- [ ] Soroban Smart Contract Interaction.
- [ ] On-chain Escrow Verification.
- [ ] Delivery Proof Verification on-chain.
- [ ] Blockchain Event Listeners.

### Phase 4 — Full Platform Scaling

_Focus: Advanced features and expansion._

- [ ] Fleet Management Tools.
- [ ] Advanced Analytics Dashboard.
- [ ] Mobile PWA (Progressive Web App).
- [ ] Cross-Border Payment Support.
- [ ] Decentralized Reputation System.

---

## 📂 Project Structure

```bash
SwiftChain-Frontend/
├── .github/                # GitHub Actions workflows
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # Next.js API proxy routes
│   └── ...
├── components/             # Reusable React components
│   ├── ui/                 # Generic UI components
│   ├── forms/              # Form components
│   └── ...
├── features/               # Feature-based modules
│   ├── auth/               # Authentication feature
│   ├── deliveries/         # Delivery management feature
│   ├── shipments/          # Shipment tracking feature
│   └── ...
├── hooks/                  # Custom React hooks
├── services/               # API and external service integrations
├── lib/                    # Utility libraries and configurations
├── types/                  # TypeScript type definitions
├── utils/                  # Helper functions
├── store/                  # Global state management
├── styles/                 # Global styles and Tailwind config
├── public/                 # Static assets
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v9 or higher)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-org/SwiftChain-Frontend.git
    cd SwiftChain-Frontend
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to `.env.local` and fill in the required values.

    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔑 Environment Variables

See `.env.example` for a complete list. Key variables include:

- `NEXT_PUBLIC_API_URL`: Backend API URL.
- `NEXT_PUBLIC_STELLAR_NETWORK`: Stellar network (testnet/public).
- `NEXT_PUBLIC_SOROBAN_RPC_URL`: Soroban RPC URL.

---

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration. The workflow is defined in `.github/workflows/ci.yml`.

- **Install Dependencies**: Ensures all packages are installed correctly.
- **Lint**: Runs ESLint to check for code quality issues.
- **Type Check**: Runs TypeScript compiler to catch type errors.
- **Build Verification**: Attempts to build the project to ensure no build failures.

---

## 🤝 Contribution Guidelines

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
