[![Version](https://img.shields.io/github/v/release/mihakralj/obsidian-textanalysis)](https://github.com/mihakralj/obsidian-textanalysis) [![GitHub all releases](https://img.shields.io/github/downloads/mihakralj/obsidian-textanalysis/total?color=blue)](https://github.com/mihakralj/obsidian-textanalysis/releases)
 [![Stars](https://img.shields.io/github/stars/mihakralj/obsidian-textanalysis?style=flat)](https://github.com/mihakralj/obsidian-textanalysis/stargazers)  
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=mihakralj_obsidian-textanalysis&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=mihakralj_obsidian-textanalysis) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=mihakralj_obsidian-textanalysis&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=mihakralj_obsidian-textanalysis) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mihakralj_obsidian-textanalysis&metric=alert_status)](https://sonarcloud.io/summary/overall?id=mihakralj_obsidian-textanalysis)


# Obsidian Text Analytics plugin

Provides real-time text analysis and feedback, focusing on readability, structure, and style. The plugin integrates several well-known readability indicators, ensuring a comprehensive assessment of the text. It is an essential tool for writers, editors, and educators who aim to improve the clarity and engagement of written content.

## Readability Indicators

### Character Count
Metrics the total number of characters in a text. All markdown formatting is removed and all remaining characters (including spaces) are counted. A higher character count generally means longer, more complex writing. Most texts range from a few hundred to a few thousand characters.

### Letter Count
Indicates the number of visible glyphs in a text, excluding spaces and other invisible characters. With more letters (glyphs), texts tend to be longer and more complex. Most texts range from a few hundred to a few thousand letters (glyphs).


### Word Count
Reflects the total number of Unicode words, not excluding apostrophes, hyphens or numbers. Higher word counts signify longer, more advanced writing. An ideal clear text balances depth with brevity using 100-500 words. Most published writing ranges from 300-5,000 words.

### Sentence Count
Shows how many sentences are in the text. Too many sentences overwhelms readers, while too few reduces cohesiveness. Well-written texts average 15-25 sentences of 10-20 words each. Ideal readability would target 3-4 sentences per 100 words.

### Paragraph Count
Indicates text structure organization; frequent paragraphs improve readability through better idea separation. Paragraph counts depend largely on overall text size, but good readability would average 3-5 sentences or 50-100 words per paragraph across at least 4-5 paragraphs.

### Syllable Count
Detects and sums all syllables in text; algorithm is developed for English language and might return incorrect count for other languages. An ideal paragraph in English language is using 150-750 syllables. Most published writing ranges from 450-7,500 syllables.

### Average Words per Sentence
Shows sentence complexity based on sentence length. At least 12-15 words per sentence is best for smooth reading comprehension. Ideal clarity in English averages below 20-25 words per sentence. Signs of difficulty emerge above 30 words per sentence.

### Average Syllables per Word
Indicates word complexity. English text with average of 1.5 syllable words reads most clearly, ideal text should target 85%+ of 1-2 syllable words. Anything above 2.5 syllables per word generally causes increased difficulty and lower readability.

### Average Characters per Word
Hints at reading ease; short words with 3-6 characters maximize clarity. Ideal text would average 4-5 characters/word. Higher averages may suggest verbose, specialized vocabulary that could inhibit comprehension.

### % of Difficult Words
Shows the ammount of words with 3 syllables or more in the text. Lower percentages, maximum 5-10% difficult words, enable easier reading. Avoiding niche, technical vocabulary by substituting simple phrasing usually reduces number of long polysyllabic words.

### Sentence Complexity
Counts the average clauses per sentence to measure syntactic complexity. An optimal complexity range is 1.5-2.0 clauses on average – enough variation without overwhelming readers. Scores over 3.0 mean dense sentences with difficult-to-follow nested clauses. An average complexity near 2.0 clauses per sentence keeps text readily understandable.

### Lexical Diversity (Unique Words)
Measures the variety of vocabulary used in a text. It is calculated as the number of unique words found. Using 200-300 unique words out of a total 300-500 words balances vocabulary depth with approachability based on typical adult English literacy. Ratio of lexical diversity to word count should aim at around 0.4-0.6. Lower results like 0.1-0.3 signify heavy reuse of common words like "the", "it", "and", etc which gets repetitive.

### Flesch Reading Ease
Rates text on a 100-point scale using word length and sentence length factors. Higher scores indicate easier reading. Scores of 60-70 represent plain language easily understandable by 13-15 year olds. Ideal target text would aim for 60-70 reading ease. Lower results mean more difficult, complex passages.

### Flesch Reading Difficulty
Converts reading ease into an equivalent US grade level, with lower results equating to easier comprehension. Ideal text would target a reading difficulty of 7.0-8.0 grade level, or an ease of 60-70. Texts scoring above 10.0 grade level require college-level literacy.

### Flesch-Kincaid Grade Level
Converts word syllables and sentence lengths into an approximate US grade level needed to comprehend the text. Ideal target text should aim for 7.0-8.0 grade level. Easier documents score below 6.0 while more advanced ones range above 10.0 grade level.

### Gunning Fog Index
Generates a US grade level score based on sentence lengths and complex word percentages. Text targeting 7.0-8.0 Fog index would have good readability. Easier documents score below 6.0. Higher than 10.0 indicates college-level difficulty.

### SMOG Index
The Simple Measure of Gobbledygook (SMOG) estimates grade level based solely on polysyllabic word quantities and calibrates particularly well for technical writing. Text with SMOG index of 6.0 to 8.0 is easy to read for the average US adult. An ideal general paper would aim for 9.0-12.0 SMOG index score. Readings above 16.0 mark advanced academic complexity.

### FORCAST Grade Level
Grades text using average sentence length. Its accuracy is more limited but still provides a useful estimate of conceptual density based on phrasing. Ideal sentences for easy comprehension should target grades 8.0-10.0. Higher levels indicate longer, more complex sentences.

### Automated Readability Index
Balances word difficulty (via characters/word) and sentence syntax complexity (words/sentence). Target indices of 7.0-8.0 equate to broadly understandable communication for a general audience. Scores below 5.0 signal basic/simplistic writing while above 10.0 indicates advanced vocabulary and phrasing complexity.

### Coleman-Liau Index
A simplified estimate using characters/word and sentences per 100 words as inputs. Ideal target text would aim for a 7.0-8.0 score. Much under 5.0 suggests simplistic word and sentence construction while over 10.0 means advanced, specialized communication.

### Linsear Write
Measure depends exclusively on sentence length and multi-syllabic vocabulary quantity. Ideal values for general audiences fall in the Grades 7-8 band, marking the transition from basic to advanced literacy. Text above score 10 signifies very elevated complexity and specialized word choice that likely limits broad comprehension.

### New Dale-Chall Score
Emphasizes word difficulty over sentence syntax factors. Scored on the US grade scale, higher equates to harder comprehension through complex vocabulary and phrasing. Scores below grade 6 mark very basic writing using elementary vocabulary. While higher than grade 10 indicates extremely advanced writing

### Powers Sumner Kearl (PSK) Grade Level
Readability metric designed specifically for assessing children's literature, estimating the appropriate U.S. school grade level based on sentence length and word difficulty. It evaluates the number of syllables per word and words per sentence. An ideal PSK score aligns with the target age group, with lower scores indicating simpler language suitable for younger readers.

### Rix Readability Scale
A holistic text readability grading algorithm accounting for varied vocabulary, semantics, sentence structure and coherence, and conceptual density. Text scoring between 7.0-9.0 suits general audiences. Easier documents rate below 7.0 while more difficult ones exceed 9.0, indicating writing best suited for specialized educated readers.

### Rix Difficulty Scale
A companion difficulty measure for the Rix Readability formula, returning 'Easy', 'Moderate' or 'Complex' string basted on difficulty of text.

### Lix Readability Formula
A Swedish readability/complexity algorithm providing grade level estimates for texts based on long words and sentences. Ideal general audience writing should target 8.0-12.0 on the Lix scale. Scores above 25 signify extremely high difficulty and narrow comprehension.

### Lix Difficulty Formula
The difficulty companion to the Lix Readability formula. Returns difficulty rank 'very easy', 'easy', 'medium', 'difficult', 'very difficult'.

### Grade Level (consensus)
An aggregate assessment combining predictions from multiple grade level formulas. The consensus balances weaknesses in individual indicators to estimate overall reading difficulty. Target writing should aim for 7-8th US grade level (score) suiting broadly literate adults.

### Readability Rating
Translates a text's readability score into a letter grade, ranging from 'A' to 'D', to indicate its complexity. Texts scoring between 7 and 8 receive an 'A', denoting high readability, while scores just below or slightly above this range get an 'A-'. The scale progresses downwards and upwards, with 'B+', 'B', 'B-' assigned to progressively less or more challenging texts. Texts with lowest readability, indicated by scores between 2 and 3 or higher than 12, receive grades from 'C+' down to 'D'.

### Reading Time
The estimated time in minutes needed for oral reading of the full text passage based on counts of words, sentences and syllables. Lower times around 1-3 minutes enable easier comprehension across reader attention spans. Longer durations signify lengthy, dense text. Based on reading speed of 200-250 wpm.

### Speaking Time
The estimated time in minutes required to verbally articulate the concepts and contents within the text passage. Lower durations around 1-3 minutes reduce demands on audience focus during oral presentations. Longer times signal extremely elaborated complex and detailed writing. Based on speaking speed of 125-150 wpm.

## Getting Started
- Install the plugin via the Community Plugins tab within Obsidian
- Turn plugin on/off via the ribbon (an eye icon)
- Open a document in Obsidian to analyze
- Select a section of text to analyze selection only
- Access plugin settings via settings page (Community Plugin Settings)

## Contributing
Issues and pull requests are welcome - happy to accept any improvements!

## Support
Reach out on the Obsidian forums or open an issue here if you encounter any problems or have a feature request.