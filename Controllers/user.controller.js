// Google Authentication code

const googleAuthentication = async (req, res) => {
  // Successful authentication, redirect home.

  console.log(req.user);
  const token = jwt.sign(
    { email: req.user.email, stylistId: req.user._id },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const user = req.user;

  // const frontendURL = `netlify link here/`

  const frontendURL =
    "https://64be0eeea1160021f6680835--darling-marshmallow-28100c.netlify.app/";

  res.send(`
                <a href="${frontendURL}" id="myid" style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #222222; margin: 0; padding: 0; overflow: scroll;">
                    <img style="width:100%;" src="https://cdn.dribbble.com/users/1787505/screenshots/7300251/media/a351d9e0236c03a539181b95faced9e0.gif" alt="https://i.pinimg.com/originals/c7/e1/b7/c7e1b7b5753737039e1bdbda578132b8.gif">
                </a>
                <script>
                localStorage.setItem("token", ${token});
                    let a = document.getElementById('myid')
                    setTimeout(()=>{
                        a.click()
                    },2000)
                    console.log(a)
                </script>
        `);
};

module.exports = {
  googleAuthentication,
};
