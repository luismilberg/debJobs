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
        vacantesController.validarVacante,
        vacantesController.formEditarVacante);

    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.editarVacante);

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
        usuariosController.validarUsuario,
        usuariosController.editarPerfil);

    return router;
}