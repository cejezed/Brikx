export const getWizardRedirectPath = (targetPath: string): string => {
    if (typeof window !== 'undefined') {
        const isTestMode = localStorage.getItem('brikx_test_mode') === 'true';
        if (isTestMode) {
            return targetPath;
        }
    }
    return '/onderhoud';
};
