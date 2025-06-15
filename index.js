const express = require('express');
const cors = require('cors');
const { connectDB, mongoose } = require('./config/connectDb'); 

app.use(cors({
  origin: '*',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json());


connectDB();

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});