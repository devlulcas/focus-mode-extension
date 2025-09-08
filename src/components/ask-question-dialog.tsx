import clsx from "clsx";
import { LucideRefreshCcw } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { generateMathQuestion } from "../libs/generate-math-question.js";
import styles from "./ask-question-dialog.module.css";
import { Button } from "./button.js";

type State = {
  isOpen: boolean;
  trivia: { question: string; answer: number };
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
};

const DEFAULTS: State = {
  isOpen: false,
  trivia: { question: "", answer: 0 },
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

  const wrap = useCallback(
    (options: WrapOnAskQuestionOptions) => {
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

      const trivia = generateMathQuestion();

      setState({
        isOpen: true,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        trivia,
      });
    },
    [setState]
  );

  return { wrap };
}

function AskQuestionDialogUI() {
  const [state, setState] = useGlobalAskQuestionDialogInternal();
  const [userAnswer, setUserAnswer] = useState<string>("");

  const [formState, setFormState] = useState<"idle" | "correct" | "incorrect">(
    "idle"
  );

  const resetFormState = useCallback(() => {
    setUserAnswer("");
    setFormState("idle");
  }, []);

  const handleClose = useCallback(() => {
    resetFormState();
    setState(DEFAULTS);
  }, [resetFormState, setState]);

  const changeChallenge = useCallback(() => {
    resetFormState();

    const trivia = generateMathQuestion();

    setState((prev) => ({
      ...prev,
      trivia,
    }));
  }, [resetFormState, setState]);

  const answer = useMemo(() => {
    const intl = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      notation: "compact",
    });
    return intl.format(state.trivia.answer);
  }, [state.trivia.answer]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (userAnswer === "") {
        return;
      }

      const isCorrect = userAnswer === answer;

      if (isCorrect && state.onConfirm) {
        state.onConfirm?.();
      }

      setFormState(isCorrect ? "correct" : "incorrect");
    },
    [userAnswer, answer, setFormState, state.onConfirm]
  );

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
      <form className={styles.container} onSubmit={handleSubmit}>
        <div className={styles.questionWrapper}>
          <p className={styles.question}>{state.trivia.question} = ?</p>
          <Button
            className={styles.refreshButton}
            onClick={changeChallenge}
            type="button"
            aria-label="Change Challenge"
            disabled={formState === "incorrect"}
          >
            <LucideRefreshCcw />
          </Button>
        </div>

        {formState === "correct" && <SuccessParagraph />}

        {formState === "incorrect" && (
          <IncorrectParagraph
            answer={answer}
            changeChallenge={changeChallenge}
          />
        )}

        <div className={styles.inputContainer}>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            autoFocus
            className={styles.input}
            placeholder="Enter your answer"
            disabled={formState === "incorrect"}
          />

          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              data-variant="primary"
              disabled={userAnswer === "" || formState === "incorrect"}
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              data-variant="secondary"
              disabled={formState === "incorrect"}
            >
              {formState === "correct" ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function SuccessParagraph() {
  const [_, setState] = useGlobalAskQuestionDialogInternal();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setState(DEFAULTS);
    }, 800);

    return () => {
      clearTimeout(timeout);
    };
  }, [setState]);

  return (
    <p className={clsx(styles.result, styles.correct)}>
      Correct! Well done! This will be automatically closed!
    </p>
  );
}

type IncorrectParagraphProps = {
  answer: string;
  changeChallenge: () => void;
};

function IncorrectParagraph({
  answer,
  changeChallenge,
}: IncorrectParagraphProps) {
  const STEP_TIME = 1;

  const WRONG_ANSWER_RESET_TIME = 5;

  const [wrongAnswerResetTime, setWrongAnswerResetTime] = useState<number>(
    WRONG_ANSWER_RESET_TIME
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWrongAnswerResetTime(wrongAnswerResetTime - 1);

      if (wrongAnswerResetTime === 0) {
        setWrongAnswerResetTime(WRONG_ANSWER_RESET_TIME);
        changeChallenge();
      }
    }, STEP_TIME * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [wrongAnswerResetTime, changeChallenge]);

  const text = `Incorrect! The answer is ${answer}. You can try again in ${wrongAnswerResetTime} ${
    wrongAnswerResetTime === 1 ? "second" : "seconds"
  }.`;

  return <p className={clsx(styles.result, styles.incorrect)}>{text}</p>;
}
