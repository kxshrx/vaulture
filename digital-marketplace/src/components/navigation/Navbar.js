"use client";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountCircle, Upload, Dashboard, Logout } from "@mui/icons-material";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleMenuClick = (path) => {
    router.push(path);
    handleClose();
  };

  return (
    <AppBar position="sticky" className="shadow-material">
      <Toolbar className="justify-between">
        <Link href="/" className="no-underline">
          <Typography variant="h6" className="text-white font-bold">
            Digital Marketplace
          </Typography>
        </Link>

        <Box className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Box className="flex items-center space-x-2">
                {user?.is_creator && (
                  <Chip
                    icon={<Upload />}
                    label="Creator"
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ color: "white", borderColor: "white" }}
                  />
                )}

                <IconButton size="large" onClick={handleMenu} color="inherit">
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                  >
                    {user?.display_name?.charAt(0)?.toUpperCase() || (
                      <AccountCircle />
                    )}
                  </Avatar>
                </IconButton>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Box
                  sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {user?.display_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>

                <MenuItem onClick={() => handleMenuClick("/dashboard")}>
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>

                {user?.is_creator && (
                  <MenuItem
                    onClick={() => handleMenuClick("/creator/dashboard")}
                  >
                    <Upload sx={{ mr: 1 }} />
                    Creator Dashboard
                  </MenuItem>
                )}

                {!user?.is_creator && (
                  <MenuItem onClick={() => handleMenuClick("/auth/upgrade")}>
                    <Upload sx={{ mr: 1 }} />
                    Become Creator
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box className="flex items-center space-x-2">
              <Link href="/auth/login" passHref>
                <Button color="inherit" variant="outlined">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" passHref>
                <Button
                  color="inherit"
                  variant="contained"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
