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

        setState(DEFAULTS);
      };

      const trivia = generateMathQuestion();

      console.log(trivia);

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
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleClose = () => {
    setUserAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
    setState(DEFAULTS);
  };

  const changeChallenge = () => {
    setUserAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
    const trivia = generateMathQuestion();
    setState({
      ...state,
      trivia,
    });
  };

  const answer = useMemo(() => {
    const intl = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      notation: "compact",
    });
    return intl.format(state.trivia.answer);
  }, [state.trivia.answer]);

  const handleSubmit = () => {
    if (userAnswer === "") {
      return;
    }

    const isCorrect = userAnswer === answer;

    setSubmitted(true);
    setIsCorrect(isCorrect);
  };

  useEffect(() => {
    if (isCorrect && submitted && state.onConfirm) {
      state.onConfirm();
    }
  }, [isCorrect, submitted]);

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
      <div className={styles.container}>
        <div className={styles.questionWrapper}>
          <p className={styles.question}>{state.trivia.question} = ?</p>
          <Button
            className={styles.refreshButton}
            onClick={changeChallenge}
            type="button"
            aria-label="Change Challenge"
          >
            <LucideRefreshCcw />
          </Button>
        </div>

        {submitted && (
          <p
            className={clsx(
              styles.result,
              isCorrect ? styles.correct : styles.incorrect
            )}
          >
            {isCorrect
              ? "Correct! Well done!"
              : `Incorrect! The answer is ${answer}`}
          </p>
        )}

        <div className={styles.inputContainer}>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            autoFocus
            className={styles.input}
            placeholder="Enter your answer"
            disabled={submitted}
          />

          <div className={styles.buttonGroup}>
            <Button
              onClick={handleSubmit}
              data-variant="primary"
              disabled={userAnswer === "" || submitted}
            >
              Submit
            </Button>
            <Button
              onClick={handleClose}
              data-variant="secondary"
              disabled={submitted}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
