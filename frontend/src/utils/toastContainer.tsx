import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type ToastType = "success" | "error";

const toastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

export const showToast = (message: string, type: ToastType = "success") => {
  if (type === "error") {
    toast.error(message, toastOptions);
  } else {
    toast.success(message, toastOptions);
  }
};

export const Toast = () => <ToastContainer />;