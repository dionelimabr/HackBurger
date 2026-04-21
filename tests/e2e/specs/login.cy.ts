describe('HackBurger E2E - Login', () => {
  it('should login successfully as admin', () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('admin@hackburger.com');
    cy.get('input[name="password"]').type('Admin@123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/');
    cy.get('.toast-notification').should('contain', 'Login realizado com sucesso');
  });
});
