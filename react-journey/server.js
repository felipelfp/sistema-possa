const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        objectives: [],
        debts: [],
        transactions: [],
        tasks: [],
        settings: {}
    }));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.split('/').filter(p => p !== '');
        
        if (pathParts[0] !== 'api') {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const resource = pathParts[1];
        const id = pathParts[2];
        const db = readDB();

        res.setHeader('Content-Type', 'application/json');

        if (!db[resource]) {
             if (resource !== 'settings') {
                 res.writeHead(404);
                 res.end(JSON.stringify({ error: 'Resource not found' }));
                 return;
             }
        }

        if (req.method === 'GET') {
            if (resource === 'settings') {
                res.writeHead(200);
                res.end(JSON.stringify(db.settings || {}));
            } else if (id) {
                const item = db[resource].find(item => item.id == id);
                if (item) {
                    res.writeHead(200);
                    res.end(JSON.stringify(item));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(db[resource]));
            }
        } else if (req.method === 'POST') {
            if (resource === 'settings') {
                 // skip
            } else {
                const newItem = JSON.parse(body);
                if (!newItem.id) newItem.id = Date.now().toString() + Math.random().toString().slice(2, 6);
                db[resource].push(newItem);
                writeDB(db);
                res.writeHead(201);
                res.end(JSON.stringify(newItem));
            }
        } else if (req.method === 'PUT') {
            if (resource === 'settings') {
                db.settings = { ...db.settings, ...JSON.parse(body) };
                writeDB(db);
                res.writeHead(200);
                res.end(JSON.stringify(db.settings));
            } else if (id) {
                const updatedItem = JSON.parse(body);
                const index = db[resource].findIndex(item => item.id == id);
                if (index !== -1) {
                    db[resource][index] = { ...db[resource][index], ...updatedItem };
                    writeDB(db);
                    res.writeHead(200);
                    res.end(JSON.stringify(db[resource][index]));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
            }
        } else if (req.method === 'DELETE') {
            if (id) {
                const index = db[resource].findIndex(item => item.id == id);
                if (index !== -1) {
                    db[resource].splice(index, 1);
                    writeDB(db);
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
            }
        }
    });
});

const PORT = process.env.PORT || 5011;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Portátil Backend (Local Database) rodando na porta ${PORT}`);
});
