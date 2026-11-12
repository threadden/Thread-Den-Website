import React from "react";
import AuthModal from "./AuthModal";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: "dark" | "light";
  brandName: string;
}

/**
 * Backwards compatibility wrapper for AdminLoginModal.
 * Routes directly through the single unified AuthModal with role selector.
 */
export default function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
  theme,
  brandName,
}: AdminLoginModalProps) {
  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      onCustomerLogin={() => {}}
      onAdminLogin={onSuccess}
      theme={theme}
      brandName={brandName}
      initialRole="customer"
    />
  );
}
