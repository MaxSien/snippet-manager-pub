import express, { Request, Response } from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
export const app = express();

app.use(cors());
app.use(express.json());

export const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'snippets_db',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: Number(process.env.DB_PORT) || 5432, // <--- Wewnętrzny port bazy w Dockerze to 5432
});

// GET /api/snippets - pobieranie z paginacją i szukaniem
app.get('/api/snippets', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || '';
        const category = (req.query.category as string) || '';
        const offset = (page - 1) * limit;

        let queryText = 'SELECT * FROM snippets WHERE 1=1';
        const queryParams: any[] = [];

        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (title ILIKE $${queryParams.length} OR command ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`;
        }

        if (category) {
            queryParams.push(category);
            queryText += ` AND category = $${queryParams.length}`;
        }

        queryText += ` ORDER BY id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await pool.query(queryText, queryParams);

        // Zliczanie wszystkich do paginacji
        const countResult = await pool.query('SELECT COUNT(*) FROM snippets');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Błąd serwera przy pobieraniu komend.' });
    }
});

// POST /api/snippets - dodawanie nowej komendy
app.post('/api/snippets', async (req: Request, res: Response) => {
    try {
        const { title, command, category, description } = req.body;
        const errors: string[] = [];

        if (!title || title.trim() === '') errors.push('Tytuł jest wymagany.');
        if (!command || command.trim() === '') errors.push('Komenda jest wymagana.');
        if (!category || category.trim() === '') errors.push('Kategoria jest wymagana.');

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const result = await pool.query(
            'INSERT INTO snippets (title, command, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, command, category, description || '']
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Błąd serwera przy dodawaniu komendy.' });
    }
});

// DELETE /api/snippets/:id - usuwanie komendy
app.delete('/api/snippets/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(<string>req.params.id);
        const result = await pool.query('DELETE FROM snippets WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Komenda nie została znaleziona.' });
        }

        res.json({ success: true, message: 'Komenda usunięta.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Błąd serwera przy usuwaniu.' });
    }
});

const initDb = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS snippets (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            command TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Tabela snippets jest gotowa.');
    } catch (err) {
        console.error('Błąd inicjalizacji tabeli w bazie:', err);
    }
};

// Jednorazowe uruchomienie po inicjalizacji bazy
initDb().then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Snippet Manager API running on port ${PORT}`));
});