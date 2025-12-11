// Defines the funtion
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// The tests
describe('Input Validation Tests', () => {
    
    test('should return true for valid email addresses', () => {
        expect(validateEmail('blairokwaro@gmail.com')).toBe(true);
        expect(validateEmail('student@usiu.ac.ke')).toBe(true);
    });

    test('should return false for invalid email addresses', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('missing@dot')).toBe(false);
        expect(validateEmail('@missingusername.com')).toBe(false);
    });

});