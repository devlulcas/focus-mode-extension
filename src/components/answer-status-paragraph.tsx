import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { i18n, interpolate, type Dictionary } from "../model/i18n.ts";
import { useI18n } from "../store/i18n.tsx";
import styles from "./answer-status-paragraph.module.css";

const dictionary = {
  correct: {
    [i18n.en.tag]: "Correct! Well done! This will be automatically closed!",
    [i18n.pt.tag]: "Correto! Muito bem! Isso será automaticamente fechado!",
  },
  incorrect: {
    [i18n.en.tag]:
      "Incorrect! The answer is {answer}. You can try again in {time} {seconds}.",
    [i18n.pt.tag]:
      "Incorreto! A resposta é {answer}. Você pode tentar novamente em {time} {seconds}.",
  },
  seconds: {
    [i18n.en.tag]: "second",
    [i18n.pt.tag]: "segundo",
  },
  secondsPlural: {
    [i18n.en.tag]: "seconds",
    [i18n.pt.tag]: "segundos",
  },
} as const satisfies Dictionary;

type SuccessParagraphProps = {
  close: () => void;
};

export function SuccessParagraph({ close }: SuccessParagraphProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      close();
    }, 800);

    return () => {
      clearTimeout(timeout);
    };
  }, [close]);

  const text = useI18n(dictionary);

  return <p className={clsx(styles.result, styles.correct)}>{text.correct}</p>;
}

type IncorrectParagraphProps = {
  answer: string;
  error: Error | null;
  reset: () => void;
};

export function IncorrectParagraph({
  answer,
  error,
  reset,
}: IncorrectParagraphProps) {
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
      const time = wrongAnswerResetTime - 1;
      setWrongAnswerResetTime(time);

      if (time === 0) {
        setWrongAnswerResetTime(WRONG_ANSWER_RESET_TIME);
        reset();
      }
    }, STEP_TIME * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [wrongAnswerResetTime, reset, error]);

  const text = useI18n(dictionary);

  const incorrectText = interpolate(text.incorrect, {
    answer,
    time: wrongAnswerResetTime.toString(),
    seconds: wrongAnswerResetTime === 1 ? text.seconds : text.secondsPlural,
  });

  return (
    <p className={clsx(styles.result, styles.incorrect)}>
      {error ? error.message : incorrectText}
    </p>
  );
}
