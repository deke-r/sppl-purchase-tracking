const express=require('express');
const app=express()
const bodyParser=require('body-parser');
const router=require('./routes/router');
require('dotenv').config()
const cors=require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())

app.use('/', router);
const PORT=process.env.PORT;


app.listen(PORT,()=>{
    console.log(`Server is listening to PORT : ${PORT}`);
});

