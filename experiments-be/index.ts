import express, { Router } from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import Keycloak from 'keycloak-connect';
import KcAdminClient from '@keycloak/keycloak-admin-client';

const keycloak = new Keycloak({});
const kcAdminClient = new KcAdminClient({
  baseUrl: 'http://localhost:9090',
  realmName: 'esg',
});

const credentials = {
  grantType: 'client_credentials',
  clientId: 'esg-backend',
  clientSecret: 'xGevVXJdfwW4uPsZJwVVBkLa10Smezhl',
} as const;

kcAdminClient.auth(credentials);
setInterval(() => kcAdminClient.auth(credentials), 60 * 1000); // 60 seconds

const app = express();
app.use(keycloak.middleware());
const router = Router();
app.use(cors());
app.use(express.json());

router.get('/', (req, res) => {
  res.json({ text: 'Hello World' });
});

router.get('/protected', keycloak.protect(), (_, res) => {
  res.render('protected'); // TODO: non esiste la pagina, ma comunque non funziona il redirect a KC
});

router.post('/transactions', (req, res) => {
  const { uid } = req.body as any;
  const client = [...wss.clients].find(({ uid: clientUid }: any) => clientUid === uid);
  if (client) {
    setTimeout(() => {
      client.send('reload');
    }, 3000)
        
    res.json({ success: true })
  } else {
    res.json({ success: false })
  }
});

router.get('/users', async (_, res) => {
  try {
    const users = await kcAdminClient.users.find()
    console.log(users);
    res.json(users)
    
  } catch (error) {
    console.log(error);
  }
})

app.use(router);

const server = app.listen(5000, () => {
  console.log('Server started');
});

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    (ws as any).uid = String(data);
    console.log([...wss.clients].map(({ uid }: any) => ({ uid })));
  });
});