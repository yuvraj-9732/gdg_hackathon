import React, { useState, useEffect, useRef } from 'react';

let nextId = 0;
/**
 * A component that renders a decorative, interactive background with floating circles
 * that are attracted to the mouse and get destroyed on hover.
 */
const AnimatedBackground = () => {
  const [circles, setCircles] = useState([]);
  const mousePos = useRef({ x: -1, y: -1 });
  const containerRef = useRef(null);
  const animationFrameId = useRef();

  // Initialize circles on mount
  const generateCircle = () => {
    const { innerWidth, innerHeight } = window;
    const size = Math.random() * 80 + 20; // Varies from 20px to 100px
    return {
      id: nextId++,
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.5, // Slow initial velocity
      vy: (Math.random() - 0.5) * 0.5,
      size: size,
      opacity: 1,
    };
  };

  useEffect(() => {
    const generateCircles = () => {
      const numCircles = 30; // Increased number of circles
      const newCircles = Array.from({ length: numCircles }, generateCircle);
      setCircles(newCircles);
    };
    generateCircles();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      setCircles((prevCircles) =>
        prevCircles
          .map((circle) => {
            // 1. Destruction on hover
            const dxMouse = mousePos.current.x - circle.x;
            const dyMouse = mousePos.current.y - circle.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < circle.size / 2) {
              return generateCircle(); // Replace the destroyed circle with a new one
            }

            // 2. Attraction to mouse
            let attraction_dx = 0;
            let attraction_dy = 0;
            if (mousePos.current.x > 0) {
              const attraction_dist = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
              if (attraction_dist > 100) { // Only attract if not too close
                const force = 1 / Math.max(100, attraction_dist); // Simple inverse force
                attraction_dx = (dxMouse / attraction_dist) * force * 2;
                attraction_dy = (dyMouse / attraction_dist) * force * 2;
              }
            }

            // Update velocity with attraction and damping
            const newVx = (circle.vx + attraction_dx) * 0.98;
            const newVy = (circle.vy + attraction_dy) * 0.98;

            // Update position
            let newX = circle.x + newVx;
            let newY = circle.y + newVy;

            // Bounce off edges
            if (newX < 0 || newX > window.innerWidth) circle.vx *= -1;
            if (newY < 0 || newY > window.innerHeight) circle.vy *= -1;

            return { ...circle, x: newX, y: newY, vx: newVx, vy: newVy };
          })
      );

      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className="animated-background" ref={containerRef}>
      <div className="circles-container">
        {circles.map((c) => (
          <div
            key={c.id}
            className="circle-shape"
            style={{
              width: `${c.size}px`,
              height: `${c.size}px`,
              left: `${c.x}px`,
              top: `${c.y}px`,
              opacity: c.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;