const passport = require('passport');
const mongoose = require('mongoose');
const Vacantes = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Verificar si el usuario está autenticado
exports.verificarUsuario = (req, res, next) => {
    // revisar el usuario
    if(req.isAuthenticated()){ //método de passport
        return next(); //están autenticados
    }

    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {

    const vacantes = await Vacantes.find({autor: req.user._id}).lean();
    

    res.render('administracion', {
        nombrePagina: 'Panel de administracion',
        tagline: 'Crea y administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    });
}

exports.cerrarSesion = (req,res) => {
    req.logout();
    req.flash('correcto', 'Sesión cerrada correctamente');
    return res.redirect('/iniciar-sesion');
}

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecerPassword', {
        nombrePagina: 'Restablece tu Password',
        tagline: 'Si tienes una cuenta pero olvidaste tu password coloca tu email'
    })
}

// Generar el token en la tabla del usuario 

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // Si el usuario existe generar el token 
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    // Enviar notificación por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion');
}

// Valida si el token es válido y el usuario existente

exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: { 
            $gt: Date.now()
        }
    });
    if(!usuario) {
        req.flash('error', 'El link no es válido');
        res.redirect('/restablecer-password'); 
    }

    res.render('nuevoPassword', {
        nombrePagina: 'Nuevo password'
    })
}

exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: { 
            $gt: Date.now()
        }
    });

    if(!usuario){
        req.flash('error', 'El link no es válido');
        res.redirect('/restablecer-password');
    }


    // Asignar nuevo password y limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // Almacenar el nuevo usuario
    await usuario.save();

    req.flash('correcto', 'Password modificada correctamente');
    res.redirect('/iniciar-sesion');
}