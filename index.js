// Set up express app
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 8085;
const morgan = require('morgan');
const path = require('path');

const { initializeApp } = require('firebase/app')
const { getDatabase, push, onValue, ref } = require('firebase/database');
const { getAuth, onAuthStateChanged, signInWithEmailAndPassword } = require('firebase/auth');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const { createdAtTimeStamp } = require('./utils/dateFormatter');

const firebaseConfig = {
    apiKey: "AIzaSyBI9IxAtUfAVxFcUs1uTbOF86ChtSNypsE",
    authDomain: "triviachatapp.firebaseapp.com",
    projectId: "triviachatapp",
    storageBucket: "triviachatapp.appspot.com",
    messagingSenderId: "98171997455",
    appId: "1:98171997455:web:aee71235655f4212fcc27a",
    measurementId: "G-Z8R8M1LRVE",
    databaseURL : "https://triviachatapp-default-rtdb.firebaseio.com/",
};
  
const appFirebase = initializeApp(firebaseConfig);
const db = getDatabase(appFirebase);
const auth = getAuth(appFirebase);

function crearUsuarioPorNombredeUsuario(nombredeUsuario, avatar) {
    const dataToSend = {
        idUsuario : uuidv4().split("-").join(""),
        nombredeUsuario,
        avatar
    }
}
let userCredentialData = null;
// app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.urlencoded({extended:true}))


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register',(req,res)=>{
    
})

app.get('/admin',(req,res)=>{
    res.render('admin');
});

app.post('/signin-admin',async(req,res)=>{
    const {email, password} = req.body;

    await signInWithEmailAndPassword(auth, email, password)
    .then(userCredential=>{
        userCredentialData = userCredential.user;
        res.redirect('/admin-panel')
    })
    .catch(err=>{
        console.log(err);
        res.redirect('/admin?error=1')
    })
});

app.get('/admin-panel',async(req,res)=>{
    const preguntasRef = ref(db, 'preguntas/');
    try {
        onValue(preguntasRef, snapshot=>{
            const data = snapshot.val();
            const listaPreguntas = Object.values(data);
            res.render('adminpanel',{data : listaPreguntas});
            res.end();
        });
    } catch (err) {
        console.log(err);
    }
});
app.post('/save-question',(req,res)=>{
    const {nombrePregunta, respuesta, imagen} = req.body;
    const fechaCreacion = createdAtTimeStamp();
    const dataToSend = {
        nombrePregunta,
        respuesta,
        imagen,
        fechaCreacion
    }
    try {
        push(ref(db, 'preguntas/'),dataToSend)
        .then((_)=>{
            res.redirect('/admin-panel?exito=true');
            res.end();
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/admin-panel?exito=false');
            res.end();    
        })
    } catch (err) {
        console.log(err);
    }
});
app.listen(PORT,(err)=>{
    console.log("Server running");
    if (err) {
        throw err   
    }
})