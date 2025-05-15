import { App, PluginSettingTab, Setting, TextComponent } from "obsidian";
import QuickFileSwitchPlugin from "./main";
import { FileShortcut } from "./main";

// Settings tab for the plugin
export class QuickFileSwitchSettingTab extends PluginSettingTab {
	plugin: QuickFileSwitchPlugin;

	constructor(app: App, plugin: QuickFileSwitchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Add header
		containerEl.createEl("h2", { text: "Quick File Switch Settings" });

		// Add file shortcut pairs
		this.plugin.settings.fileShortcuts.forEach(
			(shortcut: FileShortcut, index: number) => {
				new Setting(containerEl)
					.setName(`File Shortcut ${index + 1}`)
					.addText((text: TextComponent) =>
						text
							.setPlaceholder("File path (e.g., Notes/MyFile.md)")
							.setValue(shortcut.filePath)
							.onChange(async (value: string) => {
								this.plugin.settings.fileShortcuts[
									index
								].filePath = value;
								await this.plugin.saveSettings();
							})
					)
					.addText((text: TextComponent) =>
						text
							.setPlaceholder("Shortcut (e.g., Alt+1)")
							.setValue(shortcut.shortcut)
							.onChange(async (value: string) => {
								this.plugin.settings.fileShortcuts[
									index
								].shortcut = value;
								await this.plugin.saveSettings();
							})
					)
					.addButton((button) =>
						button.setButtonText("Remove").onClick(async () => {
							this.plugin.settings.fileShortcuts.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						})
					);
			}
		);

		// Button to add new shortcut
		new Setting(containerEl).addButton((button) =>
			button
				.setButtonText("Add File Shortcut")
				.setCta()
				.onClick(async () => {
					this.plugin.settings.fileShortcuts.push({
						filePath: "",
						shortcut: "",
					});
					await this.plugin.saveSettings();
					this.display();
				})
		);
	}
}
