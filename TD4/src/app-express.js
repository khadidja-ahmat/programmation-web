import express from 'express';
import morgan from 'morgan';
import { MongoClient, ObjectId } from 'mongodb';

process.loadEnvFile();
const host = process.env.HOST;
const port = process.env.PORT;

// Connexion à MongoDB : la collection "contacts" de la base M2WEB
const client = new MongoClient(process.env.MONGO_URL);
await client.connect();
const contacts = client.db(process.env.DATABASE_NAME).collection('contacts');

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.set('view engine', 'ejs');

// Vérifie qu'un contact reçu a un nom et un âge 
function contactValide({ name, age }) {
  return typeof name === 'string' && name.trim() !== '' && Number.isInteger(age) && age >= 0;
}


app.get('/', function(req, res) {
  res.send('Hello !');
});

app.get('/home', function(req, res) {
  res.send('Maison :-)');
});

app.get('/user/:khadidja', function(req, res) {
  res.render('user', { khadidja: req.params.khadidja });
});

// ---------- API REST des contacts ----------

// Lister tous les contacts (chacun avec son _id)
app.get('/contacts', async (req, res) => {
  res.json(await contacts.find().toArray());
});

// Obtenir un contact grâce à son ID
app.get('/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  const contact = await contacts.findOne({ _id: new ObjectId(req.params.id) });
  if (!contact) {
    return res.status(404).json({ error: 'Contact introuvable' });
  }
  res.json(contact);
});

// Ajouter un contact (renvoie le contact créé)
app.post('/contacts', async (req, res) => {
  if (!contactValide(req.body)) {
    return res.status(400).json({ error: 'Un nom et un âge (entier positif) sont requis' });
  }
  const { name, age } = req.body;
  const result = await contacts.insertOne({ name, age });
  res.status(201).json({ _id: result.insertedId, name, age });
});

// Mettre à jour un contact (renvoie le contact modifié)
app.put('/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  if (!contactValide(req.body)) {
    return res.status(400).json({ error: 'Un nom et un âge (entier positif) sont requis' });
  }
  const { name, age } = req.body;
  const contact = await contacts.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { name, age } },
    { returnDocument: 'after' }
  );
  if (!contact) {
    return res.status(404).json({ error: 'Contact introuvable' });
  }
  res.json(contact);
});

// Supprimer un contact
app.delete('/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  const result = await contacts.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Contact introuvable' });
  }
  res.json({ deleted: true });
});


app.use(function(req, res) {
  res.status(404).send('Page introuvable !');
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
