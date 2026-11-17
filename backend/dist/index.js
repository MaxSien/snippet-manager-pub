import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import 'dotenv/config'; //Wczytanie .env
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
});
// Funkcja walidująca dane wejściowe książki (Zapewnia spójność danych i bezpieczeństwo)
function validateBook(data) {
    const errors = [];
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        errors.push('Tytuł jest wymagany i musi być tekstem.');
    }
    if (!data.author || typeof data.author !== 'string' || data.author.trim() === '') {
        errors.push('Autor jest wymagany i musi być tekstem.');
    }
    if (!data.isbn || typeof data.isbn !== 'string' || data.isbn.trim().length < 10) {
        errors.push('ISBN jest wymagany i musi mieć minimum 10 znaków.');
    }
    const pages = Number(data.pages);
    if (isNaN(pages) || pages <= 0) {
        errors.push('Liczba stron musi być liczbą większą od zera.');
    }
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.push('Ocena musi być liczbą w przedziale od 1 do 5.');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// ==========================================
// ENDPOINT 1: Dodawanie nowej książki (POST)
// ==========================================
app.post('/api/books', async (req, res) => {
    const { isValid, errors } = validateBook(req.body);
    if (!isValid) {
        res.status(400).json({ success: false, errors });
        return;
    }
    const { title, author, isbn, pages, rating } = req.body;
    try {
        const query = `
            INSERT INTO books (title, author, isbn, pages, rating)
            VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
        `;
        const values = [title.trim(), author.trim(), isbn.trim(), Number(pages), Number(rating)];
        const result = await pool.query(query, values);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Błąd podczas zapisu do bazy:', error);
        res.status(500).json({ success: false, errors: ['Wystąpił błąd serwera podczas zapisu danych.'] });
    }
});
// ==========================================
// ENDPOINT 2: Pobieranie książek z Paginacją i Wyszukiwaniem (GET)
// ==========================================
app.get('/api/books', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    // Fraza wyszukiwania (opcjonalna)
    const search = req.query.search || '';
    try {
        let booksQuery;
        let countQuery;
        let queryParams;
        if (search.trim() !== '') {
            // Zapytanie z wyszukiwaniem (używa ILIKE oraz zdefiniowanych indeksów w bazie)
            booksQuery = `
                SELECT * FROM books
                WHERE title ILIKE $1 OR author ILIKE $1
                ORDER BY id DESC
                    LIMIT $2 OFFSET $3;
            `;
            countQuery = `
                SELECT COUNT(*) FROM books
                WHERE title ILIKE $1 OR author ILIKE $1;
            `;
            queryParams = [`%${search.trim()}%`, limit, offset];
        }
        else {
            // Standardowe zapytanie z paginacją
            booksQuery = `
                SELECT * FROM books
                ORDER BY id DESC
                    LIMIT $1 OFFSET $2;
            `;
            countQuery = `SELECT COUNT(*) FROM books;`;
            queryParams = [limit, offset];
        }
        // Wykonujemy zapytanie o dane i zapytanie o licznik równolegle (szybszy czas odpowiedzi)
        const booksPromise = pool.query(booksQuery, queryParams);
        const countPromise = pool.query(countQuery, search.trim() !== '' ? [`%${search.trim()}%`] : []);
        const [booksResult, countResult] = await Promise.all([booksPromise, countPromise]);
        const totalRecords = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);
        res.json({
            success: true,
            data: booksResult.rows,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages,
            }
        });
    }
    catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        res.status(500).json({ success: false, errors: ['Wystąpił błąd serwera podczas pobierania danych.'] });
    }
});
// Uruchamiamy nasłuchiwanie tylko wtedy, gdy NIE jesteśmy w trybie testowym
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
// Eksport app, żeby Jest mógł go zaimportować w testach
export { app };
//# sourceMappingURL=index.js.map