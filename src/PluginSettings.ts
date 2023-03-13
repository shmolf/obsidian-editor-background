import { Plugin } from 'obsidian';
import { UrlSettingsTab } from './PluginSettingsTab';

interface PluginSettings {
  imageUrl: string;
  opacity: number;
  bluriness: string;
}

export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
  imageUrl: 'protocol:://domain.tld/path/to/image.png',
  opacity: 0.3,
  bluriness: 'low',
};

export default class BackgroundPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new UrlSettingsTab(this.app, this));

    this.app.workspace.onLayoutReady(() => this.UpdateBackground());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    console.log(this.settings.opacity);
    this.UpdateBackground()
  }

  UpdateBackground(){
    const container = app.workspace.containerEl;

    console.log(this.settings.opacity);
    if (container) {
      container.style.setProperty('--obsidian-editor-background-image', `url('${this.settings.imageUrl}')`);
      container.style.setProperty('--obsidian-editor-background-opacity', `${this.settings.opacity}`);
      container.style.setProperty('--obsidian-editor-background-bluriness', `blur(${this.settings.bluriness})`);
    }
  }
}
