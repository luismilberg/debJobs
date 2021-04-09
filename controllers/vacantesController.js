const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante'
    });
}

//agrega las vacantes a la bd

exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante (req.body);

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
        barra: true
    });
}

//Editar vacante

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    if(!vacante) return next();

    res.render('editarVacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`
    })
}