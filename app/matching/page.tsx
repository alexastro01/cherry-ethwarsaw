"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, Link, VerifiedIcon } from "lucide-react";
import { K2D } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { UserTag, UserType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import MatchModal from "@/components/matching/MatchModal";
import ProfilesEndedModal from "@/components/matching/ProfilesEndedModal";
import Image from "next/image";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Matching() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateFrame, setAnimateFrame] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isProfilesEndedModalOpen, setIsProfilesEndedModalOpen] = useState(false);
  const [matchedChatId, setMatchedChatId] = useState<string>("");

  const { address } = useAccount();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!address) return;
      setIsLoading(true);

      try {
        const response = await fetch("/api/get-random-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [address]);

  const currentUser = users[currentUserIndex];

  const checkMatch = async () => {
    if (!address || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("user_2", address)
        .eq("user_1", currentUser.evm_address)
        .or("matched.is.null,matched.eq.false");

      console.log(data);

      if (error) throw error;

      if (data.length === 0) {
        console.log("No matches found, creating a new match if it doesn't exist");
        const { error: insertError } = await supabase
          .from("matches")
          .upsert([{ user_1: address, user_2: currentUser.evm_address, matched: false }]);

        if (insertError) throw insertError;
      } else if (data.length > 0) {
        console.log("Match exists");
        const { error: updateError } = await supabase
          .from("matches")
          .update({ matched: true })
          .eq("user_1", currentUser.evm_address)
          .eq("user_2", address);

        if (updateError) throw updateError;

        // Create a chat between the two users
        const { error: chatError } = await supabase
          .from("chats")
          .insert([{ user_1: address, user_2: currentUser.evm_address }]);

        if (chatError) throw chatError;

        // Get the chat ID
        const { data: chatData, error: chatDataError } = await supabase
          .from("chats")
          .select("id")
          .eq("user_1", address)
          .eq("user_2", currentUser.evm_address)
          .limit(1)
          .single();

        if (chatDataError) throw chatDataError;

        setIsMatchModalOpen(true);
        setIsProfilesEndedModalOpen(false);
        setMatchedChatId(chatData?.id);

        if (chatError) throw chatError;
      }
    } catch (error) {
      console.error("Error in checkMatch:", error);
    }
  };

  const handleAccept = () => {
    if (users.length === 0) return;
    checkMatch();
    // If the current user is the last user in the list, do not animate
    if (currentUserIndex !== users.length - 1) {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    } else {
      setIsProfilesEndedModalOpen(true);
    }
  };

  const handleReject = () => {
    if (users.length === 0 || currentUserIndex === users.length - 1) {
      setIsProfilesEndedModalOpen(true);
    } else {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      //setCurrentUserIndex((prev) => (prev - 1 + users.length) % users.length);
      setCurrentImageIndex(0);
    }
  };

  const handleImageNext = () => {
    if (!currentUser) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentUser.profile_pictures.length);
  };

  const handleImagePrevious = () => {
    if (!currentUser) return;
    setCurrentImageIndex((prev) => (prev - 1 + currentUser.profile_pictures.length) % currentUser.profile_pictures.length);
  };

  const ProfileCard = ({
    user,
    imageIndex,
    isLoading,
  }: {
    user: UserType | null;
    imageIndex: number;
    isLoading: boolean;
  }) => (
    <div className="w-full max-w-xl bg-background shadow-lg overflow-hidden relative flex-grow pb-28">
      <AnimatePresence>
        <motion.div
          key="1"
          className="w-full"
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.55 }}
          onAnimationComplete={() => setAnimateFrame(false)}
        >
          {/* Image */}
          <div className="relative h-[400px]">
            {isLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse"></div>
            ) : user ? (
              <>
                <img src={user.profile_pictures[imageIndex]} alt={user.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent flex items-end">
                  <div className="flex flex-col w-full p-2 gap-1">
                    <h2 className={`flex items-center text-3xl font-bold text-primary-foreground ${k2d.className}`}>
                      <span className="mb-1">{user.name}</span>
                      {user.verified && (
                        <>
                          <Image
                            src={"/images/worldcoinlogo.png"}
                            width={20}
                            height={20}
                            alt="logo"
                            className="ml-2 h-8 w-8 rounded-full"
                          />
                          <VerifiedIcon className="-mt-5 h-4 w-4" />
                        </>
                      )}
                    </h2>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag: UserTag, index: number) => (
                        <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-500">No user data available</p>
              </div>
            )}
            <button
              onClick={handleImagePrevious}
              className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Previous image"
              disabled={isLoading || !user}
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={handleImageNext}
              className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Next image"
              disabled={isLoading || !user}
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key="2"
          className="w-full"
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.7 }}
        >
          {isLoading ? (
            <div className="flex flex-col p-4 gap-3">
              {/* Stats Skeleton */}
              <div className="flex flex-row gap-3">
                <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-col items-center bg-card rounded-xl p-3">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
              {/* Bio Skeleton */}
              <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
                <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-full bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              </div>
              {/* Links Skeleton */}
              <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
                <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="flex justify-between sm:px-14">
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
                <div className="flex justify-between sm:px-14">
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="flex flex-col p-4 gap-3">
              {/* Stats */}
              <div className="flex flex-row gap-3">
                {/* Worldcoin ID */}
                <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Worldcoin ID</p>
                  <p className={user.verified ? "text-green-500" : "text-red-500"}>
                    {user.verified ? "Confirmed" : "Unconfirmed"}
                  </p>
                </div>
                {/* Talent score */}
                <div className="flex flex-col items-center bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Talent Score</p>
                  <p className="text-muted-foreground">{user.talent_score ?? "N/A"}</p>
                </div>
              </div>
              {/* Bio */}
              <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Who am I?</p>
                <p className="text-muted-foreground">{user.bio}</p>
              </div>

              {/* Links */}
              {(user.twitter_link || user.github_link || user.farcaster_link || user.other_link) && (
                <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Links</p>
                  <div className="grid grid-cols-2 gap-4 sm:px-14">
                    {user.github_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={26} width={26} src="/images/github.png" alt="github logo" />
                        <a href={user.github_link} target="_blank" className="text-muted-foreground hover:underline">
                          Github
                        </a>
                      </p>
                    )}
                    {user.twitter_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={20} width={20} src="/images/x_logo.svg" alt="x logo" />
                        <a href={user.twitter_link} target="_blank" className="text-muted-foreground hover:underline">
                          Twitter
                        </a>
                      </p>
                    )}
                    {user.farcaster_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={23} width={23} src="/images/farcaster.svg" alt="farcaster logo" />
                        <a href={user.farcaster_link} target="_blank" className="text-muted-foreground hover:underline">
                          Farcaster
                        </a>
                      </p>
                    )}
                    {user.other_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Link size={24} />
                        <a href={user.other_link} target="_blank" className="text-muted-foreground hover:underline">
                          Other
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col p-4 gap-3 items-center justify-center">
              <p className="text-gray-500">No user data available</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex sm:flex-row flex-col items-stretch min-h-screen bg-gradient-to-br from-primary to-secondary">
      {/* Profile Card */}
      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-xl">
          <ProfileCard user={users[currentUserIndex] || null} imageIndex={currentImageIndex} isLoading={isLoading} />
        </div>
      </div>

      {/* Buttons */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center space-x-4">
        <button
          onClick={handleReject}
          className="bg-primary text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          aria-label="Dislike"
          disabled={isLoading || users.length === 0}
        >
          <X size={24} />
        </button>
        <button
          onClick={handleAccept}
          className="bg-green-500 text-primary-foreground rounded-full p-4 shadow-lg hover:bg-green-500/90 transition-colors disabled:opacity-50"
          aria-label="Like"
          disabled={isLoading || users.length === 0}
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Navigation */}
      <BottomNavigationBar />

      {/* Match Modal */}
      <MatchModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} chatId={matchedChatId} />

      {/* Profiles Ended Modal */}
      <ProfilesEndedModal isOpen={isProfilesEndedModalOpen} onClose={() => setIsProfilesEndedModalOpen(false)} />
    </div>
  );
}
