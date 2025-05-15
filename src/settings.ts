import {
	App,
	PluginSettingTab,
	Setting,
	TextComponent,
	Notice,
} from "obsidian";
import QuickFileSwitchPlugin from "./main";
import { FileShortcut } from "./main";

// Settings tab for the plugin
export class QuickFileSwitchSettingTab extends PluginSettingTab {
	plugin: QuickFileSwitchPlugin;
	private unsavedShortcuts: FileShortcut[];

	constructor(app: App, plugin: QuickFileSwitchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.unsavedShortcuts = [...this.plugin.settings.fileShortcuts]; // Track unsaved changes
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Add header
		containerEl.createEl("h2", { text: "Quick File Switch Settings" });

		// Add file shortcut pairs
		this.unsavedShortcuts.forEach(
			(shortcut: FileShortcut, index: number) => {
				new Setting(containerEl)
					.setName(`File Shortcut ${index + 1}`)
					.addText((text: TextComponent) =>
						text
							.setPlaceholder("File path (e.g., Notes/MyFile.md)")
							.setValue(shortcut.filePath)
							.onChange((value: string) => {
								this.unsavedShortcuts[index].filePath = value;
							})
					)
					.addText((text: TextComponent) =>
						text
							.setPlaceholder("Shortcut (e.g., Alt+Shift+1)")
							.setValue(shortcut.shortcut)
							.onChange((value: string) => {
								this.unsavedShortcuts[index].shortcut = value;
							})
					)
					.addButton((button) =>
						button.setButtonText("Remove").onClick(() => {
							this.unsavedShortcuts.splice(index, 1);
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
				.onClick(() => {
					this.unsavedShortcuts.push({ filePath: "", shortcut: "" });
					this.display();
				})
		);

		// Save button
		new Setting(containerEl).addButton((button) =>
			button
				.setButtonText("Save Shortcuts")
				.setCta()
				.onClick(async () => {
					this.plugin.settings.fileShortcuts = [
						...this.unsavedShortcuts,
					];
					await this.plugin.saveSettings();
					new Notice("Shortcuts saved successfully!");
					this.display(); // Refresh to show saved values
				})
		);
	}
}
