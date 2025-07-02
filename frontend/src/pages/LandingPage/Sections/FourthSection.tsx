import { useEffect, useRef, useState } from "react";
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const FourthSection = () => {
  const theme = useTheme();

  // Intersection Observer state & ref
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (rightBoxRef.current) {
      observer.observe(rightBoxRef.current);
    }

    return () => {
      if (rightBoxRef.current) {
        observer.unobserve(rightBoxRef.current);
      }
    };
  }, []);

  return (
    <Box className="fourth-section">
      <Box
        className="top-container"
        sx={{
          color: theme.palette.navbar?.text || '#fff',
        }}
      >
        <h1>This is what a truly borderless business looks like</h1>
      </Box>

      <Box className="bottom-container">
        <Box className="left-box">
          <img
            src="\landingcontentside.png"
            alt="Quick Cash Logo"
            className="img"
          />
        </Box>

        {/* Right box with ref and conditional class */}
        <Box
          className={`right-box ${isVisible ? "visible" : ""}`}
          ref={rightBoxRef}
        >
          <Typography
            variant="h3"
            className="headline"
            sx={{ color: theme.palette.navbar?.text || '#fff' }}
          >
            Position your business to acquire customers globally
          </Typography>

          <Typography
            variant="body1"
            className="description"
            sx={{ color: theme.palette.navbar?.text || '#fff' }}
          >
            Our neobanking platform designed to manage both cryptocurrency and
            fiat currency offers a modern, integrated financial solution that
            combines traditional banking features with cutting-edge
            cryptocurrency services. Here’s an overview of such a platform
          </Typography>

          <Box className="transaction-types">
            <Typography
              variant="h6"
              className="transaction-type"
              sx={{ color: theme.palette.navbar?.text || '#fff' }}
            >
              Fiat Transaction
            </Typography>
            <Typography
              variant="h6"
              className="transaction-type"
              sx={{ color: theme.palette.navbar?.text || '#fff' }}
            >
              Crypto Transaction
            </Typography>
          </Box>

          <Typography variant="body1" className="cta-link">
            Start with Quick Cash →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FourthSection;
