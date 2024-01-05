import { AnalysisGenerator } from 'AnalysisGenerator';
import { App, Plugin, PluginSettingTab, WorkspaceLeaf, ItemView, Setting, MarkdownView } from 'obsidian';

// TextAnalysisView class
class TextAnalysisView extends ItemView {
    analysisGenerator: AnalysisGenerator;
    boundHandleSelectionChange: any;
    boundHandleKeydown: any;
    boundHandleMouseUp: any;
    private updateTimeout?: number;

    constructor(leaf: WorkspaceLeaf, analysisGenerator: AnalysisGenerator) {
        super(leaf);
        this.analysisGenerator = analysisGenerator;
    }

    getIcon() {
        return 'eye';
    }

    getViewType() {
        return 'textAnalysis-view';
    }

    getDisplayText() {
        return 'Text Analysis';
    }

    updateDisplay() {
        const { containerEl } = this;
        containerEl.empty();
        const content = this.analysisGenerator.displayAnalysis();
        containerEl.appendChild(content);
    }

    async onOpen() {
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

    async onClose() {
        // Unregister event listeners
        document.removeEventListener('selectionchange', this.boundHandleSelectionChange);
        document.removeEventListener('keydown', this.boundHandleKeydown);
        document.removeEventListener('mouseup', this.boundHandleMouseUp);

        // Unbind event handlers
        this.boundHandleSelectionChange = null;
        this.boundHandleKeydown = null;
        this.boundHandleMouseUp = null;
    }

    handleSelectionChange() {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
            const editor = activeLeaf.view.editor;
            const selection = editor.getSelection();
            if (selection) {
                if (this.updateTimeout !== undefined) {
                    clearTimeout(this.updateTimeout);
                }

                this.updateTimeout = window.setTimeout(() => {
                    this.analysisGenerator.updateAnalysisValues();
                    this.updateTimeout = undefined;
                }, 500);
            }
        }
    }

    handleKeydown(event: KeyboardEvent) {
        if (this.updateTimeout !== null) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = window.setTimeout(() => {
            this.analysisGenerator.updateAnalysisValues();
            this.updateTimeout = undefined;
        }, 500);
    }

    handleMouseUp() {
        const selection = window.getSelection();
        if (selection && selection.toString() == '') {
            if (this.updateTimeout !== undefined) {
                clearTimeout(this.updateTimeout);
            }

            this.updateTimeout = window.setTimeout(() => {
                this.analysisGenerator.updateAnalysisValues();
                this.updateTimeout = undefined;
            }, 500);
        }
    }

}


class TextAnalysisSettingTab extends PluginSettingTab {
    plugin: TextAnalysisPlugin;
    analysisGenerator: AnalysisGenerator;

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
            this.plugin.analysisGenerator.analysisMetrics.forEach(metric => {
                this.plugin.settings.analysisMetricsSettings[metric.id] = metric.active;
            });
        }

        this.plugin.analysisGenerator.analysisMetrics.forEach(metric => {
            new Setting(containerEl)
                .setName(metric.label)
                // .setDesc('Toggle description here') // You can add a description if needed
                .addToggle(toggle =>
                    toggle
                        .setValue(this.plugin.settings.analysisMetricsSettings[metric.id])
                        .onChange(async (value) => {
                            // Update the settings and the actual active state in the metrics array
                            this.plugin.settings.analysisMetricsSettings[metric.id] = value;

                            const metricToUpdate = this.plugin.analysisGenerator.analysisMetrics.find(m => m.id === metric.id);
                            if (metricToUpdate) {
                                metricToUpdate.active = value;
                                this.analysisGenerator.updateAnalysisValues();
                            }
							const leaf = this.plugin.app.workspace.getLeavesOfType('textAnalysis-view')[0];
                            if (leaf) {
                                const view = leaf.view;
                                if (view instanceof TextAnalysisView) {
                                    view.updateDisplay(); // Correctly call updateDisplay on the instance
                                }
                            }
                            await this.plugin.saveSettings();
                        })
                )
        });
    }
}


// Main plugin class
export default class TextAnalysisPlugin extends Plugin {
    settings: {
        analysisMetricsSettings: { [id: string]: boolean };
    };
    analysisGenerator: AnalysisGenerator;
    textAnalysisView: TextAnalysisView | null = null;
    headerElement: HTMLStyleElement | null = null;
    leafInitialized = false;

    async onload() {
		this.settings = { ...await this.loadData() };
        this.settings.analysisMetricsSettings = this.settings.analysisMetricsSettings || {};

		this.analysisGenerator = new AnalysisGenerator(this);

		this.analysisGenerator.analysisMetrics.forEach(metric => {
			metric.active = this.settings.analysisMetricsSettings[metric.id] ?? true;
		});

        this.addRibbonIcon('eye', 'Text Analysis', async () => {
            await this.activateView();
        });

		this.addSettingTab(new TextAnalysisSettingTab(this.app, this, this.analysisGenerator));

        this.addCommand({
            id: 'open-textAnalysis-panel',
            name: 'Open Text Analysis Panel',
            callback: () => this.activateView(),
        });

        this.registerView('textAnalysis-view', (leaf) => {
            this.textAnalysisView = new TextAnalysisView(leaf, this.analysisGenerator);
            return this.textAnalysisView;
        });
        this.activateView();

        this.headerElement = document.createElement('style');
        this.updateHeaderElementContent('Document')
        document.head.appendChild(this.headerElement);
    }

    updateHeaderElementContent(title: string) {
        const elements = document.querySelectorAll('.mod-right-split > .workspace-tabs:not(.mod-top) .workspace-tab-header-spacer');
        elements.forEach(element => {
            element.setAttribute('data-content', 'Text analysis - ' + title);
        });
    }

    onunload() {
        if (this.headerElement && document.head.contains(this.headerElement)) {
            document.head.removeChild(this.headerElement);
            this.headerElement = null;
        }
    }

    async activateView() {
        let leaf = this.app.workspace.getLeavesOfType('textAnalysis-view')[0];
        if (!leaf) {
            leaf = this.app.workspace.getRightLeaf(true);
            await leaf.setViewState({ type: 'textAnalysis-view', active: true });
            this.app.workspace.revealLeaf(leaf);
            this.leafInitialized = true;
        } else {
            let leafEl = document.querySelector('.mod-right-split > .workspace-tabs:not(.mod-top)');
            if (leafEl) {
                if (leafEl.classList.contains('hidden')) {
                    leafEl.classList.remove('hidden');
                } else {
                    leafEl.classList.add('hidden');
                }
            }
        }
    }

	async saveSettings() {
        await this.saveData(this.settings);
    }
}