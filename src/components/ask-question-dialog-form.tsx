import { LucideRefreshCcw } from "lucide-react";
import React, { use, useCallback, useState } from "react";
import { generateMathQuestion } from "../libs/generate-math-question.js";
import { i18n, type Dictionary } from "../model/i18n.ts";
import { I18nContext, useI18n } from "../store/i18n.tsx";
import {
  IncorrectParagraph,
  SuccessParagraph,
} from "./answer-status-paragraph.tsx";
import styles from "./ask-question-dialog-form.module.css";
import { useGlobalAskQuestionDialogInternal } from "./ask-question-dialog.tsx";
import { Button } from "./button.js";
import { Input } from "./input.tsx";

const dictionary = {
  close: {
    [i18n.en.tag]: "Close",
    [i18n.pt.tag]: "Fechar",
  },
  submit: {
    [i18n.en.tag]: "Submit",
    [i18n.pt.tag]: "Enviar",
  },
  cancel: {
    [i18n.en.tag]: "Cancel",
    [i18n.pt.tag]: "Cancelar",
  },
  changeChallenge: {
    [i18n.en.tag]: "Change Challenge",
    [i18n.pt.tag]: "Mudar Desafio",
  },
  enterYourAnswer: {
    [i18n.en.tag]: "Enter your answer",
    [i18n.pt.tag]: "Digite sua resposta",
  },
  userAnswerIsNotAString: {
    [i18n.en.tag]: "User answer is not a string",
    [i18n.pt.tag]: "A resposta não é uma string",
  },
  userAnswerIsEmpty: {
    [i18n.en.tag]: "User answer is empty",
    [i18n.pt.tag]: "A resposta está vazia",
  },
} as const satisfies Dictionary;

function useNumberFormat() {
  const { language } = use(I18nContext);

  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export function AskQuestionDialogForm({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const [trivia, setTrivia] = useState(() => generateMathQuestion());
  const [state] = useGlobalAskQuestionDialogInternal();
  const text = useI18n(dictionary);
  const numberFormat = useNumberFormat();

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
          throw new Error(text.userAnswerIsNotAString);
        }

        if (userAnswer.trim() === "") {
          throw new Error(text.userAnswerIsEmpty);
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
          aria-label={text.changeChallenge}
          disabled={formState.type === "incorrect"}
          data-icon
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
        <AnswerInput />

        <div className={styles.buttonGroup}>
          <Button type="submit" data-variant="primary">
            {text.submit}
          </Button>
          <Button type="button" onClick={handleClose} data-variant="secondary">
            {formState.type === "correct" ? text.close : text.cancel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function AnswerInput() {
  const [value, setValue] = useState("");
  const numberFormat = useNumberFormat();
  const text = useI18n(dictionary);

  return (
    <Input
      type="text"
      name="userAnswer"
      autoFocus
      value={value}
      onBlur={(e) => {
        const asNumber = Number.parseFloat(e.target.value);

        if (Number.isNaN(asNumber)) {
          setValue("");
        } else {
          setValue(numberFormat.format(asNumber));
        }
      }}
      onChange={(e) => setValue(e.target.value)}
      placeholder={text.enterYourAnswer}
    />
  );
}
