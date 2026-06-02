import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = {};

const modelFiles = readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'));

for (const file of modelFiles) {
  const { default: modelDefiner } = await import(
    pathToFileURL(join(__dirname, file)).href
  );
  const model = modelDefiner(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
