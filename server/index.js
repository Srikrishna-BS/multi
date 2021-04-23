const keys = require('./keys');

//Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors =require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgress client setup 
const{Pool}= require('pg');
const pgClient = new Pool({
    user:keys.pguser,
    host:keys.pghost,
    database:keys.pgdatabase,
    password:keys.pgpass,
    port:keys.pgport
});

pgClient.on('error', () => console.log('Lost PG COnnection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT').catch(err =>console.log(err));

//REDIS client setup

const redis= require('./redis');
const redisClient =redis.createClient({
    host=keys.redisHost,
    port=keys.redisPort,
    redis_strategy: ()=>1000
});
const redisPublisher = redisClient.duplicate();

app.get('/',(req,res)=> {
    res.send('Hi ');
});

app.get('/values/all', async (req,res)=>{
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req,res)=>{
    redisClient.hgetall('values', (err, values)=> {
        res.send(values);
    });
});

app.papp.get('/values', async (req,res)=>{
    const index = req.body.index;
    if (parseInt(index)>40){
        return res.status(422).send('index too high');
    }
    redisClient.hset('values',index,'Nothing yet!' );
    redisPublisher.publish('insert','index');
    pgClient.query('INSERT INTO values(numbers) VALUES($1),[index]');
    res.send({working:true});
    });

    app.listen(5000, err =>{
        console.log('Listening');
    });