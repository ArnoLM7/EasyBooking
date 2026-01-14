// Tests unitaires pour la validation de l'authentification

describe('Validation Email', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('devrait accepter un email valide', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('devrait rejeter un email sans @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('devrait rejeter un email sans domaine', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('devrait rejeter un email sans extension', () => {
    expect(isValidEmail('test@example')).toBe(false);
  });

  it('devrait rejeter un email vide', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('devrait rejeter un email avec espaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
    expect(isValidEmail('test@ example.com')).toBe(false);
  });
});

describe('Validation Mot de Passe', () => {
  const isValidPassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 12) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins 12 caractères' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
    }
    return { valid: true, message: '' };
  };

  it('devrait accepter un mot de passe valide', () => {
    const result = isValidPassword('MonPassword1!');
    expect(result.valid).toBe(true);
  });

  it('devrait accepter un mot de passe complexe', () => {
    const result = isValidPassword('Super$ecure123Password!');
    expect(result.valid).toBe(true);
  });

  it('devrait rejeter un mot de passe trop court', () => {
    const result = isValidPassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Le mot de passe doit contenir au moins 12 caractères');
  });

  it('devrait rejeter un mot de passe sans majuscule', () => {
    const result = isValidPassword('monpassword1!');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Le mot de passe doit contenir au moins une majuscule');
  });

  it('devrait rejeter un mot de passe sans minuscule', () => {
    const result = isValidPassword('MONPASSWORD1!');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Le mot de passe doit contenir au moins une minuscule');
  });

  it('devrait rejeter un mot de passe sans chiffre', () => {
    const result = isValidPassword('MonPasswordAbc!');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Le mot de passe doit contenir au moins un chiffre');
  });

  it('devrait rejeter un mot de passe sans caractère spécial', () => {
    const result = isValidPassword('MonPassword123');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Le mot de passe doit contenir au moins un caractère spécial');
  });
});
