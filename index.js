const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;



// middle ware
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { async } = require("@firebase/util");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pha46.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });



// function verifyJWT


function verifyJWT(req, res, next) {

    const authentication = req.headers.authentication;
    const token = authentication.split(' ')[1]

    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    jwt.verify(token, process.env.secretKey, function (err, decoded) {

        if (err) {

            return res.status(403).send('Forbidden')
        }
        req.decoded = decoded
        next()
    });

}





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

        // add new contact in bulk

        app.post('/addBulkContact', verifyJWT, async (req, res) => {
            const bulkContact = req.body;

            const options = { ordered: true }

            const result = await contactCollection.insertMany(bulkContact, options)

            res.send(result)
        })


        // get contact list based on user email


        app.get('/contacts/:email', verifyJWT, async (req, res) => {

            const email = req.params.email;

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let result;

            const query = { intertByEmail: email }
            if (page || size) {

                result = await contactCollection.find(query).skip(page * size).limit(size).sort({ _id: -1 }).toArray()


            } else {
                result = await contactCollection.find(query).sort({ _id: -1 }).toArray()

            }

            res.send(result)



        });




        // get contact details
        app.get('/contactsDetails/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;

            // console.log(id)
            const result = await contactCollection.findOne({ _id: ObjectId(id) })
            res.send(result)
        })


        // delete contact

        app.post('/contact/delete/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;

            const result = await contactCollection.deleteOne({ _id: ObjectId(id) })

            res.send(result)
        })


        // issu token

        app.post('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)

            const token = jwt.sign({ email: email }, process.env.secretKey, { expiresIn: '1d' });
            console.log(token)
            res.send(token)
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