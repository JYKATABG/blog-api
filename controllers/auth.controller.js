import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const { user, token } = await authService.register(username, email, password);

  res.status(200).json({
    success: true,
    message: "User created successfully",
    user,
    token,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.json({
    success: true,
    message: "Logged in successfully",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  });
};
