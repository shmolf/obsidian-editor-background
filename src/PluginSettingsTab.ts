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
    instructions.createEl('p', { text: 'To disable the background, clear the URL for the background.' });

    new Setting(containerEl)
      .setName('Background Image URL')
      .setDesc('URL (local or remote) for the background image.')
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
          .onChange(async (value: any) => {
              console.log({
                raw: value,
                calc: this.percentToFloat(value)
              });
              this.plugin.settings.opacity = this.percentToFloat(value);
              await this.plugin.saveSettings();
              }
          )
      );

    new Setting(containerEl)
      .setName('Image Bluriness')
      .setDesc('Increasing the can make the text more legible.')
      .addDropdown(dropdown => {
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
  }

  floatToPercent(value: number) {
    return Math.max(0, Math.min(1, value)) * 100;
  }

  percentToFloat(value: number) {
    return Math.max(0, Math.min(100, value)) / 100;
  }
}
