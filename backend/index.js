// backend/index.js
const fastify = require('fastify')({ logger: true });
const path = require('path');
const sqlite = require('sqlite');
const sqliteDriver = require('sqlite3');

let db;

// --- Database Initialization ---
fastify.addHook('onReady', async () => {
    try {
        // Initialize the database connection
        db = await sqlite.open({
            filename: './groweditor.sqlite',
            driver: sqliteDriver.Database
        });

        // 1. Create the documents table if it doesn't exist.
        await db.run(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,          -- Full Tiptap JSON for the title component
                titleText TEXT UNIQUE,      -- Plain text extracted title for document listing (NOW UNIQUE)
                header TEXT,         -- JSON string for bigIdea, bible, about
                sections TEXT,       -- JSON string for the main sections array
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 2. Database Migration Step A: Safely add the titleText column if it doesn't exist
        try {
            await db.run(`ALTER TABLE documents ADD COLUMN titleText TEXT`);
            fastify.log.info('Database Migration: Added titleText column.');
        } catch (e) {
            // This is expected if the column already exists ("duplicate column name: titleText")
            if (!e.message.includes('duplicate column name')) {
                throw e; // Re-throw any other unexpected error
            }
        }

        // 3. Database Migration Step B: Ensure the UNIQUE index exists on titleText.
        try {
            await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_titleText ON documents (titleText)`);
            fastify.log.info('Database Migration: Ensured UNIQUE index on titleText.');
        } catch (e) {
            fastify.log.warn('Database Warning: Could not create unique index on titleText. Overwrite logic may fail for duplicate titles.', e.message);
        }

        fastify.log.info('Database initialized and documents table ready.');
    } catch (error) {
        fastify.log.error('Database initialization failed:', error);
        throw error;
    }
});

// --- Static File Server ---
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../frontend/dist'),
    prefix: '/',
});

// --- API Routes ---

/**
 * POST /api/save
 * Saves the entire document content to the database.
 * Uses INSERT ... ON CONFLICT (titleText) DO UPDATE to overwrite existing documents.
 */
fastify.post('/api/save', async (request, reply) => {
    try {
        // Ensure both titleText (for listing) and title (for full content) are saved
        const { title, titleText, header, sections } = request.body;
        
        // Ensure header and sections are stored as JSON strings
        const headerJson = JSON.stringify(header);
        const sectionsJson = JSON.stringify(sections);

        // SQL using ON CONFLICT (titleText) DO UPDATE to implement the overwrite logic.
        // 'excluded' refers to the row that would have been inserted.
        const sql = `
            INSERT INTO documents (title, titleText, header, sections) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT (titleText) DO UPDATE SET
                title = excluded.title,
                header = excluded.header,
                sections = excluded.sections,
                created_at = datetime('now') -- Update timestamp to show last save time
        `;

        const result = await db.run(
            sql,
            [JSON.stringify(title), titleText, headerJson, sectionsJson]
        );

        // result.changes will be 1 for both a new insert and an update/overwrite
        return { changes: result.changes, message: 'Document saved or overwritten successfully.' };
    } catch (error) {
        fastify.log.error('Database INSERT/UPDATE error during save:', error);
        reply.code(500).send({ error: 'Failed to save document.' });
    }
});

/**
 * GET /api/documents
 * Retrieves a list of all saved documents (ID, TitleText, Date) for display in the Load dialog.
 */
fastify.get('/api/documents', async (request, reply) => {
    try {
        // This query now relies on the migration step completing successfully
        const documents = await db.all(
            `SELECT id, titleText, created_at FROM documents ORDER BY created_at DESC`
        );
        return documents;
    } catch (error) {
        fastify.log.error('Database SELECT error for document list:', error);
        reply.code(500).send({ error: 'Failed to retrieve document list.' });
    }
});

/**
 * GET /api/documents/:id
 * Retrieves the full content of a single document by ID.
 */
fastify.get('/api/documents/:id', async (request, reply) => {
    try {
        const { id } = request.params;
        const document = await db.get(
            `SELECT * FROM documents WHERE id = ?`,
            [id]
        );

        if (!document) {
            return reply.code(404).send({ error: 'Document not found.' });
        }

        // Parse JSON strings back into objects before sending to frontend
        return {
            ...document,
            title: JSON.parse(document.title),
            header: JSON.parse(document.header),
            sections: JSON.parse(document.sections),
        };

    } catch (error) {
        fastify.log.error(`Database SELECT error for document ID ${request.params.id}:`, error);
        reply.code(500).send({ error: 'Failed to retrieve document content.' });
    }
});

/**
 * DELETE /api/documents/:id
 * Deletes a single document by ID from the database.
 */
fastify.delete('/api/documents/:id', async (request, reply) => {
    try {
        const { id } = request.params;
        const result = await db.run(
            `DELETE FROM documents WHERE id = ?`,
            [id]
        );

        if (result.changes === 0) {
            return reply.code(404).send({ message: 'Document not found for deletion.' });
        }

        return { message: `Document ID ${id} deleted successfully.` };
    } catch (error) {
        fastify.log.error(`Database DELETE error for document ID ${request.params.id}:`, error);
        reply.code(500).send({ error: 'Failed to delete document.' });
    }
});


// --- Vue Router History Mode Handler ---
fastify.setNotFoundHandler((request, reply) => {
    // Exclude API routes from this catch-all handler
    if (request.raw.url && request.raw.url.startsWith('/api')) {
        reply.code(404).send({ error: 'Not Found' });
        return;
    }
    // Serve the main entry point for the Vue app
    reply.sendFile('index.html');
});

// --- Server Start ---
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port: port, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
