// cypress/e2e/registration.cy.ts

describe('E2E: User Registration and Onboarding Flow', () => {
  beforeEach(() => {
    // Mock the external API dependency to prevent flaky tests
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        message: 'User registered successfully',
        token: 'mock-jwt-token-12345',
      },
    }).as('registerUser');

    // Mock Web3 wallet connection if your onboarding requires it automatically
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890abcdef1234567890abcdef12345678']),
      };
    });

    cy.visit('/register');
  });

  it('displays validation errors when submitting an empty form', () => {
    cy.get('button[type="submit"]').click();

    // Assert validation messages appear
    cy.contains(/name is required/i).should('be.visible');
    cy.contains(/email is required/i).should('be.visible');
    cy.contains(/password is required/i).should('be.visible');
  });

  it('displays a validation error for an invalid email format', () => {
    cy.get('input[name="name"], input[id="name"]').type('John Doe');
    cy.get('input[name="email"], input[id="email"]').type('invalid-email-format');
    cy.get('input[name="password"], input[id="password"]').type('StrongPass123!');
    cy.get('button[type="submit"]').click();

    cy.contains(/valid email/i).should('be.visible');
  });

  it('displays a validation error for a weak password', () => {
    cy.get('input[name="name"], input[id="name"]').type('John Doe');
    cy.get('input[name="email"], input[id="email"]').type('john.doe@example.com');
    cy.get('input[name="password"], input[id="password"]').type('123'); // Too short/weak
    cy.get('button[type="submit"]').click();

    cy.contains(/password must be at least 8 characters/i).should('be.visible');
  });

  it('displays a validation error when passwords do not match', () => {
    cy.get('input[name="name"], input[id="name"]').type('John Doe');
    cy.get('input[name="email"], input[id="email"]').type('john.doe@example.com');
    cy.get('input[name="password"], input[id="password"]').type('StrongPass123!');
    
    // If there is a confirm password field
    cy.get('body').then(($body) => {
      if ($body.find('input[name="confirmPassword"], input[id="confirmPassword"]').length > 0) {
        cy.get('input[name="confirmPassword"], input[id="confirmPassword"]').type('MismatchPass123!');
        cy.get('button[type="submit"]').click();
        cy.contains(/passwords must match/i).should('be.visible');
      }
    });
  });

  it('successfully registers a user and routes to the onboarding flow', () => {
    // Fill out the registration form correctly
    cy.get('input[name="name"], input[id="name"]').type('John Doe');
    cy.get('input[name="email"], input[id="email"]').type('john.doe@example.com');
    cy.get('input[name="password"], input[id="password"]').type('StrongPass123!');
    
    cy.get('body').then(($body) => {
      if ($body.find('input[name="confirmPassword"], input[id="confirmPassword"]').length > 0) {
        cy.get('input[name="confirmPassword"], input[id="confirmPassword"]').type('StrongPass123!');
      }
    });

    cy.get('button[type="submit"]').click();

    // Wait for the mocked API call to be intercepted
    cy.wait('@registerUser');

    // Assert that the user is routed correctly
    cy.url().should('match', /\/(onboarding|dashboard|welcome)/);
  });
});