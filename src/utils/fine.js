export function calculateFine(expectedReturnDate, actualReturnDate, finePerDay = 10) {
    const expected = new Date(expectedReturnDate);
    const actual = new Date(actualReturnDate);
    const diffTime = actual - expected;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * finePerDay : 0;
}