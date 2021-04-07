exports.mostrarTrabajos = (req, res) => {
    res.render('home', {
        nombrePagina: 'devJobs',
        tagLine: 'Encuentra y publica trabajos para desarrolladores webs',
        barra: true,
        boton: true
    });
}