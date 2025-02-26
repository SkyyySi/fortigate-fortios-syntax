import {
	createConnection,
	CompletionItem,
	CompletionItemKind,
	DidChangeConfigurationNotification,
	ProposedFeatures,
	TextDocuments,
	TextDocumentSyncKind,
	type InitializeParams,
	type InitializeResult,
	type TextDocumentsConfiguration,
	type TextDocumentPositionParams,
} from "vscode-languageserver/node";
import {
	TextDocument,
	type TextDocumentContentChangeEvent,
} from "vscode-languageserver-textdocument";

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params) => {
	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	return result;
});

function applyChange(originalText: string, change: TextDocumentContentChangeEvent): string {
	if (!("range" in change)) {
		return change.text;
	}

	const before = originalText.slice(0, change.range.start.character);
	const after  = originalText.slice(change.range.end.character);

	const newText = (
		before +
		change.text +
		after
	);

	return newText;
}

const documents = new TextDocuments({
	create: (uri, languageId, version, content): TextDocument => {
		console.table({ uri, languageId, version, content });

		return TextDocument.create(uri, languageId, version, content);
	},
	update: (document, changes, version) => {
		console.table({ document, changes, version });

		let text = document.getText();

		for (const change of changes) {
			text = applyChange(text, change);
		}

		return TextDocument.update(document, changes, version);
	},
});

documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// Implement your validation logic here
}

connection.onDidChangeConfiguration((change) => {
	documents
		.all()
		.forEach(validateTextDocument);
});

connection.onCompletion(
	(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		return [
			{
				label: "TypeScript",
				kind: CompletionItemKind.Text,
				data: 1,
			},
		];
	}
);

documents.listen(connection);

console.log(`>>> [fortigate-fortios-syntax, "${import.meta.path}"] Hello from the server!`)

connection.listen();
