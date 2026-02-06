import { App, normalizePath, requestUrl } from 'obsidian';

// What Electron Supports
export const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

// Result sum type for validation
export type URLResult =
	| { location: string; error: null }
	| { location: null; error: string };

const OK = (loc: string): URLResult => ({ location: loc, error: null });
const ERR = (message: string): URLResult => ({
	location: null,
	error: message,
});

export const resolveLocal = async (
	app: App,
	path: string,
): Promise<URLResult> => {
	const filePath = normalizePath(path.trim() ?? '');

	// check if file exists
	const exists = await app.vault.adapter.exists(filePath);
	if (!exists) {
		return ERR(`${filePath} not found in vault `);
	}

	// check extension
	const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
	if (!IMAGE_EXT.has(ext)) {
		const supported = Array.from(IMAGE_EXT)
			.map((e) => `.${e}`)
			.join(', ');

		return ERR(
			`Unsupported file type "${ext}"\nSupported types ${supported}`,
		);
	}

	const MIME_TYPES: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
	};
	const MIMEType = MIME_TYPES[ext] ?? 'application/octet-streat';

	// read file as blob
	try {
		const data = await app.vault.adapter.readBinary(filePath);
		const blob = new Blob([data], { type: MIMEType });
		const url = URL.createObjectURL(blob);

		return OK(url);
	} catch (e) {
		return ERR(
			`Failed to read file ${filePath} (${e?.message ?? String(e)})`,
		);
	}
};

// Validate and read remote file
export const resolveRemote = async (link: string): Promise<URLResult> => {
	const url = (link ?? '').trim();
	try {
		new URL(url);
	} catch {
		return ERR(`Invalid URL ${url}`);
	}

	let response;
	try {
		response = await requestUrl({
			url,
			method: 'GET',
			headers: { Range: 'bytes=0-2047' },
		});
	} catch (e) {
		return ERR(`Failed to fetch URL ${url} (${e?.message ?? String(e)})`);
	}

	// get MIME content type
	const headers = response.headers ?? {};
	const contentType = headers?.['content-type'] ?? headers?.['Content-Type'];

	// validate image content-type
	if (!contentType || !contentType.toLowerCase().startsWith('image/')) {
		return ERR(
			`URL is not an Image (Content-Type: ${contentType ?? 'unknown'})`,
		);
	}

	return OK(url);
};
