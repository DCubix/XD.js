namespace WebUtil {
	export function requestAnimationFrame(callback: (ts: any) => void): void {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(callback);
		} else {
			console.error("Your browser doesn't seem to support animation features.");
		}
	}
}