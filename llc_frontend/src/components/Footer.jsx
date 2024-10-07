import { Box, Typography, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import FavoriteIcon from "@mui/icons-material/Favorite";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#000",
        color: "rgba(144, 144, 144, 0.87)",
        p: 2,
        position: "relative",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} The Localhost Cloud. All rights reserved.
      </Typography>
      <Typography variant="body2">
        <Link
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          href="https://github.com/TheLocalhostLive/Localhost_Live_Cloud"
          color="inherit"
          target="_blank"
          rel="noopener"
        >
          <GitHubIcon />{" "}
          <p style={{ margin: "6px" }}>Contribute to our GitHub Repo</p>
        </Link>
        <Link
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          href={`${window.location.origin}/donate`}
          color="inherit"
          target="_blank"
          rel="noopener"
        >
          <FavoriteIcon /> <p style={{ margin: "6px" }}>Donate us</p>
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
