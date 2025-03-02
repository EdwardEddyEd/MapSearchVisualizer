import { modalIds } from "./modalIds";

type ModalProps = {
  modalId: keyof typeof modalIds;
  children: React.ReactNode;
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
  modalBoxStyle,
  closeOnClickOutside = true,
}: ModalProps) {
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
