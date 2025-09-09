import { LucideLock, LucidePause, LucidePlay } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { i18n, interpolate, type Dictionary } from "../model/i18n.ts";
import { useSyncBlockedWebsites } from "../store/blocked-websites.js";
import { useSyncEnabled } from "../store/enabled.js";
import { useI18n } from "../store/i18n.tsx";
import styles from "./blocked-dialog.module.css";
import { Button } from "./button.tsx";

const dictionary = {
  accessBlocked: {
    [i18n.en.tag]: "Access Blocked",
    [i18n.pt.tag]: "Acesso Bloqueado",
  },
  accessBlockedDescription: {
    [i18n.en.tag]:
      "You are blocked from accessing this website. Focus on your work!",
    [i18n.pt.tag]:
      "Você está bloqueado de acessar este site. Foque no seu trabalho!",
  },
  resumeMedia: {
    [i18n.en.tag]: "Resume Media",
    [i18n.pt.tag]: "Resumir Mídia",
  },
  pauseMedia: {
    [i18n.en.tag]: "Pause Media",
    [i18n.pt.tag]: "Pausar Mídia",
  },
  elementsPaused: {
    [i18n.en.tag]: "{pausedLength} of {elsLength} elements paused",
    [i18n.pt.tag]: "{pausedLength} de {elsLength} elementos pausados",
  },
} as const satisfies Dictionary;

export function BlockedDialog() {
  const blockedWebsites = useSyncBlockedWebsites();
  const enabled = useSyncEnabled();
  const text = useI18n(dictionary);

  const currentDocumentIsBlocked = blockedWebsites.some(
    (b) => b.domain === window.location.hostname && b.blocked
  );

  const isBlocked = currentDocumentIsBlocked && enabled;

  if (!isBlocked) {
    return null;
  }

  return (
    <dialog
      ref={(el) => {
        if (el) {
          el.showModal();
          window.scrollTo(0, 0);
        }
      }}
      className={styles.dialog}
      onClose={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.showModal();
      }}
    >
      <div className={styles.iconContainer}>
        <LucideLock className={styles.icon} size={48} />
      </div>
      <h1 className={styles.title}>{text.accessBlocked}</h1>
      <p className={styles.description}>{text.accessBlockedDescription}</p>
      <PauseMediaButton />

      <style>
        {`
          body {
            overflow: hidden !important;
            height: 100vh !important;
            width: 100vw !important;
          }
        `}
      </style>
    </dialog>
  );
}

function PauseMediaButton() {
  const [paused, setPaused] = useState<boolean[]>([]);
  const [els, setEls] = useState<(HTMLVideoElement | HTMLAudioElement)[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const text = useI18n(dictionary);

  const fetchEls = useCallback(() => {
    const videoEls = document.querySelectorAll("video");
    const audioEls = document.querySelectorAll("audio");
    const elsWithPause = [...Array.from(videoEls), ...Array.from(audioEls)];
    setEls(elsWithPause);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (els.length === 0) {
        fetchEls();
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [fetchEls]);

  const pauseMedia = () => {
    fetchEls();

    const newPaused = els.map((el) => {
      if (el.paused === false) {
        el.pause();
        return true;
      }
      return false;
    });

    setPaused(newPaused);
    setIsPaused(true);
  };

  const resumeMedia = () => {
    paused.forEach((bool, index) => {
      if (bool) {
        els?.[index]?.play();
      }
    });

    setPaused(paused.map(() => false));
    setIsPaused(false);
  };

  const elsLength = els.length;
  const pausedLength = paused.filter(Boolean).length;

  const title =
    els.length > 0
      ? interpolate(text.elementsPaused, {
          pausedLength,
          elsLength,
        })
      : "";

  const handleClick = () => {
    if (isPaused) {
      resumeMedia();
    } else {
      pauseMedia();
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <Button data-variant="primary" onClick={handleClick} title={title}>
        {isPaused ? text.resumeMedia : text.pauseMedia}
        {isPaused ? (
          <LucidePlay size={16} fill="currentColor" className={styles.icon} />
        ) : (
          <LucidePause size={16} fill="currentColor" className={styles.icon} />
        )}
      </Button>
    </div>
  );
}
