import * as path from "node:path";
import * as vscode from "vscode";
import {
	LanguageClient,
	TransportKind,
	type LanguageClientOptions,
	type ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	const serverModule = context.asAbsolutePath(path.join(
		"server",
		"out",
		"server.js",
	));

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {
				execArgv: [
					"--nolazy",
					"--inspect=6009",
				],
			},
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{
				scheme: "file",
				language: "plaintext",
			},
		],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
		},
	};

	client = new LanguageClient(
		"languageServerExample",
		"Language Server Example",
		serverOptions,
		clientOptions,
	);

	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	return client.stop();
}
