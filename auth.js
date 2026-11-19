const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "FitnessTrackerAPI";

module.exports.createAccessToken = (user) => {
  const data = {
    id: user._id,
    email: user.email,
  };

  return jwt.sign(data, secret, {});
};

module.exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ auth: "Failed. No Token" });
  }

  const token = authHeader.slice(7);

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ auth: "Failed", message: err.message });
    }

    req.user = decodedToken;
    next();
  });
};
