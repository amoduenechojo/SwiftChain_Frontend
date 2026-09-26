// cypress/e2e/driver-marketplace.cy.ts

describe('E2E: Driver Job Marketplace Filtering and Bidding', () => {
  beforeEach(() => {
    // Mock driver session
    cy.window().then((win) => {
      win.localStorage.setItem('role', 'driver');
      win.localStorage.setItem('token', 'mock-driver-jwt');
    });

    // Mock external API dependencies
    cy.intercept('GET', '**/api/jobs*', {
      statusCode: 200,
      body: {
        jobs: [
          { id: '1', origin: 'Lagos', destination: 'Abuja', cargoType: 'Heavy', payout: '50000' },
          { id: '2', origin: 'Ibadan', destination: 'Kano', cargoType: 'Standard', payout: '25000' }
        ]
      }
    }).as('fetchJobs');

    cy.intercept('POST', '**/api/jobs/*/bid', {
      statusCode: 200,
      body: { success: true, message: 'Bid submitted successfully' }
    }).as('submitBid');

    cy.visit('/marketplace');
  });

  it('applies cargo and location filters to the marketplace list', () => {
    cy.wait('@fetchJobs');

    // Apply cargo type filter
    cy.get('select[name="cargoType"], select[id="cargoType"]').select('Heavy');
    
    // Apply location filter
    cy.get('input[name="location"], input[id="location"]').type('Lagos');
    
    cy.get('button').contains(/apply filters/i).click();

    // Verify the UI updates to reflect the filtered state
    // (Assuming the frontend sends updated query params to the mocked endpoint)
    cy.get('[data-testid="job-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="job-card"]').first().should('contain.text', 'Lagos');
    cy.get('[data-testid="job-card"]').first().should('contain.text', 'Heavy');
  });

  it('successfully opens the bid modal and submits a valid bid', () => {
    cy.wait('@fetchJobs');

    // Open bid modal for the first available job
    cy.get('[data-testid="job-card"]').first().find('button').contains(/place bid/i).click();

    // Fill out the bidding form
    cy.get('input[name="bidAmount"]').type('45000');
    cy.get('textarea[name="proposal"]').type('Available for immediate pickup with a 5-ton truck.');
    
    // Submit the bid
    cy.get('button[type="submit"]').contains(/submit bid/i).click();

    // Wait for the mutation and verify success state
    cy.wait('@submitBid').its('request.body').should('deep.include', {
      bidAmount: 45000,
      proposal: 'Available for immediate pickup with a 5-ton truck.'
    });
    
    cy.contains(/bid submitted successfully/i).should('be.visible');
    cy.get('[data-testid="bid-modal"]').should('not.exist');
  });

  it('displays validation errors for an invalid bid amount', () => {
    cy.wait('@fetchJobs');

    cy.get('[data-testid="job-card"]').first().find('button').contains(/place bid/i).click();

    // Submit a bid without an amount
    cy.get('button[type="submit"]').contains(/submit bid/i).click();

    // Assert validation error
    cy.contains(/bid amount is required/i).should('be.visible');
  });

  it('handles server rejection gracefully', () => {
    cy.wait('@fetchJobs');

    // Override the successful mock with a server error
    cy.intercept('POST', '**/api/jobs/*/bid', {
      statusCode: 400,
      body: { success: false, message: 'Bid amount is too high for this route' }
    }).as('submitBidError');

    cy.get('[data-testid="job-card"]').first().find('button').contains(/place bid/i).click();
    cy.get('input[name="bidAmount"]').type('999999');
    cy.get('button[type="submit"]').contains(/submit bid/i).click();

    cy.wait('@submitBidError');
    cy.contains(/bid amount is too high for this route/i).should('be.visible');
  });
});