import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";

import { loginSchema, registerSchema } from "../validations/authvalidation.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";


class AuthController {
  static async register(req, res) {
    try {
      const body = req.body
      const validator = vine.compile(registerSchema)
      const payload = await validator.validate(body);

      //Check if email exist

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email
        }
      })

      if (findUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const salt = bcrypt.genSaltSync(10); // generate a salt to hash the password
      payload.password = bcrypt.hashSync(payload.password, salt); // use the salt to hash the user's password

      const user = await prisma.users.create({ data: payload }); // Creating the user

      return res.json({ status: 200, message: "User create successfully", user })

    } catch (error) {
      console.log("The error is", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        // Internal error
        return res.status(500).json({ message: "Internal error, something went wrong" });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;

      const validator = vine.compile(loginSchema)
      const payload = await validator.validate(body)
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email
        },
      })

      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors:{
              password:"Invalid Credentials."
            },
          });
        }
        //token
        const playloadData = {
          id: findUser.id,
          email: findUser.email,
          profile : findUser.profile
        }
        const token = jwt.sign(playloadData, process.env.JWT_SECRET,{ 
          expiresIn: '24h'
        });

        return res.json({message:"Logged in",access_token: `Bearer ${token}`})
      }

      return res.status(400).json({
        errors:{
          email:"No User found with this email."
        }
      });

    } catch (error) {
      console.log("The error is", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        // Internal error
        return res.status(500).json({ message: "Internal error, something went wrong" });
      }
    }


  }

}

export default AuthController;