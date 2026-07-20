import BackgroundPlugin, { DEFAULT_SETTINGS } from './Plugin';
import { App, PluginSettingTab, Setting } from 'obsidian';

const blurLevels = {
  off: '0px',
  low: '5px',
  high: '15px',
}

const positionOptions = {
  'center': 'Center',
  'top': 'Top',
  'bottom': 'Bottom',
  'left': 'Left',
  'right': 'Right',
  'top left': 'Top left',
  'top right': 'Top right',
  'bottom left': 'Bottom left',
  'bottom right': 'Bottom right',
}

const sizeOptions = {
  'cover': 'Fill (crop to cover)',
  'contain': 'Fit (show whole image)',
  '100% 100%': 'Stretch',
  'auto': 'Actual size',
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
    instructions.createEl('p', { text: 'The URL needs to be a remote resource. Local files are not yet supported.' });
    instructions.createEl('p', { text: 'The other options, like opacity, blur, and input contrast, are helpers to tweak your experience.' });
    instructions.createEl('a', { href: 'https://github.com/shmolf/obsidian-editor-background/issues', text: 'Submit an issue' });

    new Setting(containerEl)
      .setName('Background image URL')
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
      .setName('Dark theme image URL')
      .setDesc('Optional. When set, this image is used while the dark theme is active, and the URL above is used for the light theme.')
      .addText((text) =>
        text
          .setPlaceholder('https://example.com/dark-image.png')
          .setValue(this.plugin.settings.darkImageUrl)
          .onChange(async (value) => {
            this.plugin.settings.darkImageUrl = value;

            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Background opacity')
      .setDesc('Opacity of the background image, between 0% and 100%.')
      .addSlider((slider) =>
        slider
          .setLimits(0, 100, 1)
          .setValue(this.floatToPercent(this.plugin.settings.opacity ?? DEFAULT_SETTINGS.opacity))
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.opacity = this.percentToFloat(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Image blur')
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
      .setName('Input area contrast background')
      .setDesc('Adds a translucent background behind the input area, to help improve legibility.')
      .addToggle((toggle) => {
        toggle.setTooltip('Enable to increase the contrast of the input area.')
              .setValue(this.plugin.settings.inputContrast)
              .onChange(async(value) => {
                this.plugin.settings.inputContrast = value;
                await this.plugin.saveSettings();
              });
      });

    new Setting(containerEl)
        .setName('Image position')
        .setDesc('Reposition the image in cases where the focus is not centered.')
        .addDropdown((dropdown) => {
            Object.entries(positionOptions).forEach(([key, value]) => dropdown.addOption(key, value));
            dropdown
              .setValue(this.plugin.settings.position)
              .onChange(async(value) => {
                  this.plugin.settings.position = value;
                  await this.plugin.saveSettings();
              });
        });

    new Setting(containerEl)
        .setName('Image scaling')
        .setDesc('How the image is scaled to the available space.')
        .addDropdown((dropdown) => {
            Object.entries(sizeOptions).forEach(([key, value]) => dropdown.addOption(key, value));
            dropdown
              .setValue(this.plugin.settings.size)
              .onChange(async(value) => {
                  this.plugin.settings.size = value;
                  await this.plugin.saveSettings();
              });
        });

    new Setting(containerEl)
      .setName('Apply to entire window')
      .setDesc('Show a single background image behind the whole window, including the sidebars, instead of a separate image in each pane.')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.wholeWindow)
              .onChange(async(value) => {
                this.plugin.settings.wholeWindow = value;
                await this.plugin.saveSettings();
              });
      });

    new Setting(containerEl)
      .setName('Excluded paths')
      .setDesc('Notes matching these vault paths will not show the background image. One folder or note path per line, e.g. "Daily Notes" or "Projects/Todo.md".')
      .addTextArea((text) => {
        text
          .setPlaceholder('Daily Notes\nProjects/Todo.md')
          .setValue(this.plugin.settings.excludedPaths)
          .onChange(async (value) => {
            this.plugin.settings.excludedPaths = value;
            await this.plugin.saveSettings();
          });
      });
  }

  floatToPercent(value: number) {
    return Math.round(Math.max(0, Math.min(1, value)) * 100);
  }

  percentToFloat(value: number) {
    return Math.max(0, Math.min(100, value)) / 100;
  }
}
