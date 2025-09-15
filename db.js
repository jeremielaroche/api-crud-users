const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const open = sqlite.open;

// Ouverture connexion
async function openDb() {
    return open({
        filename: "./database.db",
        driver: sqlite3.Database
    });
}

module.exports = { openDb };
