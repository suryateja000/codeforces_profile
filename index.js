const express = require('express');
const cors = require('cors');
const { connectDB, mongoose } = require('./config/connectDb'); 
const StudentRouter= require('./routes/studentroute')

app=express()
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json());


connectDB();




app.use('/student',StudentRouter)

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});