// cypress/e2e/login.cy.ts

describe('E2E: User Login and Session Management', () => {
  beforeEach(() => {
    // Mock the external authentication API dependency
    cy.intercept('POST', '**/api/auth/login', (req) => {
      if (req.body.email === 'test@swiftchain.com' && req.body.password === 'ValidPass123!') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            token: 'mock-secure-jwt-token',
            user: { id: '1', role: 'customer' }
          }
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { success: false, message: 'Invalid email or password' }
        });
      }
    }).as('loginRequest');

    // Mock protected route to test session validation
    cy.intercept('GET', '**/api/protected/data', (req) => {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.includes('mock-secure-jwt-token')) {
        req.reply({ statusCode: 200, body: { data: 'Secure data' } });
      } else {
        req.reply({ statusCode: 401, body: { message: 'Unauthorized' } });
      }
    }).as('protectedData');
  });

  it('successfully logs in, stores the JWT securely, and routes to the dashboard', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"], input[id="email"]').type('test@swiftchain.com');
    cy.get('input[name="password"], input[id="password"]').type('ValidPass123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Verify successful routing
    cy.url().should('match', /\/(dashboard|home)/);

    // Verify JWT token is stored securely in localStorage (adjust to sessionStorage or cookies if SwiftChain uses those)
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.eq('mock-secure-jwt-token');
    });
  });

  it('displays an error message for invalid credentials', () => {
    cy.visit('/login');

    cy.get('input[name="email"], input[id="email"]').type('test@swiftchain.com');
    cy.get('input[name="password"], input[id="password"]').type('WrongPassword!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Assert the error is visible and the user is not redirected
    cy.contains(/invalid email or password/i).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('redirects the user to the login page on session timeout or missing token', () => {
    // Seed the localStorage with a mock token to simulate an active session
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-secure-jwt-token');
      }
    });

    // Verify the user is on the protected route initially
    cy.url().should('include', '/dashboard');

    // Simulate session expiration by removing the token
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    // Trigger an action or page reload that requires authentication
    cy.reload();

    // Verify the application catches the missing/expired token and redirects
    cy.url().should('include', '/login');
  });
});