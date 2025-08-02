"use client";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { Upload, ShoppingCart } from "@mui/icons-material";

export default function RoleSelector({ value, onChange }) {
  const roles = [
    {
      value: "buyer",
      title: "Buyer",
      description: "Purchase and download digital content",
      icon: <ShoppingCart sx={{ fontSize: 48, color: "primary.main" }} />,
      features: ["Browse marketplace", "Secure downloads", "Purchase history"],
    },
    {
      value: "creator",
      title: "Creator",
      description: "Upload and sell your digital content",
      icon: <Upload sx={{ fontSize: 48, color: "primary.main" }} />,
      features: [
        "Upload content",
        "Set pricing",
        "Analytics dashboard",
        "Earnings tracking",
      ],
    },
  ];

  return (
    <FormControl component="fieldset" fullWidth>
      <Typography variant="h6" gutterBottom className="text-center mb-4">
        Choose Your Account Type
      </Typography>

      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="space-y-3"
      >
        {roles.map((role) => (
          <FormControlLabel
            key={role.value}
            value={role.value}
            control={<Radio sx={{ display: "none" }} />}
            label=""
            sx={{ m: 0, width: "100%" }}
          />
        ))}

        <Box className="space-y-3">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                value === role.value
                  ? "ring-2 ring-primary-500 shadow-material-lg"
                  : "hover:shadow-material"
              }`}
              onClick={() => onChange(role.value)}
            >
              <CardContent className="p-6">
                <Box className="flex items-start space-x-4">
                  <Box className="flex-shrink-0">{role.icon}</Box>

                  <Box className="flex-1">
                    <Box className="flex items-center justify-between mb-2">
                      <Typography variant="h6" color="primary">
                        {role.title}
                      </Typography>
                      <Radio
                        checked={value === role.value}
                        value={role.value}
                        color="primary"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mb-3"
                    >
                      {role.description}
                    </Typography>

                    <Box className="space-y-1">
                      {role.features.map((feature, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          className="text-green-600"
                        >
                          ✓ {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </RadioGroup>
    </FormControl>
  );
}
