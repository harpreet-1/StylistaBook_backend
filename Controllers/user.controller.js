// Google Authentication code
const jwt = require("jsonwebtoken");
const googleAuthentication = async (req, res) => {
  // Successful authentication, redirect home.
  require("dotenv").config();
  console.log(req.user);
  let token = jwt.sign(
    { email: req.user.email, stylistId: req.user._id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  console.log(token);

  const user = req.user;

  // const frontendURL = `netlify link here/`

  const frontendURL = `https://64be0eeea1160021f6680835--darling-marshmallow-28100c.netlify.app?t=${token}`;

  res.send(`
                <a href="${frontendURL}}" id="myid" style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #222222; margin: 0; padding: 0; overflow: scroll;">
                    <img style="width:100%;" src="https://cdn.dribbble.com/users/1787505/screenshots/7300251/media/a351d9e0236c03a539181b95faced9e0.gif" alt="https://i.pinimg.com/originals/c7/e1/b7/c7e1b7b5753737039e1bdbda578132b8.gif">
                </a>
                <script>
                sessionStorage.setItem("token",${JSON.stringify(token)});
                    let a = document.getElementById('myid')
                    setTimeout(()=>{
                        a.click()
                    },000)
                    console.log(a)
                </script>
        `);
};

module.exports = {
  googleAuthentication,
};
