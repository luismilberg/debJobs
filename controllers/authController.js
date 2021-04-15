const passport = require('passport');
const mongoose = require('mongoose');
const Vacantes = mongoose.model('Vacante');

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
        vacantes
    });
}

exports.cerrarSesion = (req,res) => {
    req.logout();
    req.flash('correcto', 'Sesión cerrada correctamente');
    return res.redirect('/iniciar-sesion');
}