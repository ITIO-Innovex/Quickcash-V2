import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const SixthSection = () => {
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
      <Box className="bottom-container">
        <Box className="left-box">
          <img
            src="\landingcontentside2.png"
            alt="Quick Cash Logo"
            className="img"
          />
        </Box>

        {/* Right box with ref and conditional class */}
        <Box
          className={`right-box ${isVisible ? 'visible' : ''}`}
          ref={rightBoxRef}
        >
          <Typography
            variant="body1"
            className="headline1"
            sx={{ color: theme.palette.navbar?.text || '#fff' }}
          >
            Whitelabel NEO Banking Platform Development Process
          </Typography>

          <Typography
            variant="body1"
            className="description1"
            sx={{ color: theme.palette.navbar?.text || '#fff' }}
          >
            We use an agile development approach to create custom NEO banking
            apps that meet every client's needs. Our customer-centric process
            ensures exceptional results. We follow this six-step framework to
            deliver reliable and secure FinTech solutions
          </Typography>

          <Typography variant="body1" className="cta-link1">
            Start with Quick Cash →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SixthSection;
