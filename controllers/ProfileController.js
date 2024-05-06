import prisma from "../DB/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {

  static async index(req, res) {

    try {
      const user = req.user;

      return res.json({ status: 200, user });

    } catch (error) {
      return res.status(400).json({ error: 'Error loading profile' });
    }

  }

  static async show(req, res) {

  }

  static async store(req, res) {

  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const user = req.user
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ status: 400, message: "Profile image is missing" })
      }

      const profile = req.files.profile
      const message = imageValidator(profile?.size, profile.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      const imgExt = profile?.name.split(".")
      const imageName = generateRandomNum() + "." + `${imgExt[1]}`
      const uploadPath = process.cwd() + `/public/images/users/` + imageName;

      profile.mv(uploadPath, (err) => {
        if (err) throw err
      })

      await prisma.users.update({
        where: {
          id: Number(id),
        },
        data: {
          profile: imageName,
        },
      })

      return res.json({
        status: 200,
        message: "Profile updated successfully!",
      });

      /* return res.json({
        status:200,
        name: profile?.name,
        size: profile?.size,
        mime: profile?.mimetype
      }); */

    } catch (error) {
      console.log("The error is", error);
      return res.status(500).json({ message: "Internal error" })
    }
  }

  static async destroy(req, res) {

  }


}


export default ProfileController;