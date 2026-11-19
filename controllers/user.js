const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");

module.exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).send({ error: "Email invalid" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .send({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ error: "Email already registered" });
    }

    const newUser = new User({
      email,
      password: bcrypt.hashSync(password, 10),
    });

    await newUser.save();
    return res.status(201).send({ message: "Registered Successfully" });
  } catch (err) {
    console.error("Error in registering user:", err);
    return res.status(500).send({ error: "Error in Save" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).send({ error: "Invalid Email" });
    }

    if (typeof password !== "string" || !password) {
      return res.status(400).send({ error: "Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "No Email Found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ error: "Email and password do not match" });
    }

    return res.status(200).send({ access: auth.createAccessToken(user) });
  } catch (err) {
    console.error("Error in logging in:", err);
    return res.status(500).send({ error: "Error in logging in" });
  }
};

module.exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send({ user });
  } catch (err) {
    console.error("Error in fetching user details:", err);
    return res.status(500).send({ error: "Failed to fetch user profile" });
  }
};
