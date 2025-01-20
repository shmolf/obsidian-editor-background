import { Plugin, WorkspaceWindow } from 'obsidian';
import { UrlSettingsTab } from './PluginSettingsTab';

interface PluginSettings {
  imageUrl: string;
  opacity: number;
  bluriness: string;
  inputContrast: boolean;
  position: string;
}

export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
  imageUrl: 'protocol://domain.tld/path/to/image.png',
  opacity: 0.3,
  bluriness: 'low',
  inputContrast: false,
  position: 'center',
};

export default class BackgroundPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new UrlSettingsTab(this.app, this));
    this.app.workspace.onLayoutReady(() => this.UpdateBackground(document));
    this.app.workspace.on('window-open', (win: WorkspaceWindow) => this.UpdateBackground(win.doc));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.UpdateBackground();
  }

  UpdateBackground(doc: Document = activeDocument) {
    doc.body.style.setProperty('--obsidian-editor-background-image', `url('${this.settings.imageUrl}')`);
    doc.body.style.setProperty('--obsidian-editor-background-opacity', `${this.settings.opacity}`);
    doc.body.style.setProperty('--obsidian-editor-background-bluriness', `blur(${this.settings.bluriness})`);
    doc.body.style.setProperty('--obsidian-editor-background-input-contrast', this.settings.inputContrast ? '#ffffff17' : 'none');
    doc.body.style.setProperty('--obsidian-editor-background-line-padding', this.settings.inputContrast ? '1rem' : '0');
    doc.body.style.setProperty('--obsidian-editor-background-position', this.settings.position);
  }
}
