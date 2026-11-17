# ⚡ Command Snippet Manager

**Autor:** Maksymilian Sienkiewicz
**Rola:** Full-Stack / Front-end Developer

Nowoczesna, szybka i zkonteneryzowana aplikacja internetowa typu Full-Stack, stworzona do przechowywania, organizowania i szybkiego kopiowania codziennych komend terminala oraz fragmentów kodu. Posiada ciemny motyw graficzny (Dark Mode), automatyczne dopasowanie kolorów kategorii, dynamiczne wyszukiwanie oraz paginację po stronie serwera.

---

## 🛠️ Stos Technologiczny (Tech Stack)

### Backend
* **Środowisko:** Node.js (v18+)
* **Język:** TypeScript 5+ (Pełny tryb **ESM / `nodenext`**)
* **Framework:** Express.js
* **Baza Danych:** PostgreSQL 15+ (Klient `pg` pool)
* **Testy:** Jest + Supertest (Natywne testy integracyjne z mockowaniem bazy)

### Frontend
* **Framework:** React 18+
* **Narzędzie Budowania:** Vite
* **Język:** TypeScript
* **Stylizowanie:** CSS3 (Nowoczesny dark-mode, neonowe etykiety kategorii, responsywność)

### Infrastruktura i Wdrożenie
* **Konteneryzacja:** Docker & Docker Compose
* **Serwer HTTP / Reverse Proxy:** Nginx (alpine)
* **Menedżer Procesów (bez Dockera):** PM2

---

## 🚀 Szybki Start

### Wymagania wstępne
* [Node.js](https://nodejs.org/) (wersja 18 lub wyższa)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) lub zainstalowany silnik Docker z wtyczką Compose.

---

### Opcja A: Pełne Środowisko Kontenerowe (Docker Compose)

Uruchomienie kompletnego stosu aplikacji (Baza danych + Express API + React serwowany przez Nginx) jedną komendą:

1. Sklonuj repozytorium i stwórz plik konfiguracyjny w korzeniu projektu:
   ```bash
   git clone https://github.com/TwojUser/snippet-manager.git
   cd snippet-manager
   ```

2. Utwórz plik `.env` w głównym katalogu projektu:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=Your_Password_Here
   POSTGRES_DB=snippets_db

   BACKEND_PORT=5001
   FRONTEND_PORT=80
   ```

3. Zbuduj i uruchom kontenery w tle:
   ```bash
   docker compose up -d --build
   ```

4. Otwórz przeglądarkę i wejdź pod adres:
   * **Aplikacja WWW:** `http://localhost` (lub port podany w `FRONTEND_PORT`, np. `http://localhost:81`)
   * **Zewnętrzny Dostęp do Bazy:** `localhost:5000` (dla programów typu WebStorm, DBeaver czy TablePlus).

---

### Opcja B: Tryb Deweloperski (Hot-Reloading)

Jeśli chcesz wprowadzać zmiany w kodzie na żywo bez ciągłego przebudowywania obrazów Dockerowych:

1. **Uruchom tylko kontener z bazą danych PostgreSQL:**
   ```bash
   docker compose up db -d
   ```

2. **Konfiguracja i Start Backendu:**
   Utwórz plik `backend/.env`:
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_PORT=5000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=Your_Password_Here
   POSTGRES_DB=snippets_db
   ```
   Uruchom serwer deweloperski backendu:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontendu:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Aplikacja otworzy się w trybie deweloperskim pod adresem `http://localhost:5173`.

---

## 🧪 Testy Automatyczne

Aplikacja umożliwia przetestowanie logiki biznesowej oraz walidacji API na backendzie bez konieczności uruchamiania bazy danych czy Dockera:

```bash
cd backend
npm install
npm test
```
> **Uwaga:** Testy korzystają z natywnych modułów ECMAScript (`--experimental-vm-modules`).

---

## 🗄️ Struktura Bazy Danych & Automatyczna Inicjalizacja

Backend posiada wbudowany mechanizm automatycznej inicjalizacji struktury tabeli (`CREATE TABLE IF NOT EXISTS`) podczas startu serwera. Poniżej znajduje się czysty schemat SQL:

```sql
CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    command TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy wydajnościowe dla wyszukiwania i filtrowania po kategoriach
CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category);
CREATE INDEX IF NOT EXISTS idx_snippets_title ON snippets(title);
```

### Przykładowy Seeding (Test Wydajnościowy)
Aby wygenerować 1000 losowych komend i przetestować działanie paginacji:

```sql
INSERT INTO snippets (title, command, category, description)
SELECT
    'Komenda CLI #' || i AS title,
    'docker exec -it container_' || i || ' sh' AS command,
    (ARRAY['Git', 'Docker', 'Linux', 'SQL', 'Server'])[floor(random() * 5 + 1)] AS category,
    'Wygenerowany opis komendy testowej ' || i AS description
FROM generate_series(1, 1000) s(i);
```

---

## 🖥️ Wdrożenie Produkcyjne Bez Dockera (Ubuntu / Debian / Home Server)

Jeśli chcesz odpalić aplikację na własnym serwerze bez użycia kontenerów:

1. **Baza Danych:** Zainstaluj pakiet `postgresql`, utwórz bazę `snippets_db`, użytkownika `postgres` oraz przyznaj uprawnienia do schematu.
2. **Backend:** Skompiluj TypeScript (`npm run build`) i uruchom w tle za pomocą PM2:
   ```bash
   cd backend
   npm install && npm run build
   pm2 start dist/index.js --name "snippet-backend"
   pm2 save
   ```
3. **Frontend:** Zbuduj pliki statyczne Reacta:
   ```bash
   cd frontend
   npm install && npm run build
   ```
4. **Nginx:** Skonfiguruj Nginxa tak, aby serwował wygenerowany katalog `frontend/dist` na porcie 80, a zapytania z przedrostkiem `/api/` przekierowywał jako proxy pod `http://localhost:5001/api/`.

---

## 🛡️ Bezpieczeństwo i Architektura

* **Względne Ścieżki API:** Frontend wysyła zapytania pod ścieżkę względną `/api/snippets`, eliminując problemy z CORS po przejściu przez Nginx.
* **Ochrona przed SQL Injection:** Wszystkie zapytania do bazy danych korzystają z parametrów wiązanych (`$1, $2`).
* **Izolacja Konfiguracji:** Dane wrażliwe są odseparowane i zarządzane wyłącznie przez pliki `.env`.