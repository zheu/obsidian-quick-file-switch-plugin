import { Plugin, TFile, Command, Hotkey, Notice } from "obsidian";
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

		// Register new shortcuts based on user input
		this.settings.fileShortcuts.forEach(
			({ filePath, shortcut }, index: number) => {
				if (filePath && shortcut) {
					// Parse shortcut string (e.g., "Alt+Shift+1")
					const parts = shortcut.split("+");
					const key = parts.pop() || ""; // Last part is the key (e.g., '1')
					const modifiers = parts.map((part) => part.trim()); // All parts before the last are modifiers (e.g., ['Alt', 'Shift'])

					const command: Command = {
						id: `open-file-${index}`,
						name: `Open file: ${filePath}`,
						hotkeys: [{ modifiers, key } as Hotkey],
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
