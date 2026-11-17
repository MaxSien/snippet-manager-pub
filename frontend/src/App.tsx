import { useState, useEffect } from 'react';
import type { Snippet } from './types/snippet';
import { SnippetForm } from './components/SnippetForm';
import { SnippetList } from './components/SnippetList';
import './App.css';

export function App() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [search, setSearch] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshData = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        let isMounted = true;

        const loadSnippets = async () => {
            try {
                const res = await fetch(`/api/snippets?search=${encodeURIComponent(search)}`);
                const data = await res.json();
                if (data.success && isMounted) {
                    setSnippets(data.data);
                }
            } catch (err) {
                console.error('Błąd przy pobieraniu komend:', err);
            }
        };

        void loadSnippets();

        return () => {
            isMounted = false;
        };
    }, [search, refreshTrigger]);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>⚡ Command Snippet Manager</h1>
                <p>Osobiste repozytorium Twoich codziennych komend</p>
            </header>

            {/* Wyszukiwarka */}
            <input
                type="text"
                placeholder="🔍 Szukaj komendy, kategorii lub opisu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />

            <SnippetForm onSnippetAdded={refreshData} />
            <SnippetList snippets={snippets} onSnippetDeleted={refreshData} />
        </div>
    );
}

export default App;