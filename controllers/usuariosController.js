const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuarios');

exports.formCrearCuenta = (req,res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratos, sólo debes crear una cuenta'
    })
}

exports.crearUsuario = async (req, res, next) => {
    //crear el usuario
    const usuario = new Usuario(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }


}

exports.validarRegistro = (req, res, next) => {

    //sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    //validar
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser válido').isEmail();
    req.checkBody('password', 'El password no puede estar vacío').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede estar vacío').notEmpty();
    req.checkBody('confirmar', 'El password no coincide').equals(req.body.password);


    const errores = req.validationErrors();

    if(errores){
        //si hay errores
        req.flash('error', errores.map(error => error.msg));
        res.render('crearCuenta', {
            nombrePagina: 'Crea tu cuenta en DevJobs',
            tagline: 'Comienza a publicar tus vacantes gratos, sólo debes crear una cuenta',
            mensajes: req.flash()
        });
        return;
    }
    //si toda la validación es correcta
    next();
}


//formulario para iniciar sesión
exports.formIniciarSesion = (req,res) => {
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar Sesión DevJobs'
    });
}