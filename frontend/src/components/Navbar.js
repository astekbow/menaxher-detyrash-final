import React from "react";
import { AppBar, Toolbar, Button, Box, useTheme } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const token      = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Button
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            textDecoration: isActive("/") ? "underline" : "none",
          }}
        >
          Task Manager
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {token ? (
          <>
            <Button
              component={Link}
              to="/profile"
              sx={{ textDecoration: isActive("/profile") ? "underline" : "none" }}
            >
              Profile
            </Button>

            {/*  ➡️  “+” button removed  */}

            <Button onClick={logout} sx={{ ml: 1 }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              component={Link}
              to="/login"
              sx={{ textDecoration: isActive("/login") ? "underline" : "none" }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              sx={{ textDecoration: isActive("/register") ? "underline" : "none" }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
