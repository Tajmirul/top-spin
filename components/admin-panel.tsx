"use client";

import { useState } from "react";
import { CreateUserModal } from "./create-user-modal";

export function AdminPanel() {
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <>
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onUserCreated={() => {
          // Could refresh player list or show notification
          console.log("User created successfully");
        }}
      />
    </>
  );
}
