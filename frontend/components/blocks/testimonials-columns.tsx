"use client";
import React from "react";
import { motion } from "framer-motion";


export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-6 rounded-2xl border bg-card shadow-lg shadow-primary/10 max-w-sm w-full" key={i}>
                  <div className="text-sm text-muted-foreground leading-relaxed">{text}</div>
                  <div className="flex items-center gap-3 mt-4">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

export const testimonials = [
  {
    text: "Amazing developer! Delivered our project on time with excellent quality. Highly recommended!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    name: "Sarah Johnson",
    role: "CEO, TechStartup",
  },
  {
    text: "Professional and skilled. The web application exceeded our expectations. Great communication throughout!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    name: "Michael Chen",
    role: "Product Manager",
  },
  {
    text: "Outstanding work on our e-commerce platform. The code quality is top-notch and well-documented.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    name: "Emily Davis",
    role: "Founder, ShopHub",
  },
  {
    text: "Transformed our legacy system into a modern web app. The results speak for themselves!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    name: "David Wilson",
    role: "CTO, InnovateCo",
  },
  {
    text: "Exceptional frontend skills. Our new dashboard is beautiful and highly functional.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    name: "Amanda Lee",
    role: "Design Director",
  },
  {
    text: "Delivered a scalable backend API that handles our traffic perfectly. Great technical expertise!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    name: "James Brown",
    role: "VP Engineering",
  },
  {
    text: "Professional, responsive, and highly skilled. Would definitely work together again!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    name: "Lisa Anderson",
    role: "Startup Founder",
  },
  {
    text: "Excellent problem-solving skills. Solved complex issues quickly and efficiently.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
    name: "Kevin Martinez",
    role: "Technical Lead",
  },
  {
    text: "Our users love the new interface! Great attention to detail and user experience.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    name: "Rachel Green",
    role: "UX Director",
  },
];
