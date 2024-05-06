import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { generateRandomNum, imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import prisma from "../DB/db.config.js";
import NewsApiTransform from "../transform/newsApiTransform.js";


class NewsController {
  static async index(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      if (page <= 0) {
        page = 1
      }

      if (limit <= 0 || limit > 100) { limit = 10 }

      const skip = (page - 1) * limit

      const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true
            }
          }
        },
      });

      const newTransform = news?.map((item) => NewsApiTransform.transform(item));

      const totalNews = await prisma.news.count();
      const totalPages = Math.ceil(totalNews / limit);

      return res.json({
        status: 200,
        news: newTransform,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      });
      //return res.json({ status: 200, message: "all the news", news: newTransform });

    } catch (error) {

    }
  }

  static async show(req, res) {

    try {
      const {id} = req.params
      const  news = await prisma.news.findUnique({
        where:{
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      
      const transFormNews = news ? NewsApiTransform.transform(news) : null;
      return res.json({ status: 200, news: transFormNews });

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

  static async store(req, res) {
    try {
      const user = req.user;

      const body = req.body;

      const validator = vine.compile(newsSchema);
      const playload = await validator.validate(body)
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required"
          }
        })
      }
      const image = req.files?.image

      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            image: "Image field is required"
          }
        })
      }
      //Image upload


      /* const imgExt = image?.name.split(".")
      const imageName = generateRandomNum() + "." + `${imgExt[1]}`
      const uploadPath = process.cwd() + `/public/images/news/` + imageName;

      image.mv(uploadPath, (err) => {
        if (err) throw err
      }) */
      const imageName = uploadImage(image)

      playload.user_id = user.id;
      playload.image = imageName

      const news = await prisma.news.create({
        data: playload,
      });

      return res.status(200).json({ messages: "News created successfully", news });


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
  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.status(400).json({ message: "UnAtuhorized" });
      }
      
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);
        
      const image = req?.files?.image;

      let imageName = undefined

      if (image) {
        const message = imageValidator(image?.size,  image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }

        //   * Upload new image
        imageName = uploadImage(image);
        payload.image = imageName;
        // * Delete old image
        removeImage(news.image);

      }
      
      await prisma.news.update({
        where: {
          id: Number(id),
        },
        data: payload,
      });

      return res.status(200).json({ message: "News updated successfully!" });


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
  static async destroy(req, res) { 
    try {
      const { id } = req.params;
      const user = req.user;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        });
        if (user.id !== news.user_id) {
          return res.status(400).json({ message: "UnAtuhorized" });
        }
        //remove his image 
        removeImage(news.image);

        //delete the news
        await prisma.news.delete({
          where:{
            id :Number(id)
          }
        })
        return res.status(200).json({message:"Deleted Successfully"})
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

export default NewsController;