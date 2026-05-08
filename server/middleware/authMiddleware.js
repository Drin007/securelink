const User = require("../models/User"); 
const jwt = require("jsonwebtoken");


const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password"); 
    if (!user) return res.status(404).json({ msg: "User not found" }); 

    req.user = user; 

    next();

  } catch {
    res.status(401).json({ msg: "Token is invalid" });
  }
};

module.exports = protect; 