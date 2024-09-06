"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Cog, User, Link } from "lucide-react";
import { K2D } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export const users = [
  {
    name: "John Doe",
    images: ["/images/john1.jpg", "/images/john2.jpeg", "/images/john3.jpg"],
    tags: ["Travel", "Photography", "Foodie"],
    bio: "Adventure seeker and coffee enthusiast. Always looking for the next exciting experience!",
    github_link: "https://github.com",
    twitter_link: "https://twitter.com",
    farcaster_link: "https://farcaster",
    other_link: "https://other.com",
  },
  {
    name: "Jim Smith",
    images: ["/images/jim1.jpg", "/images/jim2.jpg"],
    tags: ["Fitness", "Tech", "Movies"],
    bio: "Software developer by day, fitness junkie by night. Love discussing the latest tech trends and watching classic films.",
    github_link: "https://github.com",
    twitter_link: "https://twitter.com",
    farcaster_link: "https://farcaster",
    other_link: "https://other.com",
  },
  {
    name: "Jane Doe",
    images: ["/images/jane1.jpg", "/images/jane2.webp"],
    tags: ["Music", "Art", "Fashion"],
    bio: "Music lover and aspiring fashion designer. I enjoy painting and exploring new art galleries.",
    github_link: "https://github.com",
    twitter_link: "https://twitter.com",
    farcaster_link: "https://farcaster",
    other_link: "https://other.com",
  },
];

export default function Matching() {
  const [currentUser, setCurrentUser] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [bioDirection, setBioDirection] = useState(0);
  const [animateFrame, setAnimateFrame] = useState(false);

  const handleNext = () => {
    setDirection(1);
    setBioDirection(1);
    setAnimateFrame(true);
    setCurrentUser((prev) => (prev + 1) % users.length);
    setCurrentImage(0);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setBioDirection(-1);
    setAnimateFrame(true);
    setCurrentUser((prev) => (prev - 1 + users.length) % users.length);
    setCurrentImage(0);
  };

  const handleImageNext = () => {
    setCurrentImage((prev) => (prev + 1) % users[currentUser].images.length);
  };

  const handleImagePrevious = () => {
    setCurrentImage((prev) => (prev - 1 + users[currentUser].images.length) % users[currentUser].images.length);
  };

  const ProfileCard = ({ user, imageIndex }: { user: any; imageIndex: any }) => (
    <div className="w-full max-w-md bg-background shadow-lg overflow-hidden relative flex-grow pb-24">
      <AnimatePresence>
        <motion.div
          key="1"
          className="w-full"
          initial={{ x: animateFrame ? direction * 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? direction * -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          onAnimationComplete={() => setAnimateFrame(false)}
        >
          {/* Image */}
          <div className="relative h-[400px]">
            <img src={user.images[imageIndex]} alt={user.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end">
              <div className="flex flex-col w-full p-2 gap-1">
                <h2 className={`text-3xl font-bold text-primary-foreground ${k2d.className}`}>{user.name}</h2>
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {user.tags.map((tag: any, index: any) => (
                    <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleImagePrevious}
              className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={handleImageNext}
              className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key="2"
          className="w-full"
          initial={{ x: animateFrame ? bioDirection * 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? bioDirection * -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.7 }}
        >
          <div className="flex flex-col p-4 gap-3">
            {/* Stats */}
            <div className="flex flex-row gap-3">
              {/* Worldcoin ID */}
              <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Worldcoin ID</p>
                <p className="text-muted-foreground">Confirmed</p>
              </div>
              {/* Talent score */}
              <div className="flex flex-col items-center bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Talent Score</p>
                <p className="text-muted-foreground">90</p>
              </div>
            </div>
            {/* Bio */}
            <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
              <p className="font-bold text-foreground">Who am I?</p>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
              <p className="font-bold text-foreground">Links</p>
              <div className="flex justify-between">
                <p className="text-muted-foreground flex items-center gap-2">
                  <img height={26} width={26} src="/images/github.png" alt="github logo" />
                  <a href={user.github_link} className="text-muted-foreground hover:underline">
                    Github
                  </a>
                </p>
                <p className="flex text-muted-foreground items-center gap-2">
                  <img height={20} width={20} src="/images/x_logo.svg" alt="x logo" />
                  <a href={user.twitter_link} className="text-muted-foreground hover:underline">
                    (Twitter)
                  </a>
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground flex items-center gap-2">
                  <img height={23} width={23} src="/images/farcaster.svg" alt="farcaster logo" />
                  <a href={user.farcaster_link} className="text-muted-foreground hover:underline">
                    Farcaster
                  </a>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Link size={24} />
                  <a href={user.other_link} className="text-muted-foreground hover:underline">
                    Other
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="relative w-full max-w-md">
        <ProfileCard user={users[currentUser]} imageIndex={currentImage} />
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card shadow-lg">
        {/* Buttons */}
        <div className="absolute -top-16 left-0 right-0 flex justify-center space-x-4">
          <button
            onClick={handlePrevious}
            className="bg-destructive text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-destructive/90 transition-colors"
            aria-label="Dislike"
          >
            <X size={24} />
          </button>
          <button
            onClick={handleNext}
            className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Like"
          >
            <Heart size={24} />
          </button>
        </div>
        <div className="flex justify-around items-center py-2">
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Messages">
            <MessageCircle size={24} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Matches">
            <Cog size={25} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Profile">
            <User size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
