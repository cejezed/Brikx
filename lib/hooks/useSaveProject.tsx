
"use client";

import React, { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useAuth } from "@/lib/hooks/useAuth";
import type { WizardState } from "@/types/project";
import { useRouter } from "next/navigation";

function useSerializedProgress() {
    const fullState = useWizardState((s) => s as WizardState);

    const dataToSave = {
        projectMeta: fullState.projectMeta,
        chapterAnswers: fullState.chapterAnswers,
        currentChapter: fullState.currentChapter,
        chapterFlow: fullState.chapterFlow,
        stateVersion: fullState.stateVersion,
    };

    const payload = useMemo(
        () => ({
            meta: { ts: new Date().toISOString() },
            values: dataToSave,
        }),
        [
            fullState.stateVersion,
            fullState.currentChapter,
            fullState.chapterAnswers,
            fullState.projectMeta,
            fullState.chapterFlow,
        ]
    );

    return payload;
}

export function useSaveProject() {
    const { toast } = useToast();
    const router = useRouter();
    const wizardData = useSerializedProgress();
    const [isSaving, setIsSaving] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const handleSave = async () => {
        if (authLoading) return;

        if (!user) {
            toast({
                title: "Account vereist",
                description: "Maak een account aan of log in om uw voortgang op te slaan.",
                action: (
                    <button
                        onClick={() => router.push("/register")
                        }
                        className="bg-white text-slate-900 px-3 py-2 rounded-md text-xs font-bold"
                    >
                        Registreren
                    </button>
                ),
            });
            // Optionally redirect after a delay or let the user click
            // router.push("/register"); 
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: wizardData.values }),
            });

            const resBody = await res.json();
            if (!res.ok) throw new Error(resBody.error || "Onbekende serverfout");

            toast({
                title: "Voortgang opgeslagen",
                description: "Uw project is succesvol opgeslagen in uw account.",
            });
        } catch (e: any) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Opslaan mislukt",
                description: e?.message ?? "Er is een fout opgetreden.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        handleSave,
        isSaving,
        isAuthenticated: !!user,
        authLoading,
    };
}
