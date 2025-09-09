import React, { createContext, useCallback, useContext, useState } from "react";
import { AskQuestionDialogForm } from "./ask-question-dialog-form.tsx";
import styles from "./ask-question-dialog.module.css";

type State = {
  isOpen: boolean;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
};

const DEFAULTS: State = {
  isOpen: false,
  onConfirm: null,
  onCancel: null,
};

type ActionFn = () => void | Promise<void>;

type GlobalAskQuestionDialogContextType = [
  State,
  React.Dispatch<React.SetStateAction<State>>
];

const GlobalAskQuestionDialogContext =
  createContext<GlobalAskQuestionDialogContextType | null>(null);

export function GlobalAskQuestionDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>(DEFAULTS);

  return (
    <GlobalAskQuestionDialogContext.Provider value={[state, setState]}>
      <AskQuestionDialogUI />
      {children}
    </GlobalAskQuestionDialogContext.Provider>
  );
}

export function useGlobalAskQuestionDialogInternal() {
  const context = useContext(GlobalAskQuestionDialogContext);
  if (!context) {
    throw new Error(
      "useGlobalAskQuestionDialog must be used within a GlobalAskQuestionDialogProvider"
    );
  }
  return context;
}

export function useGlobalAskQuestionDialog() {
  const [_, setState] = useGlobalAskQuestionDialogInternal();

  type WrapOnAskQuestionOptions = {
    fn: ActionFn;
    onCancel?: ActionFn;
  };

  const wrap = useCallback((options: WrapOnAskQuestionOptions) => {
    const handleCancel = () => {
      if (options.onCancel) {
        options.onCancel();
      }

      setState(DEFAULTS);
    };

    const handleConfirm = () => {
      if (options.fn) {
        options.fn();
      }
    };

    setState({
      isOpen: true,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    });
  }, []);

  return { wrap };
}

function AskQuestionDialogUI() {
  const [state, setState] = useGlobalAskQuestionDialogInternal();

  const handleClose = useCallback(() => {
    setState(DEFAULTS);
  }, []);

  if (!state.isOpen) {
    return null;
  }

  return (
    <dialog
      onClose={handleClose}
      className={styles.dialog}
      ref={(el) => {
        if (el) {
          el.showModal();
        }
      }}
    >
      <AskQuestionDialogForm handleClose={handleClose} />
    </dialog>
  );
}
