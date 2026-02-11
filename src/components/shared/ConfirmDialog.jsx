import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, destructive = false }) {
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  
  const handleFirstConfirm = () => {
    if (destructive) {
      setShowFinalWarning(true);
    } else {
      onConfirm();
      onOpenChange(false);
    }
  };

  const handleFinalConfirm = () => {
    setShowFinalWarning(false);
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setShowFinalWarning(false);
    onOpenChange(false);
  };

  return (
    <>
      <AlertDialog open={open && !showFinalWarning} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              className={destructive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showFinalWarning} onOpenChange={setShowFinalWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Final Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <strong className="text-red-700">This is your last chance!</strong>
              <br />
              <br />
              All project data, transactions, forecasts, and reports will be permanently deleted. This action cannot be undone and you will lose all your work.
              <br />
              <br />
              Are you absolutely sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>No, Keep Project</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}