import express from "express";

import "dotenv/config" ;

import fileUpload from "express-fileupload";

import helmet from "helmet";

import cors from "cors";

import { limiter } from "./config/ratelimiter.js";

const app = express()

const PORT = process.env.PORT || 8000

app.use(fileUpload())
app.use(express.static("public"))

//*Middleware
app.use(helmet()) //Security
app.use(cors()) //Cross Origin Resource Sharing
app.use(limiter) //Rate
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/",(req , res)=>{
  return res.json({message: "hello it's working ..."})
})

/** Import of routes */
import ApiRoutes from "./routes/api.js"

app.use("/api",ApiRoutes)


app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`)
})