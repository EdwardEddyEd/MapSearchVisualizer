import { useEffect } from "react";
import { modalIds } from "./modalIds";

type ModalProps = {
  modalId: keyof typeof modalIds;
  children: React.ReactNode;
  isOpen?: boolean; // If isOpen is set, the modal will open and close based on it's value automatically
  modalBoxStyle?: string;
  closeOnClickOutside?: boolean;
};

const closeOnClickOutsideBackdrop = (
  <form method="dialog" className="modal-backdrop">
    <button />
  </form>
);

export function Modal({
  modalId,
  children,
  isOpen,
  modalBoxStyle,
  closeOnClickOutside = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen !== undefined) {
      isOpen ? openModal(modalId) : closeModal(modalId);
    }
  }, [modalId, isOpen]);

  return (
    <dialog id={modalId} className="modal ">
      <div
        className={`modal-box bg-background text-foreground ${modalBoxStyle}`}
      >
        {children}
      </div>
      {closeOnClickOutside && closeOnClickOutsideBackdrop}
    </dialog>
  );
}

export function openModal(modalId: keyof typeof modalIds) {
  const modalElement = document.getElementById(
    modalId
  ) as HTMLDialogElement | null;
  if (modalElement) {
    modalElement.showModal();
  } else {
    console.error(`Modal with ID "${modalId}" not found.`);
  }
}

export function closeModal(modalId: keyof typeof modalIds) {
  const modalElement = document.getElementById(
    modalId
  ) as HTMLDialogElement | null;
  if (modalElement) {
    modalElement.close();
  } else {
    console.error(`Modal with ID "${modalId}" not found.`);
  }
}
