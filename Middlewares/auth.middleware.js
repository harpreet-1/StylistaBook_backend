const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided." });
  }

  jwt.verify(token, 'styleSync', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    
    // Optionally, you can attach the decoded data to the request object for later use.
    req.user = decoded;
    next();
  });
};

module.exports = { authentication };






//old//
// const jwt = require("jsonwebtoken")

// const authentication = (req, res, next) => {
//     const token = req.headers.authorization.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     jwt.verify(token, 'styleSync',

//     function(err,decoded){
//         if(err){
//             res.send(err)
//         }
//         if(decoded){
//             next()
//         }
//     })

// }
// module.exports = { authentication }