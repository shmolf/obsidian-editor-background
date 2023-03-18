import { Plugin } from 'obsidian';
import { UrlSettingsTab } from './PluginSettingsTab';

interface PluginSettings {
  imageUrl: string;
  opacity: number;
  bluriness: string;
  inputContrast: boolean;
}

export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
  imageUrl: 'protocol:://domain.tld/path/to/image.png',
  opacity: 0.3,
  bluriness: 'low',
  inputContrast: false,
};

export default class BackgroundPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new UrlSettingsTab(this.app, this));

    this.app.workspace.onLayoutReady(() => this.UpdateBackground());
    this.app.workspace.on('active-leaf-change', () => this.UpdateBackground());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.UpdateBackground();
  }

  UpdateBackground(doc: Document = activeDocument) {
    const containers = doc.querySelectorAll('.cm-editor') as NodeListOf<HTMLElement>;

    containers.forEach((container) => {
      container.style.setProperty('--obsidian-editor-background-image', `url('${this.settings.imageUrl}')`);
      container.style.setProperty('--obsidian-editor-background-opacity', `${this.settings.opacity}`);
      container.style.setProperty('--obsidian-editor-background-bluriness', `blur(${this.settings.bluriness})`);
      container.style.setProperty('--obsidian-editor-background-input-contrast', this.settings.inputContrast ? '#ffffff17' : 'none');
    });
  }
}
