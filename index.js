const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var cors = require('cors')
require('dotenv').config()
const port = 5000
const MongoClient = require('mongodb').MongoClient;
const  ObjectId  = require('mongodb').ObjectID
const uri = "mongodb+srv://freshValleyShop:4BtNAn8uChvN72LZ@cluster0.nj4m0.mongodb.net/freshValleyDB?retryWrites=true&w=majority";
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(bodyParser.json())
app.use(cors())


var admin = require("firebase-admin");

var serviceAccount = require("./fresh-valley-shop-firebase-adminsdk-2pvx3-b5f9f65a06.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("freshValleyDB").collection("images");
  const addCartCollection = client.db("freshValleyDB").collection("addInCart");

  app.post('/addProduct', (req, res) => {
    const newEvent = req.body;
    collection.insertOne(newEvent)
      .then(result => {
        // console.log(result.insertedCount)
        res.send(result)
      })
  })


  app.get('/event', (req, res) => {
    collection.find()
      .toArray((err, items) => {
        res.send(items)
        console.log(items)
      })
  })

  app.delete('/delete/:id',(req,res)=>{
    collection.deleteOne({_id:ObjectId(req.params.id)})
    .then(result =>{
      console.log(result);
    })
  })

  app.post('/addToChart', (req, res) => {
    const newAdded = req.body
    console.log(newAdded)
    addCartCollection.insertOne(newAdded)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/cartShow', (req, res) => {
    const bearer = req.headers.authorization
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const email = req.query.email
          if (tokenEmail === email) {
            addCartCollection.find({ email: email })
              .toArray((err, document) => {
                res.send(document)
                console.log(document)
              })
          }
          console.log({ tokenEmail });
        })
        .catch((error) => {
          // Handle error
        });
    }


  })


});


app.listen(process.env.PORT || port)