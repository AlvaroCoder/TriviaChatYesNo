// Set up express app
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const morgan = require('morgan');
const path = require('path');
const multer = require('multer')

const { initializeApp } = require('firebase/app')
const { getDatabase, push, onValue, ref, set, update } = require('firebase/database');
const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously } = require('firebase/auth');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const { createdAtTimeStamp } = require('./utils/dateFormatter');
const { generarNumeroAleatorio } = require('./utils/generadorNumeros');

let estaElUsuarioRegistrado = false;
let dataUsuarioRegistrado = null;

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID,
    measurementId: process.env.FIREBASE_MEASUREMENTID,
    databaseURL : process.env.FIREBASE_DATABASE_URL,
};
  
const appFirebase = initializeApp(firebaseConfig);
const db = getDatabase(appFirebase);
const auth = getAuth(appFirebase);

let userCredentialData = null;
const upload = multer();

// app.use(express.static('public'));

app.use(morgan('common'));
app.use(express.urlencoded({extended:true}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    onAuthStateChanged(auth, (user)=>{
        if (user) {
            res.redirect("jugar");
            return;      
        }
        res.render('index');
    })
});


app.get('/admin',(req,res)=>{
    res.render('admin');
});

app.get('/empezar',(req,res)=>{
    res.render("empezar")
});
app.post('/crear-partida',async(req,res)=>{
    const partidaRef = ref(db, 'partidas/');
    const idPartida = uuidv4().split('-').join("");
    const dataToSend = {
        idPartida,
        estado : 'activo'
    }
    await set(partidaRef,{
        data  : dataToSend
    }).then(()=>{
        res.redirect('partidas-panel?exito=true');
        res.end();
    }).catch(()=>{
        res.redirect('partidas-panel?exito=false')
    })
})
app.post('/registrar-competidor',upload.none(),async(req,res)=>{
    const body = req.body;
    const username = body.username;
    const avatar = body.avatar;
    const ususarioRef = ref(db,'usuarios/')
    try {
        await signInAnonymously(auth)
        .then(resp=>{
            const idUsuario = resp.user.uid;
            const dataToSend = {usuario : username, avatar, idUsuario }
            userCredentialData = dataToSend;
            push(ususarioRef,dataToSend)
            console.log("Logeado");
            res.redirect('jugar')
            res.end();
        })
        .catch(err=>{
            console.log(err);
        })
    } catch (err) {
        console.log(err);
    }

});

app.get('/seleccionar-pregunta',async(req,res)=>{
    const posSeleccionado = req.query.numeroSeleccionado;
    const preguntasRef = ref(db, 'preguntas/');
    onValue(preguntasRef, async(snapshot)=>{
        const data = snapshot.val();
        const listaPreguntas =data ? Object.values(data): [];
        const preguntaSeleccionada = listaPreguntas[posSeleccionado];
        const listaLlaves = data ? Object.keys(data) : [];
        const llaveSeleccionada = listaLlaves[posSeleccionado];

        const llaveRef = ref(db, `preguntas/${llaveSeleccionada}`)
        const dataToSend = {
            ...preguntaSeleccionada,
            seleccionado : true
        }
        await update(llaveRef,dataToSend);
    })
    res.send("ok");
})

app.get('/jugar',(req,res)=>{

    try {
        onAuthStateChanged(auth,(user)=>{
            if (user) {
                console.log(user);
                const preguntasRef = ref(db, 'preguntas/');
                onValue(preguntasRef, snapshot=>{
                    const data = snapshot.val();
                    const listaMensajes =data ? Object.values(data): [];
                    const preguntaSeleccionada =  listaMensajes.filter(item=>item.seleccionado)[0];
                    console.log(preguntaSeleccionada);
                    res.render('chatpanel',{data : preguntaSeleccionada});
                    res.end()
                });
                return;
            }
            res.send("Aún no te has logeado");
            res.end()
    
        })
    } catch (err) {
        console.log(err);
    }
})

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

app.post('/enviar-mensaje',async(req,res)=>{
    const mensajesRef = ref(db, 'mensajes/');
    try {
        
    } catch (err) {
        
    }
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
app.get('/usuarios-panel',async(req,res)=>{
    const usuariosRef = ref(db, 'usuarios/')
    try {
        onValue(usuariosRef, snapshot=>{
            const data = snapshot.val();
            const listaUsuarios = Object.values(data);
            res.render('userpanel',{data:listaUsuarios});
            res.end();
        })
    } catch (err) {
        throw err
    }
});
app.get('/partidas-panel',async(req,res)=>{
    const partidasRef = ref(db, 'partidas/');
    try {
        onValue(partidasRef, snapshot=>{
            const data = snapshot.val();
            const listaPartidas = data ? Object.values(data): [];
            res.render('partidaspanel',{data : listaPartidas});
            res.end()
        })
    } catch (err) {
        throw err;
    }
})
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