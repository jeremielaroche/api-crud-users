const express = require("express");
const { openDb } = require("./db.js");

async function initDb() {
    const db = await openDb();
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    )
  `);
}
initDb();

const app = express();
app.use(express.json());

// Renvoyer tous les users
app.get("/users", async (req, res) => {
    const db = await openDb();
    const users = await db.all("SELECT * FROM users");
    res.status(200).json(users);
});

// Renvoyer un user
app.get("/user/:id", async (req, res) => {
    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE id = ? ", [req.params.id]);
    if (!user) { res.status(404).json({ error: "User not found" }) }
    else { res.status(200).json(user) };
});

// Ajouter un user
app.post("/users", async (req, res) => {

    const { name, email } = req.body;
    if (!name || !email) { res.status(400).json({ error: "name and email required" }) };

    const db = await openDb();

    try {
        const newUser = await db.run("INSERT INTO users (name,email) VALUES (?,?)", [name, email]);
        res.status(201).json({ id: newUser.lastID, name, email });
    } catch (err) {
        res.status(400).json({ error: "email already exists" })
    }

});

// Modifier un user
app.put("/user/:id", async (req, res) => {

    const { name, email } = req.body;
    const db = await openDb();

    await db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.params.id]);
    res.status(200).json({ id : req.params.id, name, email });

});

// Supprimer un user
app.delete("/user/:id", async (req, res) => {
    const db = await openDb();
    await db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.status(204).end();
});

// Middleware global pour gérer les erreurs 500
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3008, () => console.log("API running on http://localhost:3008"));
