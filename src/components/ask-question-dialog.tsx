import clsx from "clsx";
import { LucideRefreshCcw } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { generateMathQuestion } from "../libs/generate-math-question.js";
import styles from "./ask-question-dialog.module.css";
import { Button } from "./button.js";

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

function useGlobalAskQuestionDialogInternal() {
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

const numberFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  notation: "compact",
});

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
      <Form handleClose={handleClose} />
    </dialog>
  );
}

function Form({ handleClose }: { handleClose: () => void }) {
  const [trivia, setTrivia] = useState(() => generateMathQuestion());
  const [state] = useGlobalAskQuestionDialogInternal();

  const [formState, setFormState] = useState<
    | { type: "error"; error: Error }
    | { type: "correct" }
    | { type: "incorrect"; answer: string }
    | { type: "idle" }
  >({ type: "idle" });

  const handleReset = useCallback(() => {
    setFormState({ type: "idle" });
    setTrivia(generateMathQuestion());
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (formState.type !== "idle") {
        return;
      }

      const form = e.currentTarget;
      const formData = new FormData(form);
      const userAnswer = formData.get("userAnswer");

      try {
        if (typeof userAnswer !== "string") {
          throw new Error("User answer is not a string");
        }

        if (userAnswer.trim() === "") {
          throw new Error("User answer is empty");
        }

        const realAnswer = numberFormat.format(trivia.answer);

        if (userAnswer === realAnswer) {
          setFormState({ type: "correct" });
          state.onConfirm?.();
        } else {
          setFormState({ type: "incorrect", answer: userAnswer });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setFormState({ type: "error", error: err });
      }
    },
    [trivia, formState.type, state.onConfirm]
  );

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.questionWrapper}>
        <p className={styles.question}>{trivia?.question} = ?</p>
        <Button
          className={styles.refreshButton}
          onClick={handleReset}
          type="button"
          aria-label="Change Challenge"
          disabled={formState.type === "incorrect"}
        >
          <LucideRefreshCcw />
        </Button>
      </div>

      {formState.type === "correct" && <SuccessParagraph close={handleClose} />}

      {(formState.type === "incorrect" || formState.type === "error") && (
        <IncorrectParagraph
          answer={numberFormat.format(trivia?.answer ?? 0)}
          error={formState.type === "error" ? formState.error : null}
          reset={handleReset}
        />
      )}

      <div className={styles.inputContainer}>
        <input
          type="number"
          name="userAnswer"
          autoFocus
          className={styles.input}
          placeholder="Enter your answer"
        />

        <div className={styles.buttonGroup}>
          <Button type="submit" data-variant="primary">
            Submit
          </Button>
          <Button type="button" onClick={handleClose} data-variant="secondary">
            {formState.type === "correct" ? "Close" : "Cancel"}
          </Button>
        </div>
      </div>
    </form>
  );
}

type SuccessParagraphProps = {
  close: () => void;
};

function SuccessParagraph({ close }: SuccessParagraphProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      close();
    }, 800);

    return () => {
      clearTimeout(timeout);
    };
  }, [close]);

  return (
    <p className={clsx(styles.result, styles.correct)}>
      Correct! Well done! This will be automatically closed!
    </p>
  );
}

type IncorrectParagraphProps = {
  answer: string;
  error: Error | null;
  reset: () => void;
};

function IncorrectParagraph({ answer, error, reset }: IncorrectParagraphProps) {
  const STEP_TIME = 1;

  const WRONG_ANSWER_RESET_TIME = 5;

  const [wrongAnswerResetTime, setWrongAnswerResetTime] = useState<number>(
    WRONG_ANSWER_RESET_TIME
  );

  useEffect(() => {
    if (error) {
      return;
    }

    const timeout = setTimeout(() => {
      setWrongAnswerResetTime(wrongAnswerResetTime - 1);

      if (wrongAnswerResetTime === 0) {
        setWrongAnswerResetTime(WRONG_ANSWER_RESET_TIME);
        reset();
      }
    }, STEP_TIME * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [wrongAnswerResetTime, reset, error]);

  const text = `Incorrect! The answer is ${answer}. You can try again in ${wrongAnswerResetTime} ${
    wrongAnswerResetTime === 1 ? "second" : "seconds"
  }.`;

  return (
    <p className={clsx(styles.result, styles.incorrect)}>
      {error ? error.message : text}
    </p>
  );
}
