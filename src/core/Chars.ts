namespace Chars {
	export function isLetter(c: string): boolean {
		return c.length == 1 && c.match(/[a-z]/i) != null;
	}

	export function isLetterOrDigit(c: string) {
		return isLetter(c) || (c.length == 1 && c.match(/[0-9]/) != null);
	}

	export function isWhitespace(c: string) {
		return c.length == 1 && ["\t", "\n", "\r", " "].indexOf(c) != -1;
	}

	export function isSymbol(c: string) {
		return c.length == 1 && ["(", ")", "{", "}", "=", "-", "+", "*", "/", "#", ">", "<", "^", "%", ".", ";"].indexOf(c) != -1;
	}
}