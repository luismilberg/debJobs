const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');


exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        nombre: req.user.nombre,
        cerrarSesion: true
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
    
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    //si no hay resultados next

    if(!vacante) return next();

    res.render('vacante',{
        vacante,
        nombrePagina: vacante.titulo,
        barra: true,
        // nombre: req.user.nombre, //Se comenta para permitir ver detalles de las vacantes a los usuarios no registrados
        cerrarSesion: true
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
        cerrarSesion: true
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
            mensajes: req.flash()
        })
    }
    next();
}

exports.eliminarVacante = async(req, res) => {
    const { id } = req.params;
    console.log(id);

    res.status(200).send('Vacante eliminada correctamente');
}