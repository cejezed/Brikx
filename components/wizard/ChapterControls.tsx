"use client";

import { useCallback } from "react";
import { useUiStore } from "@/lib/stores/useUiStore";

export default function ChapterControls({ chapters, activeIndex }:{
  chapters:{key:string; title:string}[];
  activeIndex:number;
}){
  const setCurrentChapter = useUiStore(s=>s.setCurrentChapter);
  const goPrev = useCallback(()=>{
    const i = Math.max(activeIndex-1, 0);
    setCurrentChapter(chapters[i].key);
  },[activeIndex, chapters, setCurrentChapter]);
  const goNext = useCallback(()=>{
    const i = Math.min(activeIndex+1, chapters.length-1);
    setCurrentChapter(chapters[i].key);
  },[activeIndex, chapters, setCurrentChapter]);

  if(!chapters.length) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <button type="button" onClick={goPrev} disabled={activeIndex<=0}
              className="brx-btn-ghost disabled:opacity-50">← Vorige</button>
      <div className="text-xs text-neutral-500">
        Stap {activeIndex+1} van {chapters.length}
      </div>
      <button type="button" onClick={goNext} disabled={activeIndex>=chapters.length-1}
              className="brx-btn-primary disabled:opacity-50">Volgende →</button>
    </div>
  );
}
