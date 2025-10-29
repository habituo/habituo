import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const MotionBox = motion.div;

const FadeInWhenVisible = ({ children, delay = 0, y = 30, ...props }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    const variants = {
        hidden: { opacity: 0, y },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                delay,
            },
        },
    };

    return (
        <MotionBox
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants}
            {...props}
        >
            {children}
        </MotionBox>
    );
};

export default FadeInWhenVisible;
