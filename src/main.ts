import { Plugin, TFile, Command, Notice } from "obsidian";
import { QuickFileSwitchSettingTab } from "./settings";

// Interface for a single file shortcut
export interface FileShortcut {
	filePath: string;
	shortcut: string;
}

// Interface for plugin settings
interface QuickFileSwitchSettings {
	fileShortcuts: FileShortcut[];
}

// Default settings
const DEFAULT_SETTINGS: QuickFileSwitchSettings = {
	fileShortcuts: [],
};

export default class QuickFileSwitchPlugin extends Plugin {
	settings: QuickFileSwitchSettings;

	async onload(): Promise<void> {
		// Load settings
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new QuickFileSwitchSettingTab(this.app, this));

		// Register shortcuts
		this.registerShortcuts();
	}

	// Load settings from disk
	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	// Save settings to disk and re-register shortcuts
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.registerShortcuts(); // Re-register shortcuts after saving
	}

	// Register shortcuts for each file
	registerShortcuts(): void {
		// Remove existing commands to avoid duplicates
		this.settings.fileShortcuts.forEach((_, index) => {
			this.removeCommand(`open-file-${index}`);
		});

		// Register new shortcuts
		this.settings.fileShortcuts.forEach(
			({ filePath, shortcut }, index: number) => {
				if (filePath && shortcut) {
					const command: Command = {
						id: `open-file-${index}`,
						name: `Open file: ${filePath}`,
						hotkeys: [
							{ modifiers: ["Alt"], key: (index + 1).toString() },
						],
						callback: () => {
							const file =
								this.app.vault.getAbstractFileByPath(filePath);
							if (file && file instanceof TFile) {
								this.app.workspace.getLeaf().openFile(file);
							} else {
								new Notice(
									`File ${filePath} not found`
								);
							}
						},
					};
					this.addCommand(command);
				}
			}
		);
	}
}
