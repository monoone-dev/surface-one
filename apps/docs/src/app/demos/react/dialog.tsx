import { useState } from "react";
import {
  SoneAlertDialog,
  SoneButton,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneField,
  SoneFieldLabel,
} from "@surface-one/react";

export default function DialogDemo() {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div className="demo-row">
        <SoneButton variant="outline" type="button" onClick={() => setRenameOpen(true)}>Rename note…</SoneButton>
        <SoneButton variant="destructive" type="button" onClick={() => setDeleteOpen(true)}>Delete note…</SoneButton>
        <SoneButton variant="ghost" type="button" onClick={() => setDetailsOpen(true)}>Note details</SoneButton>
      </div>

      {renameOpen && (
        <SoneDialog onDismiss={() => setRenameOpen(false)}>
          <SoneDialogHeader as="header">
            <SoneDialogTitle>Rename note</SoneDialogTitle>
            <SoneDialogDescription>The new name shows everywhere this note appears.</SoneDialogDescription>
          </SoneDialogHeader>
          <SoneField>
            <SoneFieldLabel htmlFor="rename-note">Name</SoneFieldLabel>
            <input id="rename-note" type="text" defaultValue="Q4 planning" data-autofocus="select" />
          </SoneField>
          <SoneDialogFooter as="footer">
            <SoneButton variant="outline" type="button" onClick={() => setRenameOpen(false)}>Cancel</SoneButton>
            <SoneButton type="button" onClick={() => setRenameOpen(false)}>Save</SoneButton>
          </SoneDialogFooter>
        </SoneDialog>
      )}

      {deleteOpen && (
        <SoneAlertDialog onDismiss={() => setDeleteOpen(false)}>
          <SoneDialogHeader as="header">
            <SoneDialogTitle>Delete “Q4 planning”?</SoneDialogTitle>
            <SoneDialogDescription>The note moves to Trash. You can restore it for 30 days.</SoneDialogDescription>
          </SoneDialogHeader>
          <SoneDialogFooter as="footer">
            <SoneButton variant="outline" type="button" data-autofocus onClick={() => setDeleteOpen(false)}>Cancel</SoneButton>
            <SoneButton variant="destructive" type="button" onClick={() => setDeleteOpen(false)}>Delete</SoneButton>
          </SoneDialogFooter>
        </SoneAlertDialog>
      )}

      {/* open + onOpenChange show and hide it; a dismissal reports false. */}
      <SoneDialog open={detailsOpen} onOpenChange={setDetailsOpen} size="xs">
        <SoneDialogHeader as="header">
          <SoneDialogTitle>Note details</SoneDialogTitle>
          <SoneDialogDescription>Created on 2 October by Ana Silva.</SoneDialogDescription>
        </SoneDialogHeader>
        <SoneDialogFooter as="footer">
          <SoneButton type="button" onClick={() => setDetailsOpen(false)}>Done</SoneButton>
        </SoneDialogFooter>
      </SoneDialog>
    </>
  );
}
