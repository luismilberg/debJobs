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
    
    const nuevoUsuario = usuario.save();
    if(!nuevoUsuario) return next();

    res.redirect('/iniciar-sesion');

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
        
    }
    //si toda la validación es correcta
    next();
}