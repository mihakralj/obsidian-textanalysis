import { MarkdownView } from 'obsidian';
import TextAnalysisPlugin from './main';
import readability from 'text-readability';
import { syllable as syllableCount } from 'syllable';

export interface AnalysisMetric {
    id: string;
    active: boolean;
    label: string;
    value: string;
}

interface TextMetrics {
    wordCount: number;
    sentenceCount: number;
    words: string[];
}

// Regex patterns as constants to avoid object comparison issues
const LINK_PATTERN = /\[([^[\]]+)\]\(([^()]+)\)/g;
const ITALIC_PATTERN = /([*_])([^*_]*?)\1/g;
const TABLE_PATTERN = /\|\s*(.*?)\s*\|/g;

export class AnalysisGenerator {
    private readonly plugin: TextAnalysisPlugin;
    private readonly _analysisMetrics: AnalysisMetric[];

    constructor(plugin: TextAnalysisPlugin) {
        this.plugin = plugin;
        this._analysisMetrics = [
            { id: 'Char', active: true, label: 'Character Count', value: '0' },
            { id: 'Lettr', active: true, label: 'Letter Count', value: '0' },
            { id: 'Word', active: true, label: 'Word Count', value: '0' },
            { id: 'Sent', active: true, label: 'Sentence Count', value: '0' },
            { id: 'Para', active: true, label: 'Paragraph Count', value: '0' },
            { id: 'Syll', active: true, label: 'Syllable Count', value: '0' },
            { id: 'ASen', active: true, label: 'Average Words per Sentence', value: '0' },
            { id: 'ASyl', active: true, label: 'Average Syllables per Word', value: '0' },
            { id: 'AChr', active: true, label: 'Average Characters per Word', value: '0' },
            { id: 'Diff', active: true, label: '% of Difficult Words', value: '0' },
            { id: 'SenC', active: true, label: 'Sentence Complexity', value: '0' },
            { id: 'LexD', active: true, label: 'Lexical Diversity', value: '0' },
            { id: 'FREs', active: true, label: 'Flesch Reading Ease Score', value: '0' },
            { id: 'FRDf', active: true, label: 'Flesch Reading Difficulty', value: '0' },
            { id: 'FKGL', active: true, label: 'Flesch-Kincaid Grade Level', value: '0' },
            { id: 'GFog', active: true, label: 'Gunning Fog Index', value: '0' },
            { id: 'SMOG', active: true, label: 'SMOG Index', value: '0' },
            { id: 'FCST', active: true, label: 'FORCAST Grade Level', value: '0' },
            { id: 'ARI', active: true, label: 'Automated Readability Index', value: '0' },
            { id: 'CLI', active: true, label: 'Coleman-Liau Index', value: '0' },
            { id: 'LWri', active: true, label: 'Linsear Write', value: '0' },
            { id: 'NDCh', active: true, label: 'New Dale-Chall Score', value: '0' },
            { id: 'PSK', active: true, label: 'Powers Sumner Kearl Grade', value: '0' },
            { id: 'RIX', active: true, label: 'Rix Readability ', value: '0' },
            { id: 'RIXD', active: true, label: 'Rix Difficulty ', value: '0' },
            { id: 'LIX', active: true, label: 'Lix Readability ', value: '0' },
            { id: 'LIXD', active: true, label: 'Lix Difficulty ', value: '0' },
            { id: 'GrdM', active: true, label: 'Grade level (consensus)', value: '0' },
            { id: 'Rdbl', active: true, label: 'Readability Rating', value: '0' },
            { id: 'GrdL', active: true, label: 'Reading level', value: '0' },
            { id: 'RdTm', active: true, label: 'Reading time', value: '0:00' },
            { id: 'SpkT', active: true, label: 'Speaking time', value: '0:00' },
        ];
    }

    // Public getter for analysisMetrics
    get analysisMetrics(): AnalysisMetric[] {
        return this._analysisMetrics;
    }

    displayAnalysis(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = 'margin-left: 0; margin-right: 0; overflow-y: auto; max-height: 800px;';

        const table = document.createElement('table');
        table.classList.add('nav-folder-title');
        table.style.cssText = 'width: 100%; border-collapse: collapse;';

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        const color = window.getComputedStyle(document.body).color.match(/\d+/g);
        const borderColor = color ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.05)` : 'rgba(0, 0, 0, 0.05)';

        this._analysisMetrics
            .filter(item => item.active)
            .forEach(item => {
                const row = tbody.insertRow();
                const [labelCell, valueCell] = [row.insertCell(), row.insertCell()];

                labelCell.textContent = item.label;
                labelCell.style.cssText = `text-align: left; padding: 2px 10px 2px 0px; width: 100%; white-space: nowrap; border-bottom: 1px solid ${borderColor}`;

                valueCell.textContent = item.value;
                valueCell.dataset.id = item.id;
                valueCell.style.cssText = `text-align: right; padding: 2px 10px 2px 0px; width: 100%; white-space: nowrap; border-bottom: 1px solid ${borderColor}`;
            });

        container.appendChild(table);
        container.appendChild(this.createSpacer());
        return container;
    }

    private createSpacer(): HTMLElement {
        const spacer = document.createElement('div');
        spacer.style.height = '30px';
        return spacer;
    }

    removeMarkdownFormatting(text: string): string {
        const markdownPatterns = [
            /^#+\s+/gm,                           // Headers
            /(\*\*|__)(.*?)\1/g,                 // Bold
            /([*_])([^*_]*?)\1/g,               // Italic
            /\[([^[\]]+)\]\(([^()]+)\)/g,       // Links
            /!\[([^\]]*)\]\(([^)]+)\)/g,        // Images
            /^>\s+/gm,                          // Blockquotes
            /^---[\r\n][\s\S]*?---[\r\n]/gm,   // Front matter
            /(?<!\r?\n)\r?\n(?!\r?\n)/g,       // Single newlines
            /^[-*_]{3,}\s*$/gm,                // Horizontal rules
            /`([^`]*)`/g,                      // Inline code
            /```([\s\S]*?)```/g,               // Code blocks
            /^\s*[*\-+]\s+/gm,                 // Unordered lists
            /^\s*\d+\.\s+/gm,                  // Ordered lists
            /^\s*\[([^]]+)\]:\s*(.+)$/gm,     // Reference links
            /~~(.*?)~~/g,                      // Strikethrough
            /^\[\^([^\]]+)\]:\s*(.+)$/gm,     // Footnotes
            /\|\s*(.*?)\s*\|/g,                // Tables
            /^\|?[-:]+\|[-:| ]+\s*$/gm,       // Table formatting
            / +/g                              // Multiple spaces
        ];

        return markdownPatterns.reduce((text, pattern) => {
            const patternStr = pattern.toString();
            if (patternStr === LINK_PATTERN.toString()) return text.replace(pattern, '$1');
            if (patternStr === ITALIC_PATTERN.toString()) return text.replace(pattern, '$2');
            if (patternStr === TABLE_PATTERN.toString()) return text.replace(pattern, ' $1 ');
            return text.replace(pattern, '');
        }, text);
    }

    private getBaseTextMetrics(text: string): TextMetrics {
        const words = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) ?? [];
        const sentenceCount = (text.split(/[.!?]/).length - 1) || 0;
        return {
            words,
            wordCount: words.length,
            sentenceCount
        };
    }

    async calculateAndUpdate(id: string, calculation: () => string): Promise<void> {
        try {
            const result = await Promise.resolve(calculation());
            const valueCell = document.querySelector(`td[data-id="${id}"]`);
            if (valueCell) {
                valueCell.textContent = result;
            }
            const metric = this._analysisMetrics.find(metric => metric.id === id);
            if (metric) {
                metric.value = result;
            }
        } catch (error) {
            console.error(`Error calculating metric ${id}:`, error);
        }
    }

    updateAnalysisValues(): void {
        const text = this.getActiveText();
        if (!text) return;

        const metrics = this.getBaseTextMetrics(text);
        this.updateBasicMetrics(text, metrics);
        this.updateAdvancedMetrics(text, metrics);
        this.updateReadabilityMetrics(text, metrics);
        this.updateTimeMetrics(text);
    }

    private getActiveText(): string {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            this.plugin.updateHeaderElementContent('Selection');
            return this.removeMarkdownFormatting(selection.toString());
        }

        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return '';

        this.plugin.updateHeaderElementContent('Document');
        return this.removeMarkdownFormatting(activeView.editor.getValue());
    }

    private updateBasicMetrics(text: string, metrics: TextMetrics): void {
        this.calculateAndUpdate('Char', () => readability.charCount(text, false).toString());
        this.calculateAndUpdate('Lettr', () => readability.letterCount(text).toString());
        this.calculateAndUpdate('Word', () => metrics.wordCount.toString());
        this.calculateAndUpdate('Sent', () => metrics.sentenceCount.toString());
        this.calculateAndUpdate('Para', () => (text.match(/[^\n]+\s*/g)?.length || 0).toString());
        this.calculateAndUpdate('Syll', () => readability.syllableCount(text).toString());
    }

    private updateAdvancedMetrics(text: string, metrics: TextMetrics): void {
        this.calculateAndUpdate('ASen', () => readability.averageSentenceLength(text).toString());
        this.calculateAndUpdate('ASyl', () => readability.averageSyllablePerWord(text).toString());
        this.calculateAndUpdate('AChr', () => readability.averageCharacterPerWord(text).toString());
        this.calculateDifficultWords(metrics);
        this.calculateSentenceComplexity(text, metrics);
        this.calculateAndUpdate('LexD', () => readability.lexiconCount(text).toString());
    }

    private updateReadabilityMetrics(text: string, metrics: TextMetrics): void {
        this.calculateAndUpdate('GrdL', () => readability.textStandard(text));
        this.calculateAndUpdate('GrdM', () => readability.textMedian(text));
        this.calculateFleschMetrics(text);
        this.calculateOtherReadabilityIndices(text);
        this.calculateCustomReadabilityMetrics(text, metrics);
    }

    private updateTimeMetrics(text: string): void {
        this.calculateAndUpdate('RdTm', () => TextUtils.getReadingTimes(text));
        this.calculateAndUpdate('SpkT', () => TextUtils.getSpeakingTimes(text));
    }

    private calculateDifficultWords(metrics: TextMetrics): void {
        this.calculateAndUpdate('Diff', () => {
            const difficult = readability.difficultWords(metrics.words.join(' '), 3);
            const result = (difficult / metrics.wordCount) * 100;
            return result === 0 ? '0%' : `${parseFloat(result.toFixed(2))}%`;
        });
    }

    private calculateSentenceComplexity(text: string, metrics: TextMetrics): void {
        this.calculateAndUpdate('SenC', () => {
            if (metrics.sentenceCount === 0) return '0';
            const clauseMarkers = /,|;|and|or|but|although|because/g;
            const totalClauses = text.split(/[.!?]+/)
                .filter(Boolean)
                .reduce((total, sentence) => total + (sentence.match(clauseMarkers)?.length || 0) + 1, 0);
            return (totalClauses / metrics.sentenceCount).toFixed(1);
        });
    }

    private calculateFleschMetrics(text: string): void {
        const fleschScore = readability.fleschReadingEase(text);
        this.calculateAndUpdate('FREs', () => fleschScore.toString());
        this.calculateAndUpdate('FRDf', () => TextUtils.getDifficultyFromScore(fleschScore));
        this.calculateAndUpdate('FKGL', () => readability.fleschKincaidGrade(text).toString());
    }

    private calculateOtherReadabilityIndices(text: string): void {
        this.calculateAndUpdate('GFog', () => readability.gunningFog(text).toFixed(1));
        this.calculateAndUpdate('SMOG', () => readability.smogIndex(text).toFixed(1));
        this.calculateAndUpdate('FCST', () => TextUtils.getFORCAST(text).toFixed(1));
        this.calculateAndUpdate('ARI', () => readability.automatedReadabilityIndex(text).toString());
        this.calculateAndUpdate('CLI', () => readability.colemanLiauIndex(text).toString());
        this.calculateAndUpdate('LWri', () => readability.linsearWriteFormula(text).toString());
        this.calculateAndUpdate('NDCh', () => readability.daleChallReadabilityScore(text).toString());
    }

    private calculateCustomReadabilityMetrics(text: string, metrics: TextMetrics): void {
        this.calculatePSKGrade(metrics);
        this.calculateRixMetrics(text, metrics);
        this.calculateLixMetrics(text, metrics);
        this.calculateReadabilityRating(text);
    }

    private calculatePSKGrade(metrics: TextMetrics): void {
        this.calculateAndUpdate('PSK', () => {
            if (metrics.sentenceCount === 0) return '0';
            const avgSentenceLength = metrics.wordCount / metrics.sentenceCount;
            const avgSyllables = metrics.words.reduce((acc, word) => acc + syllableCount(word), 0) / metrics.wordCount;
            return ((0.0778 * avgSentenceLength) + (0.0455 * avgSyllables) + 2.797).toFixed(2);
        });
    }

    private calculateRixMetrics(text: string, metrics: TextMetrics): void {
        const longWords = text.match(/\b\w{6,}\b/g) ?? [];
        const rixScore = metrics.sentenceCount === 0 ? 0 : longWords.length / metrics.sentenceCount;

        this.calculateAndUpdate('RIX', () => rixScore.toFixed(1));
        this.calculateAndUpdate('RIXD', () => TextUtils.getRixDifficulty(rixScore));
    }

    private calculateLixMetrics(text: string, metrics: TextMetrics): void {
        if (metrics.sentenceCount === 0 || metrics.wordCount === 0) {
            this.calculateAndUpdate('LIX', () => '0');
            this.calculateAndUpdate('LIXD', () => '');
            return;
        }

        const longWords = metrics.words.filter(word => word.length > 6);
        const lixScore = (metrics.wordCount / metrics.sentenceCount) + ((longWords.length / metrics.wordCount) * 100);

        this.calculateAndUpdate('LIX', () => lixScore.toFixed(1));
        this.calculateAndUpdate('LIXD', () => TextUtils.getLixDifficulty(lixScore));
    }

    private calculateReadabilityRating(text: string): void {
        this.calculateAndUpdate('Rdbl', () => {
            const score = parseFloat(readability.textMedian(text));
            return TextUtils.getReadabilityGrade(score);
        });
    }
}

class TextUtils {
    static getDifficultyFromScore(score: number): string {
        if (score >= 90) return "Very Easy";
        if (score >= 80) return "Easy";
        if (score >= 70) return "Fairly Easy";
        if (score >= 60) return "Standard";
        if (score >= 50) return "Fairly Difficult";
        if (score >= 30) return "Difficult";
        return "Very Confusing";
    }

    static getFORCAST(text: string): number {
        const words = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) ?? [];
        const oneSyllableCount = words.filter(word => syllableCount(word) === 1).length;
        const scaledOneSyllableCount = (oneSyllableCount / words.length) * 150;
        return 20 - (scaledOneSyllableCount / 10);
    }

    static getReadingTimes(text: string): string {
        const wordCount = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) ?? []).length;
        return `${this.convertToHMS(wordCount / 250)} - ${this.convertToHMS(wordCount / 200)}`;
    }

    static getSpeakingTimes(text: string): string {
        const wordCount = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) ?? []).length;
        return `${this.convertToHMS(wordCount / 150)} - ${this.convertToHMS(wordCount / 125)}`;
    }

    static convertToHMS(minutes: number): string {
        const totalSeconds = Math.round(minutes * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${secs}s`;
    }

    static getRixDifficulty(score: number): string {
        if (score < 4) return 'Easy';
        if (score < 6) return 'Moderate';
        return 'Complex';
    }

    static getLixDifficulty(score: number): string {
        if (score < 30) return 'Very easy';
        if (score < 40) return 'Easy';
        if (score < 50) return 'Medium';
        if (score < 60) return 'Difficult';
        return 'Very difficult';
    }

    static getReadabilityGrade(score: number): string {
        if (score >= 7 && score <= 8) return 'A';
        if ((score >= 6 && score < 7) || (score >= 8.1 && score < 9)) return 'A-';
        if ((score >= 5 && score < 6) || (score >= 9 && score < 10)) return 'B+';
        if ((score >= 4 && score < 5) || (score >= 10 && score < 11)) return 'B';
        if ((score >= 3 && score < 4) || (score >= 11 && score < 12)) return 'B-';
        if ((score >= 2 && score < 3) || (score >= 12 && score < 13)) return 'C+';
        if ((score >= 1 && score < 2) || (score >= 13 && score < 14)) return 'C';
        if (score === 1 || (score >= 14 && score < 15)) return 'C-';
        if (score >= 15) return 'D';
        return 'Invalid Score';
    }
}
