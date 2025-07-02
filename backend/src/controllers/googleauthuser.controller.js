const jwt = require('jsonwebtoken');

googleAuthUser: async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: 400,
      message: "Token is required",
      data: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure secret matches
    const { email, name } = decoded.data;

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Email not found in token",
        data: null
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        password: "",
        loginType: 'google'
      });
    }

    if (user.suspend) {
      return res.status(401).json({
        status: 401,
        message: "Your Account has been suspended , please contact Admin",
        data: null
      });
    }

    const accessToken = await generateAccessTokenUser(user);

    return res.status(200).json({
      status: 200,
      message: "User logged in with Google successfully",
      data: user,
      token: accessToken
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(403).json({
      status: 403,
      message: "Invalid token",
      data: null
    });
  }
}
