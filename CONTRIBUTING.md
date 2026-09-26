````markdown
# Contributing to SwiftChain Frontend

Thank you for your interest in contributing to the **SwiftChain Frontend**! We welcome contributions from the community to help build the user interface for our Blockchain-Powered Logistics & Escrow Delivery Platform.

Whether you are building out new Next.js UI components, fixing bugs, or proposing new user features, your help is incredibly valuable.

## Product Reference

Before contributing, please review our comprehensive Product Requirements Document to understand our users, features, and rollout phases:
📄 **[SwiftChain Frontend PRD](https://docs.google.com/document/d/1ShtWjf6i5D5SueeEZ8aH_A3VbnckpbEfPAue4hKwXJo/edit?usp=sharing)**

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone [https://github.com/your-username/SwiftChain_Frontend.git](https://github.com/your-username/SwiftChain_Frontend.git)
    cd SwiftChain_Frontend
    ```
3.  **Create a branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```

## Development Workflow

The frontend application is the customer and administrator-facing interface allowing participants to interact with the logistics network.

- **Tech Stack**: Next.js App Router, TypeScript, TailwindCSS, React Hook Form, Zod, Axios, TanStack Query, Zustand, WebSocket client.
- **Roles Supported**: Customer, Driver, and Admin.
- **Prerequisites**: Node.js (v18 or higher) and pnpm (v9 or higher).

### Installation & Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
````

2. **Setup environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   _(Fill in the required local variables inside `.env.local`)_

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`.

## Testing & UI Guidelines

1. **Component Reliability**: Ensure any UI components handle API failures gracefully, display correct loading skeletons, and match the target Acceptance Criteria defined in the PRD (e.g., empty states, toast notifications).
2. **Responsive Design**: All new features must be fully responsive. Test your implementations on both mobile (375px) and desktop viewports.
3. **Accessibility**: Ensure your components are accessible, maintain good color contrast, and include proper ARIA labels.

## Feature Requests & Git Issues

We believe the community should drive the project's priorities based on the phased rollout outlined in our PRD (Phase 1 MVP ➔ Escrow ➔ Scaling).

### Tackling Existing Issues

When looking for something to work on, please check the GitHub Issues tab. We recommend filtering by our standard priority tags (`high`, `medium`, `low`) or type tags (`frontend`, `ui`).

### Requesting a New Feature

1.  **Check existing requests**: Browse existing Issues to avoid duplicates.
2.  **Open an Issue**: Include a descriptive title, the problem/use case in the logistics flow, your proposed solution, and link back to the PRD document if applicable.

## Submitting a Pull Request

1.  **Ensure all checks pass**: Run frontend linters and ensure there are zero strict TypeScript errors before submitting.
2.  **Update documentation**: If you change the routing architecture or core component structure, update the relevant markdown files.
3.  **Format your code**: Run your Prettier/ESLint formatting scripts.
4.  **Submit your PR** to the `main` branch.
    - Provide a clear description of the visual and functional changes.
    - Upload a **screenshot** or video recording of the working UI.
    - Include `Closes #[issue_id]` in the description to automatically link the PR to the issue.

---

## License & Copyright


By contributing, you agree that your contributions will be licensed under the **MIT License**, same as the project.

++++++++++++++++++++++++++++++++++
© Copyright
© 2026 SwiftChainn. All rights reserved.
++++++++++++++++++++++++++++++++++

```

```
