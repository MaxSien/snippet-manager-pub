import React, { useState } from 'react';
import type {CreateSnippetDTO} from '../types/snippet';

interface SnippetFormProps {
    onSnippetAdded: () => void;
}

export const SnippetForm: React.FC<SnippetFormProps> = ({ onSnippetAdded }) => {
    const [title, setTitle] = useState('');
    const [command, setCommand] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const newSnippet: CreateSnippetDTO = { title, command, category, description };

        try {
            const res = await fetch('/api/snippets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSnippet),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setTitle('');
                setCommand('');
                setCategory('');
                setDescription('');
                onSnippetAdded();
            } else {
                setError(data.errors?.join(', ') || 'Błąd zapisu komendy.');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem.');
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-card">
            <h3 className="form-title">➕ Dodaj nową komendę</h3>
            {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            <div className="form-inputs">
                <input
                    type="text"
                    placeholder="Tytuł (np. Git Hard Reset)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Komenda (np. git reset --hard HEAD)"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    required
                    className="form-input code-style"
                />
                <input
                    type="text"
                    placeholder="Kategoria (np. Git, Docker, Linux)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Opis / Notatka (opcjonalnie)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                />
                <button type="submit" className="submit-btn">
                    Zapisz komendę
                </button>
            </div>
        </form>
    );
};