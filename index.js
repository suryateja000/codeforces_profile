const express = require('express');
const cors = require('cors');
const { connectDB, mongoose } = require('./config/connectDb'); 
const StudentRouter= require('./routes/studentroute')
const ContestRouter= require('./routes/contestroute')
const ProblemRouter = require('./routes/problemroute')
const cron = require('node-cron');
const {updateProblems,updateContests} = require('./utils/cronutils')
app=express()
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json());


connectDB();



cron.schedule('0 0 * * *', async () => {
 
           await updateContests();
           await updateProblems();

});

app.use('/student',StudentRouter)
app.use('/contest',ContestRouter)
app.use('/problem',ProblemRouter)

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});