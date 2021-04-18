const mongoose = require('mongoose');
const multer = require('multer');
const Usuarios = mongoose.model('Usuarios');
const shortid = require('shortid');


//Opciones de Multer
const configuracionMulter = {
    limits: {fileSize : 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, true);
        } else {
            cb(new Error('Formato de imagen no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');


exports.subirImagen = (req,res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                return next();
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;

        } else {
            return next();
        }
    });
    
}



exports.formCrearCuenta = (req,res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratos, sólo debes crear una cuenta'
    })
}

exports.crearUsuario = async (req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);

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

//editar el perfil del usuario
exports.formEditarPerfil = (req, res) => {
    const usuario = req.user.toObject();
    res.render('editarPerfil',{
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario,
        nombre: usuario.nombre,
        cerrarSesion: true
    })
}

//guardar cambios al editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);
    
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios modificados correctamente');

    //redirect
    res.redirect('/administracion');
}

exports.validarUsuario = (req, res, next) => {
    //Sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password) {
        req.sanitizeBody('password').escape();
    }

    //validar los campos
    req.checkBody('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.checkBody('email', 'El email no puede estar vacío').notEmpty();

    const errores = req.validationErrors();

    if(errores){
        const usuario = req.user.toObject();
        req.flash('error', errores.map(error => error.msg));
        res.render('editarPerfil',{
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario,
            nombre: usuario.nombre,
            cerrarSesion: true,
            mensajes: req.flash()
        })
    }

    next();
    
}