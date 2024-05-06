import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {

  const header = req.headers.authorization
  if (header === null || header === undefined) {
    return res.status(401).json({ status: 401, message: "UnAuthorized" });
  }

  const token = header.split(" ")[1];

  //checking the jwt
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(401).json({ status: 401, message: "UnAuthorized" });
    req.user = user;
    next();
  });
};

export default authMiddleware;

