import BackgroundPlugin, { DEFAULT_SETTINGS } from './PluginSettings';
import { App, PluginSettingTab, Setting } from 'obsidian';

const blurLevels = {
  off: '0px',
  low: '5px',
  high: '15px',
}

export class UrlSettingsTab extends PluginSettingTab {
  plugin: BackgroundPlugin;

  constructor(app: App, plugin: BackgroundPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    const instructions = containerEl.createEl('div');
    instructions.createEl('p', { text: 'The URL needs to be a remote resource, and does not yet (or at least not on my machine) support local files.' });
    instructions.createEl('p', { text: 'Some of the other settings, like opacity, bluriness, and input contrast, are helpers to tweak your experience.' });
    instructions.createEl('a', { href: 'https://github.com/shmolf/obsidian-editor-background/issues', text: 'Submit an issue' });

    new Setting(containerEl)
      .setName('Background Image URL')
      .setDesc('URL for the background image to load.')
      .addText((text) =>
        text
          .setPlaceholder('https://example.com/image.png')
          .setValue(this.plugin.settings.imageUrl)
          .onChange(async (value) => {
            this.plugin.settings.imageUrl = value;

            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Background Opacity')
      .setDesc('Opacity of the background image should be between 0% and 100%.')
      .addText(
        (text) => text.setPlaceholder(`${(DEFAULT_SETTINGS.opacity || 1) * 100}`)
          .setValue(`${this.floatToPercent(this.plugin.settings.opacity)}`)
          .onChange(async (value) => {
              this.plugin.settings.opacity = this.percentToFloat(Number(value));
              await this.plugin.saveSettings();
              }
          )
      );

    new Setting(containerEl)
      .setName('Image Bluriness')
      .setDesc('Increasing the blur can help make the text more legible.')
      .addDropdown((dropdown) => {
          dropdown
              .addOption(blurLevels.off, 'Off')
              .addOption(blurLevels.low, 'Low')
              .addOption(blurLevels.high, 'High')
              .setValue(this.plugin.settings.bluriness)
              .onChange(async(value) => {
                this.plugin.settings.bluriness = value;
                await this.plugin.saveSettings();
              });
      });

    new Setting(containerEl)
      .setName('Input Area Contrast Background')
      .setDesc('This adds a translucent background for the input area, to help improve legibility.')
      .addToggle((toggle) => {
        toggle.setTooltip('Enable to increase the contrast of the input area.')
              .setValue(this.plugin.settings.inputContrast)
              .onChange(async(value) => {
                this.plugin.settings.inputContrast = value;
                await this.plugin.saveSettings();
              });
      });
  }

  floatToPercent(value: number) {
    return Math.max(0, Math.min(1, value)) * 100;
  }

  percentToFloat(value: number) {
    return Math.max(0, Math.min(100, value)) / 100;
  }
}
