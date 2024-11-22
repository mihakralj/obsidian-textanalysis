import { AnalysisGenerator, AnalysisMetric } from './AnalysisGenerator';
import { App, Plugin, PluginSettingTab, WorkspaceLeaf, ItemView, Setting, MarkdownView } from 'obsidian';

// TextAnalysisView class
class TextAnalysisView extends ItemView {
    analysisGenerator: AnalysisGenerator;
    boundHandleSelectionChange: () => void;
    boundHandleKeydown: (event: KeyboardEvent) => void;
    boundHandleMouseUp: () => void;
    private updateTimeout?: number;

    constructor(leaf: WorkspaceLeaf, analysisGenerator: AnalysisGenerator) {
        super(leaf);
        this.analysisGenerator = analysisGenerator;
    }

    getIcon(): string {
        return 'eye';
    }

    getViewType(): string {
        return 'textanalysis-view';
    }

    getDisplayText(): string {
        return 'Text Analysis';
    }

    updateDisplay(): void {
        const { containerEl } = this;
        containerEl.empty();
        const content = this.analysisGenerator.displayAnalysis();
        containerEl.appendChild(content);
    }

    async onOpen(): Promise<void> {
        super.onOpen();

        this.updateDisplay();
        this.analysisGenerator.updateAnalysisValues();

        // Bind event handlers
        this.boundHandleSelectionChange = this.handleSelectionChange.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);

        // Register event listeners
        document.addEventListener('selectionchange', this.boundHandleSelectionChange);
        document.addEventListener('keydown', this.boundHandleKeydown);
        document.addEventListener('mouseup', this.boundHandleMouseUp);
    }

    async onClose(): Promise<void> {
        // Unregister event listeners
        document.removeEventListener('selectionchange', this.boundHandleSelectionChange);
        document.removeEventListener('keydown', this.boundHandleKeydown);
        document.removeEventListener('mouseup', this.boundHandleMouseUp);
    }

    handleSelectionChange(): void {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf?.view instanceof MarkdownView) {
            const editor = activeLeaf.view.editor;
            const selection = editor.getSelection();
            if (selection) {
                this.scheduleUpdate();
            }
        }
    }

    handleKeydown(event: KeyboardEvent): void {
        this.scheduleUpdate();
    }

    handleMouseUp(): void {
        const selection = window.getSelection();
        if (selection && selection.toString() === '') {
            this.scheduleUpdate();
        }
    }

    private scheduleUpdate(): void {
        if (this.updateTimeout !== undefined) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = window.setTimeout(() => {
            this.analysisGenerator.updateAnalysisValues();
            this.updateTimeout = undefined;
        }, 500);
    }
}

class TextAnalysisSettingTab extends PluginSettingTab {
    private readonly plugin: TextAnalysisPlugin;
    private readonly analysisGenerator: AnalysisGenerator;

    constructor(app: App, plugin: TextAnalysisPlugin, analysisGenerator: AnalysisGenerator) {
        super(app, plugin);
        this.plugin = plugin;
        this.analysisGenerator = analysisGenerator;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Initialize plugin.settings.analysisMetricsSettings if undefined
        if (!this.plugin.settings.analysisMetricsSettings) {
            this.plugin.settings.analysisMetricsSettings = {};
            // Default each metric's active state to the one defined in the AnalysisGenerator
            this.analysisGenerator.analysisMetrics.forEach(metric => {
                this.plugin.settings.analysisMetricsSettings[metric.id] = metric.active;
            });
        }

        this.analysisGenerator.analysisMetrics.forEach(metric => {
            new Setting(containerEl)
                .setName(metric.label)
                .addToggle(toggle =>
                    toggle
                        .setValue(this.plugin.settings.analysisMetricsSettings[metric.id])
                        .onChange(async (value) => {
                            // Update the settings and the actual active state in the metrics array
                            this.plugin.settings.analysisMetricsSettings[metric.id] = value;

                            const metricToUpdate = this.analysisGenerator.analysisMetrics
                                .find(m => m.id === metric.id);
                            if (metricToUpdate) {
                                metricToUpdate.active = value;
                                this.analysisGenerator.updateAnalysisValues();
                            }

                            const leaf = this.plugin.app.workspace.getLeavesOfType('textanalysis-view')[0];
                            if (leaf?.view instanceof TextAnalysisView) {
                                leaf.view.updateDisplay();
                            }
                            await this.plugin.saveSettings();
                        })
                );
        });
    }
}

interface TextAnalysisSettings {
    analysisMetricsSettings: { [id: string]: boolean };
}

// Main plugin class
export default class TextAnalysisPlugin extends Plugin {
    settings: TextAnalysisSettings;
    analysisGenerator: AnalysisGenerator;
    textAnalysisView: TextAnalysisView | null = null;
    headerElement: HTMLStyleElement | null = null;
    leafInitialized = false;

    async onload(): Promise<void> {
        this.settings = {
            analysisMetricsSettings: {},
            ...await this.loadData()
        };

        this.analysisGenerator = new AnalysisGenerator(this);

        // Initialize metrics from settings
        this.analysisGenerator.analysisMetrics.forEach(metric => {
            metric.active = this.settings.analysisMetricsSettings[metric.id] ?? true;
        });

        this.addRibbonIcon('eye', 'Text Analysis', async () => {
            await this.activateView();
        });

        this.addSettingTab(new TextAnalysisSettingTab(this.app, this, this.analysisGenerator));

        this.addCommand({
            id: 'open-textanalysis-panel',
            name: 'Open Text Analysis Panel',
            callback: () => this.activateView(),
        });

        this.registerView('textanalysis-view', (leaf) => {
            this.textAnalysisView = new TextAnalysisView(leaf, this.analysisGenerator);
            return this.textAnalysisView;
        });

        await this.activateView();

        this.headerElement = document.createElement('style');
        this.updateHeaderElementContent('Document');
        document.head.appendChild(this.headerElement);
    }

    updateHeaderElementContent(title: string): void {
        const elements = document.querySelectorAll('.mod-right-split > .workspace-tabs:not(.mod-top) .workspace-tab-header-spacer');
        elements.forEach(element => {
            element.setAttribute('data-content', 'Text analysis - ' + title);
        });
    }

    onunload(): void {
        if (this.headerElement && document.head.contains(this.headerElement)) {
            document.head.removeChild(this.headerElement);
            this.headerElement = null;
        }
    }

    async activateView(): Promise<void> {
        let leaf = this.app.workspace.getLeavesOfType('textanalysis-view')[0];
        if (!leaf) {
            const rightLeaf = this.app.workspace.getRightLeaf(true);
            if (rightLeaf) {
                await rightLeaf.setViewState({ type: 'textanalysis-view', active: true });
                this.app.workspace.revealLeaf(rightLeaf);
                this.leafInitialized = true;
            }
        } else {
            const leafEl = document.querySelector('.mod-right-split > .workspace-tabs:not(.mod-top)');
            if (leafEl) {
                leafEl.classList.toggle('hidden');
            }
        }
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}
