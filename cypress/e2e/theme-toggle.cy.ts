// cypress/e2e/theme-toggle.cy.ts

describe('E2E: Toggle Dark/Light Mode on Dashboard Overview', () => {
  beforeEach(() => {
    // Mock authentication to safely access the dashboard
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, token: 'mock-token' }
    }).as('login');

    // Set token to bypass login screen if your app uses localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
    });

    cy.visit('/dashboard');
  });

  it('toggles the dashboard between light and dark modes successfully', () => {
    // 1. Initial State Check (Assuming light mode default)
    cy.get('html').should('not.have.class', 'dark');

    // 2. Toggle to Dark Mode
    cy.get('button[aria-label="Toggle Dark Mode"], button[aria-label="Toggle Theme"]')
      .first()
      .click();

    // Verify Tailwind's 'dark' class is applied to the root element
    cy.get('html').should('have.class', 'dark');

    // Verify a specific CSS variable or background color change
    cy.get('body').should('have.css', 'background-color')
      .and((color) => {
        // Checking that the color transitioned away from pure white
        expect(color).to.not.equal('rgb(255, 255, 255)');
      });

    // 3. Toggle back to Light Mode
    cy.get('button[aria-label="Toggle Dark Mode"], button[aria-label="Toggle Theme"]')
      .first()
      .click();

    cy.get('html').should('not.have.class', 'dark');
  });

  it('persists theme preference across page reloads', () => {
    // Toggle to Dark Mode
    cy.get('button[aria-label="Toggle Dark Mode"], button[aria-label="Toggle Theme"]')
      .first()
      .click();
      
    cy.get('html').should('have.class', 'dark');

    // Reload the page
    cy.reload();

    // The dark class should still be present if preference is cached
    cy.get('html').should('have.class', 'dark');
  });
});