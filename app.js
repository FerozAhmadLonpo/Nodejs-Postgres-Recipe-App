const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cons = require('consolidate');
const dust = require('dustjs-helpers');
const pg = require('pg');

app = express();

// DB Connect String
let connect = "postgres://feroz:superuser@localhost/recipebookdb";

//Assign Dust Engine To .dust files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const config = {
  user: 'feroz',
  database: 'recipebookdb',
  password: 'superuser',
  port: 5432                  //Default port, change it if needed
};

// pool takes the object above -config- as parameter
const pool = new pg.Pool(config);

app.get('/', (req, res, next) => {
  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    client.query('SELECT * FROM recipes', function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.render('index', { recipes: result.rows });
      done();
    })
  })
});

app.post('/add', (req, res)=>{
  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    client.query("INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)", [req.body.name, req.body.ingredients, req.body.directions]);

    done();
    res.redirect('/');
  });
});

app.delete('/delete/:id',(req, res)=>{
  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    client.query("DELETE FROM recipes WHERE id = $1", [req.params.id]);

    done();
    res.send(200);
  });
});

app.post('/edit',(req, res)=>{
  pool.connect(function (err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    client.query("UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4" , [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);

    done();
    res.redirect('/');
  });
});
// Server
app.listen(3000, () => {
  console.log('Server Started On Port 3000')
});