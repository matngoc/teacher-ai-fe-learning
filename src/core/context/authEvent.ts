type AuthListener = () => void;

let onLogout: AuthListener | null = null;

export const registerAuthLogout = (fn: AuthListener) => {
  onLogout = fn;
};

export const triggerLogout = () => {
  onLogout?.();
};
