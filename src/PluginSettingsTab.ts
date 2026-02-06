import BackgroundPlugin, { DEFAULT_SETTINGS } from './Plugin';
import { App, PluginSettingTab, Setting } from 'obsidian';

const blurLevels = {
	off: '0px',
	low: '5px',
	high: '15px',
};

const positionOptions = {
	center: 'center',
	top: 'top',
	right: 'right',
	bottom: 'bottom',
	left: 'left',
};

export class SettingsTab extends PluginSettingTab {
	plugin: BackgroundPlugin;

	constructor(app: App, plugin: BackgroundPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h1', { text: 'Background Image' }); // Heading

		const instructions = containerEl.createEl('div');
		instructions.createEl('p', {
			text: "Local images must be stored in the Obsidian vault (as otherwise they won't be rendered on mobile).",
		});
		instructions.createEl('p', {
			text: 'The other settings, like opacity, bluriness, and input contrast, are helpers to tweak your experience.',
		});

		const extensions = instructions.createDiv();
		extensions.createEl('strong', { text: 'Supported Image Formats: ' });
		extensions.appendText(
			'PNG, JPG/JPEG, GIF (including animated), WebP, and SVG. ',
		);
		// extensions.style.marginBottom = '10px';

		const reportIssue = instructions.createEl('a', {
			href: 'https://github.com/shmolf/obsidian-editor-background/issues',
			text: 'Submit an issue',
		});
		reportIssue.style.display = 'block';
		reportIssue.style.marginTop = '5px';
		reportIssue.style.marginBottom = '10px'; // add some margin

		// setting for local images
		new Setting(containerEl)
			.setName('Use local image')
			.setDesc('Use a local file path instead of a remote URL.')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.useLocal)
					.onChange(async (value) => {
						this.plugin.settings.useLocal = value;
						await this.plugin.saveSettings();
						this.display();
					});
			});

		// render local path settings OR remote url settings
		if (this.plugin.settings.useLocal) {
			new Setting(containerEl)
				.setName('Path to image')
				.setDesc(
					createFragment((frag) => {
						frag.appendText('Local path to image (');
						frag.createEl('strong', {
							text: 'must be in vault',
						});
						frag.appendText(')');
					}),
				)
				.addText((text) => {
					text.setPlaceholder('path/to/background.png').setValue(
						this.plugin.settings.imageLocation,
					);
					const inputEl = text.inputEl;

					// Only update settings when user clicks off (to avoid cluttering with notices + performance)
					inputEl.addEventListener('blur', async () => {
						const value = text.getValue().trim();
						this.plugin.settings.imageLocation = value;
						await this.plugin.saveSettings();
					});
				});
		} else {
			new Setting(containerEl)
				.setName('Background Image URL')
				.setDesc('URL for the background image to load.')
				.addText((text) => {
					text.setPlaceholder('https://example.com/image.png');
					text.setValue(this.plugin.settings.imageLocation);

					// Only update settings when user clicks off (to avoid cluttering with notices + performance)
					text.inputEl.addEventListener('blur', async () => {
						const value = text.getValue().trim();
						this.plugin.settings.imageLocation = value;
						await this.plugin.saveSettings();
					});
				});
		}

		new Setting(containerEl)
			.setName('Background Opacity')
			.setDesc(
				'Opacity of the background image should be between 0% and 100%.',
			)
			.addText((text) => {
				text.setPlaceholder(
					`${(DEFAULT_SETTINGS.opacity ?? 1) * 100}`,
				).setValue(
					`${this.floatToPercent(this.plugin.settings.opacity)}`,
				);
				text.inputEl.addEventListener('blur', async () => {
					const float = this.percentToFloat(Number(text.getValue()));
					this.plugin.settings.opacity = float;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Image Bluriness')
			.setDesc('Increasing the blur can help make the text more legible.')
			.addDropdown((dropdown) => {
				dropdown
					.addOption(blurLevels.off, 'Off')
					.addOption(blurLevels.low, 'Low')
					.addOption(blurLevels.high, 'High')
					.setValue(this.plugin.settings.bluriness)
					.onChange(async (value) => {
						this.plugin.settings.bluriness = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Input Area Contrast Background')
			.setDesc(
				'This adds a translucent background for the input area, to help improve legibility.',
			)
			.addToggle((toggle) => {
				toggle
					.setTooltip(
						'Enable to increase the contrast of the input area.',
					)
					.setValue(this.plugin.settings.inputContrast)
					.onChange(async (value) => {
						this.plugin.settings.inputContrast = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Image Position')
			.setDesc(
				'Reposition the image in cases where the focus is not centered.',
			)
			.addDropdown((dropdown) => {
				Object.entries(positionOptions).forEach(([key, value]) =>
					dropdown.addOption(key, value),
				);
				dropdown
					.setValue(this.plugin.settings.position)
					.onChange(async (value) => {
						this.plugin.settings.position = value;
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
