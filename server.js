const express = require ('express');
const bodyParser = require ('body-parser');
const app= express();
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/', function(req,res){
    res.render('index');
});

app.get('/resturants/:name', function(req,res){
    var products=[{"name":'beans', "price":"500"},{"name":'rice', "price":"400"},{"name":'beans', "price":"500"}];
    res.render('menu',{products});
});

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
       });