const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        nombre: req.user.nombre,
        cerrarSesion: true,
        imagen: req.user.imagen
    });
}

//agrega las vacantes a la bd

exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante (req.body);

    //usuario creador de la vacante
    vacante.autor = req.user._id;

    //crear el arreglo de skills

    vacante.skills = req.body.skills.split(',');

   //almacenar en la base de datos

   const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

//muestra una vacante individualmente
exports.mostrarVacante = async (req,res, next) => {
    
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor');

    //si no hay resultados next

    if(!vacante) return next();

    res.render('vacante',{
        vacante: vacante.toObject(),
        nombrePagina: vacante.titulo,
        barra: true,
        // nombre: req.user.nombre, //Se comenta para permitir ver detalles de las vacantes a los usuarios no registrados
        cerrarSesion: true,
        imagen: req.user.imagen
    });
}

//Editar vacante

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    if(!vacante) return next();

    res.render('editarVacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        nombre: req.user.nombre,
        cerrarSesion: true,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada,{
        new: true,
        runValidators: true,
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y sanitizar los campos de las vacantes
exports.validarVacante = (req, res, next) => {

    // Sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    //validar
    req.checkBody('titulo', 'Agrega un título a la vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una empresa a la vacante').notEmpty();
    req.checkBody('ubicacion', 'Agrega una ubicación a la vacante').notEmpty();
    req.checkBody('contrato', 'Selecciona el tipo de contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores){
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            nombre: req.user.nombre,
            cerrarSesion: true,
            mensajes: req.flash(),
            imagen: req.user.imagen
        })
    }
    next();
}

exports.eliminarVacante = async(req, res) => {
    const { id } = req.params;
    
    const vacante = await Vacante.findById(id);
    
    if(verificarAutor(vacante, req.user)){
        //ok es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante eliminada correctamente');
    } else {
        // no permitido 
        res.status(403).send('Error');
    }

}
const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
}

//Subir archivos en pdf

const configuracionMulter = {
    limits: { fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf'){
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es demasiado grande');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

//Almacenar los candidatos en la base de datos
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});

    if(!vacante){
        return next();
    }

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    

    //Almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redireccionar
    req.flash('correcto', 'Se envió tu CV correctamente');
    res.redirect('/');
}