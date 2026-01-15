import app from './app';
import { initDatabase } from './config/database';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3001;

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser la base de données
initDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 API disponible sur http://localhost:${PORT}/api`);
  console.log(`Routes enregistrées:`);
  console.log(`  - GET  /api/rooms`);
  console.log(`  - POST /api/rooms`);
  console.log(`  - GET  /api/rooms/:id`);
  console.log(`  - DELETE /api/rooms/:id`);
});
