"use client";

import { useUser } from "@/hooks/useUser";
import MicrosoftClarity from "@microsoft/clarity";
import { useEffect } from "react";

const Clarity = () => {
  const { user } = useUser();

  useEffect(() => {
    MicrosoftClarity.init("v5sxpst4cv");
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    MicrosoftClarity.identify(
      user.id,
      undefined,
      undefined,
      user.name || user.email || "Anonymous",
    );
  }, [user]);

  return null;
};

export default Clarity;
