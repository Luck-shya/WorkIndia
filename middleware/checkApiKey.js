const { ADMIN_API_KEY } = require("../config");

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === ADMIN_API_KEY) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
  }
};

module.exports = checkApiKey;
