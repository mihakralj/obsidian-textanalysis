declare module 'text-readability' {
    class Readability {
        charCount(text: string, ignoreSpaces?: boolean): number;
        letterCount(text: string): number;
        syllableCount(text: string): number;
        averageSentenceLength(text: string): number;
        averageSyllablePerWord(text: string): number;
        averageCharacterPerWord(text: string): number;
        difficultWords(text: string, syllableThreshold?: number): number;
        lexiconCount(text: string): number;
        textStandard(text: string): string;
        textMedian(text: string): string;
        fleschReadingEase(text: string): number;
        fleschKincaidGrade(text: string): number;
        gunningFog(text: string): number;
        smogIndex(text: string): number;
        automatedReadabilityIndex(text: string): number;
        colemanLiauIndex(text: string): number;
        linsearWriteFormula(text: string): number;
        daleChallReadabilityScore(text: string): number;
    }

    const readability: Readability;
    export default readability;
}
