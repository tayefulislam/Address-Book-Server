const express = require("express");
const cors = require("cors");
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;



// middle ware
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
const { async } = require("@firebase/util");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pha46.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });


async function run() {
    try {
        await client.connect()

        const contactCollection = client.db("AddressBook1").collection("contacts");

        // add new contact

        app.post('/addNewContact', async (req, res) => {

            const newContact = req.body;

            const result = await contactCollection.insertOne(newContact);
            res.send(result)

        })





    }

    finally {

    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Welcome To Address Book')

})

app.listen(port, () => {
    console.log('server is runing')
})