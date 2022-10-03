const express = require('express'),
    app = express(),
    cors = require('cors'),
    morgan = require('morgan'),
    PORT = process.env.PORT || 3001,
    fileUpload = require('express-fileupload'),
    {TransformLog} = require('./utils/transformLog');

app.use(cors());
app.use(fileUpload());
app.use(morgan('dev'));

// app.get("/api/data",(req,res)=>{
//     try{
//     }catch(e){
//         console.log(e);
//     }
// })

app.post("/api/data", (req,res)=>{
    try{
        return res.json({data: TransformLog('./assets/app.log')});
    }catch(e){
        console.log(e);
    }
})

app.listen(PORT, () => {
    console.log(`server started http://localhost:${PORT}`);
});