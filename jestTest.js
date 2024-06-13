// databaseService.test.js
const { Database } = require('../database');
const { RegistrazioneController, LoginController, ContenutoController, RecensioneController, ValutazioneController } = require('../controllers'); 

let db;
let utenteControl;
let modControl;
let ospiteControl;
let loginControl;

let regControl;
let contenutoControl;
let recensioneControl;
let valutazioneControl;
let filtro;

beforeEach(() => {
  // Configurazione del mock database e dei controller prima di ogni test
  db = new Database();

  utenteControl = new UtenteController(db);
  modControl = new ModeratoreController(db);
  ospiteControl = new OspiteControl(db);
  loginControl = new LoginController(db);

  regControl = new RegistrazioneController(ospiteControl);
  contenutoControl = new ContenutoController(utenteControl);
  recensioneControl = new RecensioneController(utenteControl);
  valutazioneControl = new ValutazioneController(utenteControl);
  filtro = new FiltroPost(utenteControl);

  // Registra un nuovo utente
  regControl.registraUtente("test@user.com", "testUser", "password");
  // Aggiungi un nuovo contenuto
  contenutoControl.aggiungiContenuto("Title", "Description");
  // Aggiungi una nuova recensione
  recensioneControl.scriviRecensione("ContentTitle", 10, "ReviewText");
  // Aggiungi un nuovo commento alla recensione
  valutazioneControl.aggiungiCommento(recensioneControl.getReviews()[0].id, "CommentText");
  // Segnala un oggetto del database
  utenteControl.segnala(recensioneControl.getReviews()[0].id, "ReportText");
  // Aggiungi un termine bloccato
  modControl.aggiungiTermineBloccato("Python");
});

test('Register User', () => {
  // Verifica che l'utente sia stato registrato correttamente
  expect(regControl.getUsers().length).toBe(1);
  expect(regControl.getUsers()[0].username).toBe("testUser");
});

test('Login User', () => {
  // Verifica che l'utente possa effettuare il login con le credenziali corrette
  expect(loginControl.verificaCredenziali("testUser", "password")).toBe(true);
  // Verifica che il login fallisca con una password errata
  expect(loginControl.verificaCredenziali("testUser", "wrongpassword")).toBe(false);
  // Verifica che il login fallisca con un nome utente errato
  expect(loginControl.verificaCredenziali("wrongUser", "password")).toBe(false);
});

test('Add Content', () => {
  // Verifica che il contenuto sia stato aggiunto correttamente
  expect(contenutoControl.getContents().length).toBe(1);
  expect(contenutoControl.getContents()[0].title).toBe("Title");
});

test('Add Review', () => {
  // Verifica che la recensione sia stata aggiunta correttamente
  expect(recensioneControl.getReviews().length).toBe(1);
  expect(recensioneControl.getReviews()[0].reviewText).toBe("ReviewText");
  expect(recensioneControl.getReviews()[0].score).toBe(10);

  // Verifica che addReview ritorni falso se il punteggio è fuori dai limiti
  
});

test('Add Comment', () => {
  // Verifica che il commento sia stato aggiunto correttamente alla recensione
  expect(recensioneControl.getReviews()[0].comments.length).toBe(1);
  expect(recensioneControl.getReviews()[0].comments[0].commentText).toBe("CommentText");
});

test('Segnalazione ', () => {
  // Verifica che la segnalazione sia inviata e leggibile
  expect(modControl.getSegnalazioni().size).toBe(1);
  expect(modControl.getSegnalazioni()[0].getMotivazione()).toBe("ReportText");
});

test('Filtro ', () => {
  // Verifica che il termine sia stato aggiunto alla lista di termini bloccati e che fermi le recensioni prima che siano aggiunte al sistema
  expect(modControl.getTerminiBloccati().length).toBe(1);
  expect(modControl.getTerminiBloccati()[0]).toBe("Python");

  // Verifica che il filtro blocchi le recensioni che contengono termini offensivi
  expect(recensioneControl.addReview("ContentTitle", 10, "Python è il miglior linguaggio del mondo!")).toBeFalsy();
});
