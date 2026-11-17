import React, { useState } from 'react';
import type {Snippet} from '../types/snippet';

interface SnippetListProps {
    snippets: Snippet[];
    onSnippetDeleted: () => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({ snippets, onSnippetDeleted }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = (command: string, id: number) => {
        navigator.clipboard.writeText(command);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Czy na pewno chcesz usunąć tę komendę?')) return;

        try {
            const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
            if (res.ok) {
                onSnippetDeleted();
            }
        } catch (err) {
            console.error('Błąd usuwania:', err);
        }
    };

    // Pomocnicza funkcja do przydzielania styli etykiet
    const getCategoryClass = (cat: string) => {
        const c = cat.toLowerCase();
        if (c.includes('git')) return 'category-badge git';
        if (c.includes('docker')) return 'category-badge docker';
        if (c.includes('linux')) return 'category-badge linux';
        if (c.includes('sql')) return 'category-badge sql';
        if (c.includes('server')) return 'category-badge server';
        if (c.includes('serwer')) return 'category-badge server';
        return 'category-badge';
    };

    if (snippets.length === 0) {
        return <p style={{ textAlign: 'center', color: '#71717a', marginTop: '2rem' }}>Brak zapisanych komend.</p>;
    }

    return (
        <div className="snippet-list">
            {snippets.map((snippet) => (
                <div key={snippet.id} className="snippet-card">
                    <div className="snippet-header">
                        <h3 className="snippet-title">{snippet.title}</h3>
                        <span className={getCategoryClass(snippet.category)}>
                            {snippet.category}
                        </span>
                    </div>

                    {snippet.description && (
                        <p className="snippet-description">{snippet.description}</p>
                    )}

                    <div className="snippet-action-bar">
                        <div className="code-wrapper">
                            <pre className="code-block">
                                <code>{snippet.command}</code>
                            </pre>
                        </div>
                        <button
                            onClick={() => handleCopy(snippet.command, snippet.id)}
                            className={`copy-btn ${copiedId === snippet.id ? 'copied' : ''}`}
                        >
                            {copiedId === snippet.id ? '✓ Skopiowano' : '📋 Kopiuj'}
                        </button>
                        <button
                            onClick={() => handleDelete(snippet.id)}
                            className="delete-btn"
                            title="Usuń snippet"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};