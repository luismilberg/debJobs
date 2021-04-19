const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //crear vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante);

    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante);

    //Mostrar Vacante (singular)

    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //Editar vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante);
        
        router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante);

    // Eliminar vacantes
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    );

    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,  
        usuariosController.crearUsuario
    );

    // Iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Cerrar Sesión
    router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        authController.cerrarSesion);

    // Recuperar Contraseña
    router.get('/restablecer-password',
        authController.formRestablecerPassword
    );

    router.post('/restablecer-password',
        authController.enviarToken
    );

    // Recuperar Contraseña almacenar en BD
    router.get('/restablecer-password/:token', 
        authController.restablecerPassword
    );
    router.post('/restablecer-password/:token', 
        authController.guardarPassword
    );

    // Panel de administración
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel);

    //Editar el perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil);
    
    router.post('/editar-perfil', 
        authController.verificarUsuario,
        // usuariosController.validarUsuario,
        usuariosController.subirImagen,
        usuariosController.editarPerfil);

    // Recibir mensajes de candidatos

    router.post('/vacantes/:url',
        vacantesController.subirCV, //validar y subir el archivo
        vacantesController.contactar //guardar en la BD
    );

    //Muestra los Candidatos
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );

    // Buscador de vacantes
    router.post('/buscador', 
        vacantesController.buscarVacantes
    );

    return router;
}