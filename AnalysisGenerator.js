import { __awaiter } from "tslib";
import { MarkdownView } from 'obsidian';
import * as textReadability from 'text-readability';
import { syllable } from 'syllable';
// AnalysisGenerator class
//const syllable = require('syllable');
export class AnalysisGenerator {
    constructor(plugin) {
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
    displayAnalysis() {
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
            }
            else {
                cell.style.borderBottom = '1px solid rgba(0, 0, 0, 0.05)';
            }
        });
        container.appendChild(table);
        const spacer = document.createElement('div');
        spacer.style.height = '30px';
        container.appendChild(spacer);
        return container;
    }
    removeMarkdownFormatting(text) {
        const transform = text
            // Remove headers (lines starting with one or more # characters)
            .replace(/^#+\s+/gm, '')
            // Remove emphasis and bold (text surrounded by *, **, _, or __)
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/([*_])([^*_]*?)\1/g, '$2')
            // Remove links ([text](url))
            .replace(/\[([^[\]]+)\]\(([^()]+)\)/g, '$1')
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
            .replace(/ +/g, ' ');
        return transform;
    }
    sentenceCount(text) {
        const sentences = text.split(/[.!?]/);
        return sentences.length - 1;
    }
    calculateAndUpdate(id, calculation) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Promise.resolve(calculation());
            const valueCell = document.querySelector(`td[data-id="${id}"]`);
            if (valueCell) {
                valueCell.textContent = result;
            }
            const metric = this.analysisMetrics.find(metric => metric.id === id);
            if (metric) {
                metric.value = result;
            }
        });
    }
    updateAnalysisValues() {
        let text;
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            this.plugin.updateHeaderElementContent('Selection');
            text = this.removeMarkdownFormatting(selection.toString());
        }
        else {
            this.plugin.updateHeaderElementContent('Document');
            const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                const editor = activeView.editor;
                text = this.removeMarkdownFormatting(editor.getValue());
            }
            else {
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
            const difficult = textReadability.difficultWords(text, 3);
            const result = difficult / words * 100;
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
            var _a;
            const words = ((_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : []).filter(Boolean);
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
            var _a;
            const longWords = (_a = text.match(/\b\w{6,}\b/g)) !== null && _a !== void 0 ? _a : [];
            const sentenceCount = this.sentenceCount(text);
            if (sentenceCount === 0) {
                return '0';
            }
            const rixScore = longWords.length / sentenceCount;
            return rixScore.toFixed(1);
        });
        // Rix Difficulty
        this.calculateAndUpdate('RIXD', () => {
            var _a;
            const longWords = (_a = text.match(/\b\w{6,}\b/g)) !== null && _a !== void 0 ? _a : [];
            const sentenceCount = this.sentenceCount(text);
            if (sentenceCount === 0) {
                return '';
            }
            const rixScore = longWords.length / sentenceCount;
            if (rixScore < 4) {
                return 'Easy';
            }
            else if (rixScore >= 4 && rixScore < 6) {
                return 'Moderate';
            }
            else
                return 'Complex';
        });
        // Lix Readability
        this.calculateAndUpdate('LIX', () => {
            var _a;
            const words = (_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : [];
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
            var _a;
            const words = (_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : [];
            const longWords = words.filter(word => word.length > 6);
            const sentenceCount = this.sentenceCount(text);
            if (sentenceCount === 0 || words.length === 0) {
                return '';
            }
            const lixScore = (words.length / sentenceCount) + ((longWords.length / words.length) * 100);
            if (lixScore < 30) {
                return 'Very easy';
            }
            else if (lixScore < 40) {
                return 'Easy';
            }
            else if (lixScore < 50) {
                return 'Medium';
            }
            else if (lixScore < 60) {
                return 'Difficult';
            }
            else
                return 'Very difficult';
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
            }
            else if ((score >= 6 && score < 7) || (score >= 8.1 && score < 9)) {
                return 'A-';
            }
            else if ((score >= 5 && score < 6) || (score >= 9 && score < 10)) {
                return 'B+';
            }
            else if ((score >= 4 && score < 5) || (score >= 10 && score < 11)) {
                return 'B';
            }
            else if ((score >= 3 && score < 4) || (score >= 11 && score < 12)) {
                return 'B-';
            }
            else if ((score >= 2 && score < 3) || (score >= 12 && score < 13)) {
                return 'C+';
            }
            else if ((score >= 1 && score < 2) || (score >= 13 && score < 14)) {
                return 'C';
            }
            else if (score === 1 || (score >= 14 && score < 15)) {
                return 'C-';
            }
            else if (score >= 15) {
                return 'D';
            }
            else {
                return 'Invalid Score';
            }
        });
    }
    static getDifficultyFromScore(score) {
        if (score >= 90 && score <= 100) {
            return "Very Easy";
        }
        else if (score >= 80 && score < 90) {
            return "Easy";
        }
        else if (score >= 70 && score < 80) {
            return "Fairly Easy";
        }
        else if (score >= 60 && score < 70) {
            return "Standard";
        }
        else if (score >= 50 && score < 60) {
            return "Fairly Difficult";
        }
        else if (score >= 30 && score < 50) {
            return "Difficult";
        }
        else {
            return "Very Confusing";
        }
    }
    static getFORCAST(text) {
        var _a;
        const words = (_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : [];
        let oneSyllableWordCount = 0;
        words.forEach(word => {
            if (syllable(word) === 1) {
                oneSyllableWordCount++;
            }
        });
        const scaledOneSyllableCount = (oneSyllableWordCount / words.length) * 150;
        const forcastScore = 20 - (scaledOneSyllableCount / 10);
        return forcastScore;
    }
    static getReadingTimes(text) {
        var _a;
        const wordCount = ((_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : []).length;
        const fastTime = AnalysisGenerator.convertToHMS(wordCount / 250);
        const slowTime = AnalysisGenerator.convertToHMS(wordCount / 200);
        return `${fastTime} - ${slowTime}`;
    }
    static getSpeakingTimes(text) {
        var _a;
        const wordCount = ((_a = text.match(/\b\p{L}(['\-\p{L}\p{N}]*\p{L})?\b/gu)) !== null && _a !== void 0 ? _a : []).length;
        const fastTime = AnalysisGenerator.convertToHMS(wordCount / 150);
        const slowTime = AnalysisGenerator.convertToHMS(wordCount / 125);
        return `${fastTime} - ${slowTime}`;
    }
    static convertToHMS(minutes) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHlzaXNHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbmFseXNpc0dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV4QyxPQUFPLEtBQUssZUFBZSxNQUFNLGtCQUFrQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEMsMEJBQTBCO0FBQzFCLHVDQUF1QztBQUV2QyxNQUFNLE9BQU8saUJBQWlCO0lBSTFCLFlBQVksTUFBMEI7UUFDbEMsSUFBSSxDQUFDLGVBQWUsR0FBRztZQUNuQixFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtZQUNsRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7WUFDaEUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzdELEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ2pFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ2xFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ2pFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzdFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzdFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzlFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3ZFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3RFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3BFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzVFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzVFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzdFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVB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QVUsSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQztRQUMxRixDQUFDO1FBRUQsVUFBVSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhGLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbkMsVUFBVSxJQUFJLEdBQUcsQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgVGV4dEFuYWx5c2lzUGx1Z2luIGZyb20gJ21haW4nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0UmVhZGFiaWxpdHkgZnJvbSAndGV4dC1yZWFkYWJpbGl0eSc7XHJcbmltcG9ydCB7IHN5bGxhYmxlIH0gZnJvbSAnc3lsbGFibGUnO1xyXG5cclxuLy8gQW5hbHlzaXNHZW5lcmF0b3IgY2xhc3NcclxuLy9jb25zdCBzeWxsYWJsZSA9IHJlcXVpcmUoJ3N5bGxhYmxlJyk7XHJcblxyXG5leHBvcnQgY2xhc3MgQW5hbHlzaXNHZW5lcmF0b3Ige1xyXG4gICAgc3lsbGFibGU6IGFueTtcclxuICAgIGFuYWx5c2lzTWV0cmljczogQXJyYXk8eyBpZDogc3RyaW5nOyBhY3RpdmU6IGJvb2xlYW47IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmc7IH0+O1xyXG4gICAgcGx1Z2luOiBUZXh0QW5hbHlzaXNQbHVnaW47XHJcbiAgICBjb25zdHJ1Y3RvcihwbHVnaW46IFRleHRBbmFseXNpc1BsdWdpbikge1xyXG4gICAgICAgIHRoaXMuYW5hbHlzaXNNZXRyaWNzID0gW1xyXG4gICAgICAgICAgICB7IGlkOiAnQ2hhcicsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdDaGFyYWN0ZXIgQ291bnQnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdMZXR0cicsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdMZXR0ZXIgQ291bnQnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdXb3JkJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1dvcmQgQ291bnQnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdTZW50JywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1NlbnRlbmNlIENvdW50JywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnUGFyYScsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdQYXJhZ3JhcGggQ291bnQnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdTeWxsJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1N5bGxhYmxlIENvdW50JywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnQVNlbicsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdBdmVyYWdlIFdvcmRzIHBlciBTZW50ZW5jZScsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ0FTeWwnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnQXZlcmFnZSBTeWxsYWJsZXMgcGVyIFdvcmQnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdBQ2hyJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ0F2ZXJhZ2UgQ2hhcmFjdGVycyBwZXIgV29yZCcsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ0RpZmYnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnJSBvZiBEaWZmaWN1bHQgV29yZHMnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdTZW5DJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1NlbnRlbmNlIENvbXBsZXhpdHknLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdMZXhEJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ0xleGljYWwgRGl2ZXJzaXR5JywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnRlJFcycsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdGbGVzY2ggUmVhZGluZyBFYXNlIFNjb3JlJywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnRlJEZicsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdGbGVzY2ggUmVhZGluZyBEaWZmaWN1bHR5JywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnRktHTCcsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdGbGVzY2gtS2luY2FpZCBHcmFkZSBMZXZlbCcsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ0dGb2cnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnR3VubmluZyBGb2cgSW5kZXgnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdTTU9HJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1NNT0cgSW5kZXgnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdGQ1NUJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ0ZPUkNBU1QgR3JhZGUgTGV2ZWwnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdBUkknLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnQXV0b21hdGVkIFJlYWRhYmlsaXR5IEluZGV4JywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnQ0xJJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ0NvbGVtYW4tTGlhdSBJbmRleCcsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ0xXcmknLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnTGluc2VhciBXcml0ZScsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ05EQ2gnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnTmV3IERhbGUtQ2hhbGwgU2NvcmUnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdQU0snLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnUG93ZXJzIFN1bW5lciBLZWFybCBHcmFkZScsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ1JJWCcsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdSaXggUmVhZGFiaWxpdHkgJywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnUklYRCcsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdSaXggRGlmZmljdWx0eSAnLCB2YWx1ZTogJzAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdMSVgnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnTGl4IFJlYWRhYmlsaXR5ICcsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ0xJWEQnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnTGl4IERpZmZpY3VsdHkgJywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnR3JkTScsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdHcmFkZSBsZXZlbCAoY29uc2Vuc3VzKScsIHZhbHVlOiAnMCcgfSxcclxuICAgICAgICAgICAgeyBpZDogJ1JkYmwnLCBhY3RpdmU6IHRydWUsIGxhYmVsOiAnUmVhZGFiaWxpdHkgUmF0aW5nJywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnR3JkTCcsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdSZWFkaW5nIGxldmVsJywgdmFsdWU6ICcwJyB9LFxyXG4gICAgICAgICAgICB7IGlkOiAnUmRUbScsIGFjdGl2ZTogdHJ1ZSwgbGFiZWw6ICdSZWFkaW5nIHRpbWUnLCB2YWx1ZTogJzA6MDAnIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6ICdTcGtUJywgYWN0aXZlOiB0cnVlLCBsYWJlbDogJ1NwZWFraW5nIHRpbWUnLCB2YWx1ZTogJzA6MDAnIH0sXHJcbiAgICAgICAgXTtcclxuXHJcbi8qXHJcblxyXG5DRUZSIExldmVsOiBUaGUgQ29tbW9uIEV1cm9wZWFuIEZyYW1ld29yayBvZiBSZWZlcmVuY2UgZm9yIExhbmd1YWdlcyBsZXZlbCBpbmRpY2F0aW5nIHRoZSBkaWZmaWN1bHR5IG9mIHRoZSB0ZXh0IGZvciBsYW5ndWFnZSBsZWFybmV0ZXh0UmVhZGFiaWxpdHkuXHJcbklFTFRTIExldmVsOiBSZWZsZWN0aW5nIHRoZSBJbnRlcm5hdGlvbmFsIEVuZ2xpc2ggTGFuZ3VhZ2UgVGVzdGluZyBTeXN0ZW0gYmFuZCBsZXZlbC5cclxuU3BhY2hlIFNjb3JlOiBBIHJlYWRhYmlsaXR5IGZvcm11bGEgc3BlY2lmaWNhbGx5IGRlc2lnbmVkIGZvciBwcmltYXJ5LWdyYWRlIHJlYWRpbmcgbWF0ZXJpYWxzLlxyXG4qL1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheUFuYWx5c2lzKCk6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb250YWluZXIuc3R5bGUubWFyZ2luTGVmdCA9ICcwJztcclxuICAgICAgICBjb250YWluZXIuc3R5bGUubWFyZ2luUmlnaHQgPSAnMCc7XHJcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJztcclxuICAgICAgICBjb250YWluZXIuc3R5bGUubWF4SGVpZ2h0ID0gJzgwMHB4JztcclxuXHJcbiAgICAgICAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTGlzdC5hZGQoJ25hdi1mb2xkZXItdGl0bGUnKTtcclxuICAgICAgICB0YWJsZS5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgICAgICB0YWJsZS5zdHlsZS5ib3JkZXJDb2xsYXBzZSA9ICdjb2xsYXBzZSc7XHJcblxyXG4gICAgICAgIGNvbnN0IHRib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGJvZHknKTtcclxuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0Ym9keSk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5hbHlzaXNNZXRyaWNzLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gdGJvZHkuaW5zZXJ0Um93KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsQ2VsbCA9IHJvdy5pbnNlcnRDZWxsKCk7XHJcbiAgICAgICAgICAgIGxhYmVsQ2VsbC50ZXh0Q29udGVudCA9IGl0ZW0ubGFiZWw7XHJcbiAgICAgICAgICAgIGxhYmVsQ2VsbC5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlQ2VsbCA9IHJvdy5pbnNlcnRDZWxsKCk7XHJcbiAgICAgICAgICAgIHZhbHVlQ2VsbC50ZXh0Q29udGVudCA9IGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgIHZhbHVlQ2VsbC5kYXRhc2V0LmlkID0gaXRlbS5pZDtcclxuICAgICAgICAgICAgdmFsdWVDZWxsLnN0eWxlLnRleHRBbGlnbiA9ICdyaWdodCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGJvZHkucXVlcnlTZWxlY3RvckFsbCgndGQnKS5mb3JFYWNoKGNlbGwgPT4ge1xyXG4gICAgICAgICAgICBjZWxsLnN0eWxlLnBhZGRpbmcgPSAnMnB4IDEwcHggMnB4IDBweCc7XHJcbiAgICAgICAgICAgIGNlbGwuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgICAgIGNlbGwuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xyXG4gICAgICAgICAgICBjb25zdCBjb2xvciA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmNvbG9yLm1hdGNoKC9cXGQrL2cpO1xyXG4gICAgICAgICAgICBpZiAoY29sb3IpIHtcclxuICAgICAgICAgICAgICAgIGNlbGwuc3R5bGUuYm9yZGVyQm90dG9tID0gYDFweCBzb2xpZCByZ2JhKCR7Y29sb3JbMF19LCAke2NvbG9yWzFdfSwgJHtjb2xvclsyXX0sIDAuMDUpYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNlbGwuc3R5bGUuYm9yZGVyQm90dG9tID0gJzFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMDUpJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGFibGUpO1xyXG5cclxuICAgICAgICBjb25zdCBzcGFjZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBzcGFjZXIuc3R5bGUuaGVpZ2h0ID0gJzMwcHgnO1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzcGFjZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZU1hcmtkb3duRm9ybWF0dGluZyh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSAgdGV4dFxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgaGVhZGVycyAobGluZXMgc3RhcnRpbmcgd2l0aCBvbmUgb3IgbW9yZSAjIGNoYXJhY3RlcnMpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eIytcXHMrL2dtLCAnJylcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGVtcGhhc2lzIGFuZCBib2xkICh0ZXh0IHN1cnJvdW5kZWQgYnkgKiwgKiosIF8sIG9yIF9fKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvKFxcKlxcKnxfXykoLio/KVxcMS9nLCAnJDInKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvKFsqX10pKFteKl9dKj8pXFwxL2csICckMicpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBsaW5rcyAoW3RleHRdKHVybCkpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFsoW15bXFxdXSspXFxdXFwoKFteKCldKylcXCkvZywgJyQxJylcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGltYWdlcyAoIVthbHQgdGV4dF0odXJsKSlcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICcnKVxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYmxvY2txdW90ZXMgKGxpbmVzIHN0YXJ0aW5nIHdpdGggPilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL14+XFxzKy9nbSwgJycpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9wZXJ0aWVzIHNlY3Rpb24gKGxpbmVzIGJldHdlZW4gLS0tIGFuZCAtLS0pXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eLS0tW1xcclxcbl1bXFxzXFxTXSo/LS0tW1xcclxcbl0vZ20sICcnKVxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIHNpbmdsZSBsaW5lIGJyZWFrcyB3aXRoIGEgc3BhY2UsIHByZXNlcnZlIGRvdWJsZSBsaW5lIGJyZWFrc1xyXG4gICAgICAgICAgICAucmVwbGFjZSgvKD88IVxccj9cXG4pXFxyP1xcbig/IVxccj9cXG4pL2csICcgJylcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGhvcml6b250YWwgcnVsZXMgKGxpbmVzIG9mIC0tLSwgKioqLCBvciBfX18pXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eWy0qX117Myx9XFxzKiQvZ20sICcnKVxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgaW5saW5lIGNvZGUgKHRleHQgc3Vycm91bmRlZCBieSBgKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvYChbXmBdKilgL2csICckMScpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBjb2RlIGJsb2NrcyAodGV4dCBiZXR3ZWVuIGBgYCBhbmQgYGBgKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvYGBgKFtcXHNcXFNdKj8pYGBgL2csICckMScpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB1bm9yZGVyZWQgbGlzdCBtYXJraW5ncyAobGluZXMgc3RhcnRpbmcgd2l0aCAqLCAtLCBvciArKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxccypbKlxcLStdXFxzKy9nbSwgJycpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBvcmRlcmVkIGxpc3QgbWFya2luZ3MgKGxpbmVzIHN0YXJ0aW5nIHdpdGggYSBudW1iZXIgZm9sbG93ZWQgYnkgLilcclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHMqXFxkK1xcLlxccysvZ20sICcnKVxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgcmVmZXJlbmNlLXN0eWxlIGxpbmtzIChbaWRdOiB1cmwgXCJvcHRpb25hbCB0aXRsZVwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxccypcXFsoW15dXSspXFxdOlxccyooLispJC9nbSwgJycpXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBzdHJpa2V0aHJvdWdoICh0ZXh0IHN1cnJvdW5kZWQgYnkgfn4pXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9+figuKj8pfn4vZywgJyQxJylcclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGZvb3Rub3Rlc1xyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxcW1xcXihbXlxcXV0rKVxcXTpcXHMqKC4rKSQvZ20sICcnKVxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGFibGUgc3RydWN0dXJlIGJ1dCBrZWVwIGNvbnRlbnRcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcfFxccyooLio/KVxccypcXHwvZywgJyAkMSAnKVxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgaG9yaXpvbnRhbCBsaW5lcyBpbiB0YWJsZXNcclxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHw/Wy06XStcXHxbLTp8IF0rXFxzKiQvZ20sICcnKVxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIG11bHRpcGxlIHNwYWNlcyB3aXRoIGEgc2luZ2xlIHNwYWNlXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8gKy9nLCAnICcpXHJcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybTtcclxuICAgIH1cclxuXHJcbiAgICBzZW50ZW5jZUNvdW50KHRleHQ6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3Qgc2VudGVuY2VzID0gdGV4dC5zcGxpdCgvWy4hP10vKTtcclxuICAgICAgICByZXR1cm4gc2VudGVuY2VzLmxlbmd0aC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNhbGN1bGF0ZUFuZFVwZGF0ZShpZDogc3RyaW5nLCBjYWxjdWxhdGlvbjogKCkgPT4gc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKGNhbGN1bGF0aW9uKCkpO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlQ2VsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHRkW2RhdGEtaWQ9XCIke2lkfVwiXWApO1xyXG4gICAgICAgIGlmICh2YWx1ZUNlbGwpIHtcclxuICAgICAgICAgICAgdmFsdWVDZWxsLnRleHRDb250ZW50ID0gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtZXRyaWMgPSB0aGlzLmFuYWx5c2lzTWV0cmljcy5maW5kKG1ldHJpYyA9PiBtZXRyaWMuaWQgPT09IGlkKTtcclxuICAgICAgICBpZiAobWV0cmljKSB7XHJcbiAgICAgICAgICAgIG1ldHJpYy52YWx1ZSA9IHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQW5hbHlzaXNWYWx1ZXMoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHRleHQ6IHN0cmluZztcclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgIGlmIChzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi51cGRhdGVIZWFkZXJFbGVtZW50Q29udGVudCgnU2VsZWN0aW9uJyk7XHJcbiAgICAgICAgICAgIHRleHQgPSB0aGlzLnJlbW92ZU1hcmtkb3duRm9ybWF0dGluZyhzZWxlY3Rpb24udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4udXBkYXRlSGVhZGVyRWxlbWVudENvbnRlbnQoJ0RvY3VtZW50Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLnBsdWdpbi5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgICAgICAgICAgaWYgKGFjdGl2ZVZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGFjdGl2ZVZpZXcuZWRpdG9yO1xyXG4gICAgICAgICAgICAgICAgdGV4dCA9IHRoaXMucmVtb3ZlTWFya2Rvd25Gb3JtYXR0aW5nKGVkaXRvci5nZXRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2hhcmFjdGVyIGNvdW50XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0NoYXInLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuY2hhckNvdW50KHRleHQsIGZhbHNlKS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gR2x5cGhzIGNvdW50IChubyBzcGFjZXMpXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0xldHRyJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5LmxldHRlckNvdW50KHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBVbmljb2RlIHdvcmRzIGNvdW50IGluY2x1ZGluZyBhcG9zdHJvcGhlcywgaHlwaGVucywgbnVtYmVyc1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdXb3JkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCgvXFxiXFxwe0x9KFsnXFwtXFxwe0x9XFxwe059XSpcXHB7TH0pP1xcYi9ndSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlcy5sZW5ndGgudG9TdHJpbmcoKSA6ICcwJztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2VudGVuY2UgY291bnRcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnU2VudCcsICgpID0+IHRoaXMuc2VudGVuY2VDb3VudCh0ZXh0KS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gUGFyYWdyYXBoIGNvdW50XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ1BhcmEnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKC9bXlxcbl0rXFxzKi9nKTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzLmxlbmd0aC50b1N0cmluZygpIDogJzAnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTeWxsYWJsZSBjb3VudFxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdTeWxsJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5LnN5bGxhYmxlQ291bnQodGV4dCkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIEF2ZXJhZ2UgU2VudGVuY2UgTGVuZ3RoXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0FTZW4nLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuYXZlcmFnZVNlbnRlbmNlTGVuZ3RoKHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBBdmVyYWdlIFN5bGxhYmxlcyBwZXIgd29yZFxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdBU3lsJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5LmF2ZXJhZ2VTeWxsYWJsZVBlcldvcmQodGV4dCkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIEF2ZXJhZ2UgQ2hhciBwZXIgd29yZFxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdBQ2hyJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5LmF2ZXJhZ2VDaGFyYWN0ZXJQZXJXb3JkKHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnRGlmZicsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2goL1xcYlxccHtMfShbJ1xcLVxccHtMfVxccHtOfV0qXFxwe0x9KT9cXGIvZ3UpO1xyXG4gICAgICAgICAgICBjb25zdCB3b3JkcyA9IG1hdGNoZXMgPyBtYXRjaGVzLmxlbmd0aCA6IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpZmZpY3VsdCA9IHRleHRSZWFkYWJpbGl0eS5kaWZmaWN1bHRXb3Jkcyh0ZXh0LDMpXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRpZmZpY3VsdC93b3JkcyoxMDA7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgPT09IDAgPyAnMCUnIDogcGFyc2VGbG9hdChyZXN1bHQudG9GaXhlZCgyKSkgKyBcIiVcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ1NlbkMnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbnRlbmNlcyA9IHRleHQuc3BsaXQoL1suIT9dKy8pLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICAgICAgY29uc3QgdG90YWxDbGF1c2VzID0gc2VudGVuY2VzLnJlZHVjZSgodG90YWwsIHNlbnRlbmNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGF1c2VNYXJrZXJzID0gLyx8O3xhbmR8b3J8YnV0fGFsdGhvdWdofGJlY2F1c2UvZztcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b3RhbCArIHNlbnRlbmNlLnNwbGl0KGNsYXVzZU1hcmtlcnMpLmxlbmd0aDtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoc2VudGVuY2VzLmxlbmd0aCA+IDAgPyB0b3RhbENsYXVzZXMgLyBzZW50ZW5jZXMubGVuZ3RoIDogMCkudG9GaXhlZCgxKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIExleGljYWwgRGl2ZXJzaXR5XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0xleEQnLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkubGV4aWNvbkNvdW50KHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBHcmFkZSBMZXZlbCAoY29uc2Vuc3VzKVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdHcmRMJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5LnRleHRTdGFuZGFyZCh0ZXh0KS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gR3JhZGUgTWVkaWFuIChjb25zZW5zdXMpXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0dyZE0nLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkudGV4dE1lZGlhbih0ZXh0KS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gRmxlc2NoLUtpbmNhaWQgUmVhZGluZyBFYXNlXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0ZSRXMnLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuZmxlc2NoUmVhZGluZ0Vhc2UodGV4dCkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIEZsZXNjaCBSZWFkaW5nIERpZmZpY3VsdHlcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnRlJEZicsICgpID0+IEFuYWx5c2lzR2VuZXJhdG9yLmdldERpZmZpY3VsdHlGcm9tU2NvcmUodGV4dFJlYWRhYmlsaXR5LmZsZXNjaFJlYWRpbmdFYXNlKHRleHQpKSk7XHJcblxyXG4gICAgICAgIC8vIEZsZXNjaC1LaW5jYWlkIEdyYWRlIExldmVsXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0ZLR0wnLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuZmxlc2NoS2luY2FpZEdyYWRlKHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBHdW5uaW5nIEZvZyBJbmRleFxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdHRm9nJywgKCkgPT4gdGV4dFJlYWRhYmlsaXR5Lmd1bm5pbmdGb2codGV4dCkudG9GaXhlZCgxKSk7XHJcblxyXG4gICAgICAgIC8vIFNNT0cgSW5kZXhcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnU01PRycsICgpID0+IHRleHRSZWFkYWJpbGl0eS5zbW9nSW5kZXgodGV4dCkudG9GaXhlZCgxKSk7XHJcblxyXG4gICAgICAgIC8vIEZPUkNBU1QgSW5kZXhcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnRkNTVCcsICgpID0+IEFuYWx5c2lzR2VuZXJhdG9yLmdldEZPUkNBU1QodGV4dCkudG9GaXhlZCgxKSk7XHJcblxyXG4gICAgICAgIC8vIEF1dG9tYXRlZCBSZWFkYWJpbGl0eSBJbmRleFxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdBUkknLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuYXV0b21hdGVkUmVhZGFiaWxpdHlJbmRleCh0ZXh0KS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gQ29sZW1hbi1MaWF1IEluZGV4XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0NMSScsICgpID0+IHRleHRSZWFkYWJpbGl0eS5jb2xlbWFuTGlhdUluZGV4KHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBMaW5zZWFyIFdyaXRlIEZvcm11bGFcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnTFdyaScsICgpID0+IHRleHRSZWFkYWJpbGl0eS5saW5zZWFyV3JpdGVGb3JtdWxhKHRleHQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBEYWxlLUNoYWxsIFJlYWRhYmlsaXR5IFNjb3JlXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ05EQ2gnLCAoKSA9PiB0ZXh0UmVhZGFiaWxpdHkuZGFsZUNoYWxsUmVhZGFiaWxpdHlTY29yZSh0ZXh0KS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gUFNLXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ1BTSycsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgd29yZHMgPSAodGV4dC5tYXRjaCgvXFxiXFxwe0x9KFsnXFwtXFxwe0x9XFxwe059XSpcXHB7TH0pP1xcYi9ndSkgPz8gW10pLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VudGVuY2VDb3VudCA9IHRoaXMuc2VudGVuY2VDb3VudCh0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZW50ZW5jZUNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJzAnOyAvLyBvciBoYW5kbGUgZW1wdHkgdGV4dCBjYXNlIGFzIHBlciB5b3VyIHJlcXVpcmVtZW50XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGF2ZXJhZ2VTZW50ZW5jZUxlbmd0aCA9IHdvcmRzLmxlbmd0aCAvIHNlbnRlbmNlQ291bnQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGF2ZXJhZ2VXb3JkTGVuZ3RoID0gd29yZHMucmVkdWNlKChhY2MsIHdvcmQpID0+IGFjYyArIHN5bGxhYmxlKHdvcmQpLCAwKSAvIHdvcmRzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoKDAuMDc3OCAqIGF2ZXJhZ2VTZW50ZW5jZUxlbmd0aCkgKyAoMC4wNDU1ICogYXZlcmFnZVdvcmRMZW5ndGgpICsgMi43OTcpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJpeCBSZWFkYWJpbGl0eVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdSSVgnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvbmdXb3JkcyA9IHRleHQubWF0Y2goL1xcYlxcd3s2LH1cXGIvZykgPz8gW107XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbnRlbmNlQ291bnQgPSB0aGlzLnNlbnRlbmNlQ291bnQodGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VudGVuY2VDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcwJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByaXhTY29yZSA9IGxvbmdXb3Jkcy5sZW5ndGggLyBzZW50ZW5jZUNvdW50O1xyXG4gICAgICAgICAgICByZXR1cm4gcml4U2NvcmUudG9GaXhlZCgxKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUml4IERpZmZpY3VsdHlcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUFuZFVwZGF0ZSgnUklYRCcsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbG9uZ1dvcmRzID0gdGV4dC5tYXRjaCgvXFxiXFx3ezYsfVxcYi9nKSA/PyBbXTtcclxuICAgICAgICAgICAgY29uc3Qgc2VudGVuY2VDb3VudCA9IHRoaXMuc2VudGVuY2VDb3VudCh0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZW50ZW5jZUNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgcml4U2NvcmUgPSBsb25nV29yZHMubGVuZ3RoIC8gc2VudGVuY2VDb3VudDtcclxuICAgICAgICAgICAgaWYgKHJpeFNjb3JlIDwgNCApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRWFzeSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocml4U2NvcmUgPj0gNCAmJiByaXhTY29yZSA8IDYpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnTW9kZXJhdGUnXHJcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gJ0NvbXBsZXgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIExpeCBSZWFkYWJpbGl0eVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdMSVgnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdvcmRzID0gdGV4dC5tYXRjaCgvXFxiXFxwe0x9KFsnXFwtXFxwe0x9XFxwe059XSpcXHB7TH0pP1xcYi9ndSkgPz8gW107XHJcbiAgICAgICAgICAgIGNvbnN0IGxvbmdXb3JkcyA9IHdvcmRzLmZpbHRlcih3b3JkID0+IHdvcmQubGVuZ3RoID4gNik7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbnRlbmNlQ291bnQgPSB0aGlzLnNlbnRlbmNlQ291bnQodGV4dCk7XHJcbiAgICAgICAgICAgIGlmIChzZW50ZW5jZUNvdW50ID09PSAwIHx8IHdvcmRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbGl4U2NvcmUgPSAod29yZHMubGVuZ3RoIC8gc2VudGVuY2VDb3VudCkgKyAoKGxvbmdXb3Jkcy5sZW5ndGggLyB3b3Jkcy5sZW5ndGgpICogMTAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIGxpeFNjb3JlLnRvRml4ZWQoMSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIExpeCBEaWZmaWN1bHR5XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVBbmRVcGRhdGUoJ0xJWEQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdvcmRzID0gdGV4dC5tYXRjaCgvXFxiXFxwe0x9KFsnXFwtXFxwe0x9XFxwe059XSpcXHB7TH0pP1xcYi9ndSkgPz8gW107XHJcbiAgICAgICAgICAgIGNvbnN0IGxvbmdXb3JkcyA9IHdvcmRzLmZpbHRlcih3b3JkID0+IHdvcmQubGVuZ3RoID4gNik7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbnRlbmNlQ291bnQgPSB0aGlzLnNlbnRlbmNlQ291bnQodGV4dCk7XHJcbiAgICAgICAgICAgIGlmIChzZW50ZW5jZUNvdW50ID09PSAwIHx8IHdvcmRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGxpeFNjb3JlID0gKHdvcmRzLmxlbmd0aCAvIHNlbnRlbmNlQ291bnQpICsgKChsb25nV29yZHMubGVuZ3RoIC8gd29yZHMubGVuZ3RoKSAqIDEwMCk7XHJcbiAgICAgICAgICAgIGlmIChsaXhTY29yZSA8IDMwICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdWZXJ5IGVhc3knO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpeFNjb3JlIDwgNDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRWFzeSdcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXhTY29yZSA8IDUwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ01lZGl1bSdcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXhTY29yZSA8IDYwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0RpZmZpY3VsdCdcclxuICAgICAgICAgICAgfSBlbHNlIHJldHVybiAnVmVyeSBkaWZmaWN1bHQnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlYWRpbmcgVGltZVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdSZFRtJywgKCkgPT4gQW5hbHlzaXNHZW5lcmF0b3IuZ2V0UmVhZGluZ1RpbWVzKHRleHQpKTtcclxuXHJcbiAgICAgICAgLy8gU3BlYWtpbmcgVGltZVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdTcGtUJywgKCkgPT4gQW5hbHlzaXNHZW5lcmF0b3IuZ2V0U3BlYWtpbmdUaW1lcyh0ZXh0KSk7XHJcblxyXG4gICAgICAgIC8vIFJlYWRhYmlsaXR5IHJhdGluZ1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQW5kVXBkYXRlKCdSZGJsJywgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBwYXJzZUZsb2F0KHRleHRSZWFkYWJpbGl0eS50ZXh0TWVkaWFuKHRleHQpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSA3ICYmIHNjb3JlIDw9IDgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnQSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNjb3JlID49IDYgJiYgc2NvcmUgPCA3KSB8fCAoc2NvcmUgPj0gOC4xICYmIHNjb3JlIDwgOSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnQS0nO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChzY29yZSA+PSA1ICYmIHNjb3JlIDwgNikgIHx8IChzY29yZSA+PSA5ICYmIHNjb3JlIDwgMTApKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0IrJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgoc2NvcmUgPj0gNCAmJiBzY29yZSA8IDUpIHx8IChzY29yZSA+PSAxMCAmJiBzY29yZSA8IDExKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdCJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgoc2NvcmUgPj0gMyAmJiBzY29yZSA8IDQpIHx8IChzY29yZSA+PSAxMSAmJiBzY29yZSA8IDEyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdCLSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHNjb3JlID49IDIgJiYgc2NvcmUgPCAzKSB8fCAoc2NvcmUgPj0gMTIgJiYgc2NvcmUgPCAxMykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnQysnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChzY29yZSA+PSAxICYmIHNjb3JlIDwgMikgfHwgKHNjb3JlID49IDEzICYmIHNjb3JlIDwgMTQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0MnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3JlID09PSAxIHx8IChzY29yZSA+PSAxNCAmJiBzY29yZSA8IDE1KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdDLSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcmUgPj0gMTUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnRCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0ludmFsaWQgU2NvcmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXREaWZmaWN1bHR5RnJvbVNjb3JlKHNjb3JlOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc2NvcmUgPj0gOTAgJiYgc2NvcmUgPD0gMTAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlZlcnkgRWFzeVwiO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcmUgPj0gODAgJiYgc2NvcmUgPCA5MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJFYXN5XCI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzY29yZSA+PSA3MCAmJiBzY29yZSA8IDgwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIkZhaXJseSBFYXN5XCI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzY29yZSA+PSA2MCAmJiBzY29yZSA8IDcwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlN0YW5kYXJkXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzY29yZSA+PSA1MCAmJiBzY29yZSA8IDYwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIkZhaXJseSBEaWZmaWN1bHRcIjtcclxuICAgICAgICB9IGVsc2UgaWYgKHNjb3JlID49IDMwICYmIHNjb3JlIDwgNTApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiRGlmZmljdWx0XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiVmVyeSBDb25mdXNpbmdcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEZPUkNBU1QodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgd29yZHMgPSB0ZXh0Lm1hdGNoKC9cXGJcXHB7TH0oWydcXC1cXHB7TH1cXHB7Tn1dKlxccHtMfSk/XFxiL2d1KSA/PyBbXTtcclxuICAgICAgICBsZXQgb25lU3lsbGFibGVXb3JkQ291bnQgPSAwO1xyXG5cclxuICAgICAgICB3b3Jkcy5mb3JFYWNoKHdvcmQgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3lsbGFibGUod29yZCkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIG9uZVN5bGxhYmxlV29yZENvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzY2FsZWRPbmVTeWxsYWJsZUNvdW50ID0gKG9uZVN5bGxhYmxlV29yZENvdW50IC8gd29yZHMubGVuZ3RoKSAqIDE1MDtcclxuICAgICAgICBjb25zdCBmb3JjYXN0U2NvcmUgPSAyMCAtIChzY2FsZWRPbmVTeWxsYWJsZUNvdW50IC8gMTApO1xyXG4gICAgICAgIHJldHVybiBmb3JjYXN0U2NvcmU7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBnZXRSZWFkaW5nVGltZXModGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gKHRleHQubWF0Y2goL1xcYlxccHtMfShbJ1xcLVxccHtMfVxccHtOfV0qXFxwe0x9KT9cXGIvZ3UpID8/IFtdKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGNvbnN0IGZhc3RUaW1lID0gQW5hbHlzaXNHZW5lcmF0b3IuY29udmVydFRvSE1TKHdvcmRDb3VudCAvIDI1MCk7XHJcbiAgICAgICAgY29uc3Qgc2xvd1RpbWUgPSBBbmFseXNpc0dlbmVyYXRvci5jb252ZXJ0VG9ITVMod29yZENvdW50IC8gMjAwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke2Zhc3RUaW1lfSAtICR7c2xvd1RpbWV9YDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0U3BlYWtpbmdUaW1lcyh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCB3b3JkQ291bnQgPSAodGV4dC5tYXRjaCgvXFxiXFxwe0x9KFsnXFwtXFxwe0x9XFxwe059XSpcXHB7TH0pP1xcYi9ndSkgPz8gW10pLmxlbmd0aDtcclxuXHJcbiAgICAgICAgY29uc3QgZmFzdFRpbWUgPSBBbmFseXNpc0dlbmVyYXRvci5jb252ZXJ0VG9ITVMod29yZENvdW50IC8gMTUwKTtcclxuICAgICAgICBjb25zdCBzbG93VGltZSA9IEFuYWx5c2lzR2VuZXJhdG9yLmNvbnZlcnRUb0hNUyh3b3JkQ291bnQgLyAxMjUpO1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7ZmFzdFRpbWV9IC0gJHtzbG93VGltZX1gO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjb252ZXJ0VG9ITVMobWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCB0b3RhbFNlY29uZHMgPSBNYXRoLnJvdW5kKG1pbnV0ZXMgKiA2MCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgLyAzNjAwKTtcclxuICAgICAgICBjb25zdCBtaW51dGVzTGVmdCA9IE1hdGguZmxvb3IoKHRvdGFsU2Vjb25kcyAtIGhvdXJzICogMzYwMCkgLyA2MCk7XHJcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IHRvdGFsU2Vjb25kcyAtIGhvdXJzICogMzYwMCAtIG1pbnV0ZXNMZWZ0ICogNjA7XHJcblxyXG4gICAgICAgIGxldCB0aW1lU3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgIGlmIChob3VycyA+IDApIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyArPSBgJHtob3Vyc306YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtaW51dGVzTGVmdCA+IDAgfHwgaG91cnMgPiAwKSB7XHJcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgKz0gYCR7aG91cnMgPiAwID8gbWludXRlc0xlZnQudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpIDogbWludXRlc0xlZnR9OmA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aW1lU3RyaW5nICs9IChtaW51dGVzTGVmdCA+IDAgPyBzZWNvbmRzLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKSA6IHNlY29uZHMpO1xyXG5cclxuICAgICAgICBpZiAoaG91cnMgPT09IDAgJiYgbWludXRlc0xlZnQgPT09IDApIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyArPSAncyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGltZVN0cmluZztcclxuICAgIH1cclxufSJdfQ==