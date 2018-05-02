var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','qwerty'));
var session = driver.session();

app.get('/',function(req,res){
    session
        .run('MATCH (n:AlimentosCongelados) RETURN n')
        .then(function(result){
            var Productos = [];
            result.records.forEach(function(records){
                Productos.push({
                    id:records._fields[0].identity.low,
                    nombre:records._fields[0].properties.Nombre,
                    cantidad:records._fields[0].properties.Cantidad,
                    precio:records._fields[0].properties.Precio
                })
            });
            session
             .run('MATCH (n:Carnes) RETURN n')
             .then(function(result2){
                var CarnesA=[];
                result2.records.forEach(function(records){
                    CarnesA.push({
                        id:records._fields[0].identity.low,
                        nombre:records._fields[0].properties.Nombre,
                        cantidad:records._fields[0].properties.Cantidad,
                        precio:records._fields[0].properties.Precio
                    })
                });
                res.render('index',{
                    productos:Productos,
                    carnes:CarnesA
                });
             })
             .catch()
            
        })
        .catch(function(err){
            console.log(err);
        });
    
})

app.post('/producto/add',function(req,res){
        var tipo =  req.body.tipo
        var nombre= req.body.nombre
        var precio= req.body.precio
        var cantidad= req.body.cantidad
        session
            .run('CREATE (x:{TipoParam} {Nombre:{nombreParam},Cantidad:{CantidadParam},Precio:{PrecioParam}}) RETURN x.nombre',{TipoParam:tipo,nombreParam:nombre,CantidadParam:precio,PrecioParam:cantidad})
            .then(function(result){
                res.redirect('/');
                session.close();
            })
            .catch(function(result){
               console.log(err);
            })
});
app.listen(3000);
console.log('servidor node port 3500');

 module.exports=app;


