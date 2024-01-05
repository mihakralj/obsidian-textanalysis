import { MarkdownView } from 'obsidian';
import TextAnalysisPlugin from 'main';
import * as textReadability from 'text-readability';
import { syllable } from 'syllable';

// AnalysisGenerator class
//const syllable = require('syllable');

export class AnalysisGenerator {
    syllable: any;
    analysisMetrics: Array<{ id: string; active: boolean; label: string; value: string; }>;
    plugin: TextAnalysisPlugin;
    constructor(plugin: TextAnalysisPlugin) {
        this.analysisMetrics = [
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

/*

CEFR Level: The Common European Framework of Reference for Languages level indicating the difficulty of the text for language learnetextReadability.
IELTS Level: Reflecting the International English Language Testing System band level.
Spache Score: A readability formula specifically designed for primary-grade reading materials.
*/


        this.plugin = plugin;
    }

    displayAnalysis(): HTMLElement {
        const container = document.createElement('div');
        container.style.marginLeft = '0';
        container.style.marginRight = '0';
        container.style.overflowY = 'auto';
        container.style.maxHeight = '800px';

        const table = document.createElement('table');
        table.classList.add('nav-folder-title');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        this.analysisMetrics.forEach(item => {
            if (item.active) {
                const row = tbody.insertRow();
            const labelCell = row.insertCell();
            labelCell.textContent = item.label;
            labelCell.style.textAlign = 'left';
            const valueCell = row.insertCell();
            valueCell.textContent = item.value;
            valueCell.dataset.id = item.id;
            valueCell.style.textAlign = 'right';
            }
        });

        tbody.querySelectorAll('td').forEach(cell => {
            cell.style.padding = '2px 10px 2px 0px';
            cell.style.width = '100%';
            cell.style.whiteSpace = 'nowrap';
            const color = window.getComputedStyle(document.body).color.match(/\d+/g);
            if (color) {
                cell.style.borderBottom = `1px solid rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.05)`;
            } else {
                cell.style.borderBottom = '1px solid rgba(0, 0, 0, 0.05)';
            }
        });

        container.appendChild(table);

        const spacer = document.createElement('div');
        spacer.style.height = '30px';
        container.appendChild(spacer);

        return container;
    }

    removeMarkdownFormatting(text: string) {
        const transform =  text
            // Remove headers (lines starting with one or more # characters)
            .replace(/^#+\s+/gm, '')
            // Remove emphasis and bold (text surrounded by *, **, _, or __)
            .replace(/(\*\*|\*|__|_)(.*?)\1/g, '$2')
            // Remove links ([text](url))
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
            // Remove images (![alt text](url))
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')
            // Remove blockquotes (lines starting with >)
            .replace(/^>\s+/gm, '')
            // Remove properties section (lines between --- and ---)
            .replace(/^---[\r\n][\s\S]*?---[\r\n]/gm, '')
            // Replace single line breaks with a space, preserve double line breaks
            .replace(/(?<!\r?\n)\r?\n(?!\r?\n)/g, ' ')
            // Remove horizontal rules (lines of ---, ***, or ___)
            .replace(/^[-*_]{3,}\s*$/gm, '')
            // Remove inline code (text surrounded by `)
            .replace(/`([^`]*)`/g, '$1')
            // Remove code blocks (text between ``` and ```)
            .replace(/```([\s\S]*?)```/g, '$1')
            // Remove unordered list markings (lines starting with *, -, or +)
            .replace(/^\s*[*\-+]\s+/gm, '')
            // Remove ordered list markings (lines starting with a number followed by .)
            .replace(/^\s*\d+\.\s+/gm, '')
            // Remove reference-style links ([id]: url "optional title")
            .replace(/^\s*\[([^]]+)\]:\s*(.+)$/gm, '')
            // Remove strikethrough (text surrounded by ~~)
            .replace(/~~(.*?)~~/g, '$1')
            // Remove footnotes
            .replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, '')
            // Remove table structure but keep content
            .replace(/\|\s*(.*?)\s*\|/g, ' $1 ')
            // Remove horizontal lines in tables
            .replace(/^\|?[-:]+\|[-:| ]+\s*$/gm, '')
            // Replace multiple spaces with a single space
            .replace(/ +/g, ' ')

        console.log(transform)
        return transform;
    }

    sentenceCount(text: string): number {
        const sentences = text.split(/[.!?]/);
        return sentences.length-1;
    }

    async calculateAndUpdate(id: string, calculation: () => string) {
        const result = await Promise.resolve(calculation());
        const valueCell = document.querySelector(`td[data-id="${id}"]`);
        if (valueCell) {
            valueCell.textContent = result;
        }
        const metric = this.analysisMetrics.find(metric => metric.id === id);
        if (metric) {
            metric.value = result;
        }
    }

    updateAnalysisValues(): void {
        let text: string;

        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            this.plugin.updateHeaderElementContent('Selection');
            text = this.removeMarkdownFormatting(selection.toString());
        } else {
            this.plugin.updateHeaderElementContent('Document');
            const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                const editor = activeView.editor;
                text = this.removeMarkdownFormatting(editor.getValue());
            } else {
                return;
            }
        }

        // Character count
        this.calculateAndUpdate('Char', () => textReadability.charCount(text, false).toString());

        // Glyphs count (no spaces)
        this.calculateAndUpdate('Lettr', () => textReadability.letterCount(text).toString());

        // Unicode words count including apostrophes, hyphens, numbers
        this.calculateAndUpdate('Word', () => {
            const matches = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu);
            return matches ? matches.length.toString() : '0';
        });

        // Sentence count
        this.calculateAndUpdate('Sent', () => this.sentenceCount(text).toString());

        // Paragraph count
        this.calculateAndUpdate('Para', () => {
            const matches = text.match(/[^\n]+\s*/g);
            return matches ? matches.length.toString() : '0';
        });

        // Syllable count
        this.calculateAndUpdate('Syll', () => textReadability.syllableCount(text).toString());

        // Average Sentence Length
        this.calculateAndUpdate('ASen', () => textReadability.averageSentenceLength(text).toString());

        // Average Syllables per word
        this.calculateAndUpdate('ASyl', () => textReadability.averageSyllablePerWord(text).toString());

        // Average Char per word
        this.calculateAndUpdate('AChr', () => textReadability.averageCharacterPerWord(text).toString());

        this.calculateAndUpdate('Diff', () => {
            const matches = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu);
            const words = matches ? matches.length : 0;
            const difficult = textReadability.difficultWords(text,3)
            const result = difficult/words*100;
            return result === 0 ? '0%' : parseFloat(result.toFixed(2)) + "%";
        });

        this.calculateAndUpdate('SenC', () => {
            const sentences = text.split(/[.!?]+/).filter(Boolean);
            const totalClauses = sentences.reduce((total, sentence) => {
                const clauseMarkers = /,|;|and|or|but|although|because/g;
                return total + sentence.split(clauseMarkers).length;
            }, 0);
            return (sentences.length > 0 ? totalClauses / sentences.length : 0).toFixed(1);
        });


        // Lexical Diversity
        this.calculateAndUpdate('LexD', () => textReadability.lexiconCount(text).toString());

        // Grade Level (consensus)
        this.calculateAndUpdate('GrdL', () => textReadability.textStandard(text).toString());

        // Grade Median (consensus)
        this.calculateAndUpdate('GrdM', () => textReadability.textMedian(text).toString());

        // Flesch-Kincaid Reading Ease
        this.calculateAndUpdate('FREs', () => textReadability.fleschReadingEase(text).toString());

        // Flesch Reading Difficulty
        this.calculateAndUpdate('FRDf', () => AnalysisGenerator.getDifficultyFromScore(textReadability.fleschReadingEase(text)));

        // Flesch-Kincaid Grade Level
        this.calculateAndUpdate('FKGL', () => textReadability.fleschKincaidGrade(text).toString());

        // Gunning Fog Index
        this.calculateAndUpdate('GFog', () => textReadability.gunningFog(text).toFixed(1));

        // SMOG Index
        this.calculateAndUpdate('SMOG', () => textReadability.smogIndex(text).toFixed(1));

        // FORCAST Index
        this.calculateAndUpdate('FCST', () => AnalysisGenerator.getFORCAST(text).toFixed(1));

        // Automated Readability Index
        this.calculateAndUpdate('ARI', () => textReadability.automatedReadabilityIndex(text).toString());

        // Coleman-Liau Index
        this.calculateAndUpdate('CLI', () => textReadability.colemanLiauIndex(text).toString());

        // Linsear Write Formula
        this.calculateAndUpdate('LWri', () => textReadability.linsearWriteFormula(text).toString());

        // Dale-Chall Readability Score
        this.calculateAndUpdate('NDCh', () => textReadability.daleChallReadabilityScore(text).toString());

        // PSK
        this.calculateAndUpdate('PSK', () => {
            const words = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || []).filter(Boolean);
            const sentenceCount = this.sentenceCount(text);

            if (sentenceCount === 0) {
                return '0'; // or handle empty text case as per your requirement
            }

            const averageSentenceLength = words.length / sentenceCount;
            const averageWordLength = words.reduce((acc, word) => acc + syllable(word), 0) / words.length;

            return ((0.0778 * averageSentenceLength) + (0.0455 * averageWordLength) + 2.797).toFixed(2);
        });

        // Rix Readability
        this.calculateAndUpdate('RIX', () => {
            const longWords = (text.match(/\b\w{6,}\b/g) || []);
            const sentenceCount = this.sentenceCount(text);

            if (sentenceCount === 0) {
                return '0';
            }
            const rixScore = longWords.length / sentenceCount;
            return rixScore.toFixed(1);
        });

        // Rix Difficulty
        this.calculateAndUpdate('RIXD', () => {
            const longWords = (text.match(/\b\w{6,}\b/g) || []);
            const sentenceCount = this.sentenceCount(text);

            if (sentenceCount === 0) {
                return '';
            }
            const rixScore = longWords.length / sentenceCount;
            if (rixScore < 4 ) {
                return 'Easy';
            } else if (rixScore >= 4 && rixScore < 6) {
                return 'Moderate'
            } else return 'Complex'
        });

        // Lix Readability
        this.calculateAndUpdate('LIX', () => {
            const words = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || []);
            const longWords = words.filter(word => word.length > 6);
            const sentenceCount = this.sentenceCount(text);
            if (sentenceCount === 0 || words.length === 0) {
                return '0';
            }

            const lixScore = (words.length / sentenceCount) + ((longWords.length / words.length) * 100);
            return lixScore.toFixed(1);
        });

        // Lix Difficulty
        this.calculateAndUpdate('LIXD', () => {
            const words = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || []);
            const longWords = words.filter(word => word.length > 6);
            const sentenceCount = this.sentenceCount(text);
            if (sentenceCount === 0 || words.length === 0) {
                return '';
            }
            const lixScore = (words.length / sentenceCount) + ((longWords.length / words.length) * 100);
            if (lixScore < 30 ) {
                return 'Very easy';
            } else if (lixScore < 40) {
                return 'Easy'
            } else if (lixScore < 50) {
                return 'Medium'
            } else if (lixScore < 60) {
                return 'Difficult'
            } else return 'Very difficult'
        });

        // Reading Time
        this.calculateAndUpdate('RdTm', () => AnalysisGenerator.getReadingTimes(text));

        // Speaking Time
        this.calculateAndUpdate('SpkT', () => AnalysisGenerator.getSpeakingTimes(text));

        // Readability rating
        this.calculateAndUpdate('Rdbl', () => {

            const score = parseFloat(textReadability.textMedian(text));

            if (score >= 7 && score <= 8) {
                return 'A';
            } else if ((score >= 6 && score < 7) || (score >= 8.1 && score < 9)) {
                return 'A-';
            } else if ((score >= 5 && score < 6)  || (score >= 9 && score < 10)) {
                return 'B+';
            } else if ((score >= 4 && score < 5) || (score >= 10 && score < 11)) {
                return 'B';
            } else if ((score >= 3 && score < 4) || (score >= 11 && score < 12)) {
                return 'B-';
            } else if ((score >= 2 && score < 3) || (score >= 12 && score < 13)) {
                return 'C+';
            } else if ((score >= 1 && score < 2) || (score >= 13 && score < 14)) {
                return 'C';
            } else if (score === 1 || (score >= 14 && score < 15)) {
                return 'C-';
            } else if (score >= 15) {
                return 'D';
            } else {
                return 'Invalid Score';
            }
        });

    }

    static getDifficultyFromScore(score: number) {
        if (score >= 90 && score <= 100) {
            return "Very Easy";
        } else if (score >= 80 && score < 90) {
            return "Easy";
        } else if (score >= 70 && score < 80) {
            return "Fairly Easy";
        } else if (score >= 60 && score < 70) {
            return "Standard";
        } else if (score >= 50 && score < 60) {
            return "Fairly Difficult";
        } else if (score >= 30 && score < 50) {
            return "Difficult";
        } else {
            return "Very Confusing";
        }
    }

    static getFORCAST(text: string) {
        const words = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || [];
        let oneSyllableWordCount = 0;

        words.forEach(word => {
            if (syllable(word) === 1) {
                oneSyllableWordCount++;
            }
        });
        const wordCount = words.length;
        const scaledOneSyllableCount = (oneSyllableWordCount / words.length) * 150;
        const forcastScore = 20 - (scaledOneSyllableCount / 10);
        return forcastScore;
    }


    static getReadingTimes(text: string) {
        const wordCount = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || []).length;

        const fastTime = AnalysisGenerator.convertToHMS(wordCount / 250);
        const slowTime = AnalysisGenerator.convertToHMS(wordCount / 200);

        return `${fastTime} - ${slowTime}`;
    }

    static getSpeakingTimes(text: string) {
        const wordCount = (text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu) || []).length;

        const fastTime = AnalysisGenerator.convertToHMS(wordCount / 150);
        const slowTime = AnalysisGenerator.convertToHMS(wordCount / 125);

        return `${fastTime} - ${slowTime}`;
    }

    static convertToHMS(minutes: number): string {
        const totalSeconds = Math.round(minutes * 60);

        const hours = Math.floor(totalSeconds / 3600);
        const minutesLeft = Math.floor((totalSeconds - hours * 3600) / 60);
        const seconds = totalSeconds - hours * 3600 - minutesLeft * 60;

        let timeString = '';

        if (hours > 0) {
            timeString += `${hours}:`;
        }

        if (minutesLeft > 0 || hours > 0) {
            timeString += `${hours > 0 ? minutesLeft.toString().padStart(2, '0') : minutesLeft}:`;
        }

        timeString += (minutesLeft > 0 ? seconds.toString().padStart(2, '0') : seconds);

        if (hours === 0 && minutesLeft === 0) {
            timeString += 's';
        }

        return timeString;
    }
}