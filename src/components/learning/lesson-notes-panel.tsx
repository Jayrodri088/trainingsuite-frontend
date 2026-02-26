"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { T, useT } from "@/components/t";
import { format } from "date-fns";

const STORAGE_KEY_PREFIX = "lesson-notes-";

export interface LessonNote {
  id: string;
  content: string;
  createdAt: string;
}

function getStorageKey(lessonId: string): string {
  return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

function loadNotes(lessonId: string): LessonNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(lessonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes(lessonId: string, notes: LessonNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(lessonId), JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export function LessonNotesPanel({ lessonId }: { lessonId: string }) {
  const { t } = useT();
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const load = useCallback(() => {
    if (!lessonId) return;
    setNotes(loadNotes(lessonId));
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    const trimmed = newNote.trim();
    if (!trimmed || !lessonId) return;
    const note: LessonNote = {
      id: crypto.randomUUID(),
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const next = [note, ...notes];
    setNotes(next);
    saveNotes(lessonId, next);
    setNewNote("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!lessonId) return;
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    saveNotes(lessonId, next);
  };

  if (!lessonId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileText className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500"><T>Select a lesson to take notes.</T></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col min-h-0 border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="shrink-0 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0052CC]" />
            <h3 className="font-sans font-semibold text-black"><T>Your Notes</T></h3>
          </div>
          <p className="text-sm text-gray-500 mt-1"><T>Notes are saved on this device for this lesson.</T></p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-4 sm:p-5">
          {/* New note */}
          <div className="shrink-0 space-y-2 mb-4">
            {isAdding ? (
              <>
                <Textarea
                  placeholder={t("Write your note...")}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="resize-none rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white font-sans text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={!newNote.trim()}
                    className="rounded-lg bg-[#0052CC] hover:bg-[#003d99]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <T>Save note</T>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-gray-200"
                    onClick={() => { setIsAdding(false); setNewNote(""); }}
                  >
                    <T>Cancel</T>
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="rounded-lg border-gray-200 border-dashed hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                <T>Add note</T>
              </Button>
            )}
          </div>

          {/* List of notes */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500"><T>No notes yet for this lesson.</T></p>
                <p className="text-xs text-gray-400 mt-1"><T>Click &quot;Add note&quot; to capture something.</T></p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="group rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 p-3 sm:p-4 transition-colors"
                  >
                    <p className="text-sm font-sans text-gray-900 whitespace-pre-wrap break-words">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), "MMM d, h:mm a")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <T>Delete</T>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
