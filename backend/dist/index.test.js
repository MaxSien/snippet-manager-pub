import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
jest.mock('pg', () => {
    const mPool = {
        // Mówimy TS: "To jest funkcja, która zwraca Promise z dowolną zawartością (any)"
        query: jest.fn().mockResolvedValue({
            rows: [{
                    id: 99,
                    title: 'Testowa Książka',
                    author: 'Jan Kowalski',
                    isbn: '9788324061234',
                    pages: 300,
                    rating: 5
                }]
        }),
    };
    return { Pool: jest.fn(() => mPool) };
});
const { app } = await import('./index.js');
describe('POST /api/books - Dodawanie książki', () => {
    it('powinien dodać książkę i zwrócić status 201, gdy dane są poprawne', async () => {
        const validBook = {
            title: 'Wiedźmin: Ostatnie życzenie',
            author: 'Andrzej Sapkowski',
            isbn: '9788374958431',
            pages: 332,
            rating: 5
        };
        const response = await request(app)
            .post('/api/books')
            .send(validBook);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.title).toBe('Testowa Książka');
    });
    it('powinien zwrócić status 400 i tablicę błędów, gdy ocena jest poza skalą', async () => {
        const invalidBook = {
            title: 'Czysty Kod',
            author: 'Robert C. Martin',
            isbn: '9788328302341',
            pages: 424,
            rating: 6
        };
        const response = await request(app)
            .post('/api/books')
            .send(invalidBook);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('Ocena musi być liczbą w przedziale od 1 do 5.');
    });
});
//# sourceMappingURL=index.test.js.map