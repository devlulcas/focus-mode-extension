import { useEffect, useState } from "react";

type State<T> =
  | {
      data: T;
      error: null;
      loading: false;
    }
  | {
      data: null;
      error: Error;
      loading: false;
    }
  | {
      data: null;
      error: null;
      loading: true;
    };

export function useAsync<T>(
  fn: (abortController: AbortController) => Promise<T>
) {
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const run = async () => {
      try {
        setState({ data: null, error: null, loading: true });
        const data = await fn(abortController);
        setState({ data, error: null, loading: false });
      } catch (error) {
        setState({ data: null, error: error as Error, loading: false });
      }
    };

    run();

    return () => {
      abortController.abort();
    };
  }, [fn]);

  return state;
}
