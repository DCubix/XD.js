namespace WebUtil {
	export function requestAnimationFrame(callback: (ts: any) => void): void {
		if (window.requestAnimationFrame) {
			let vendors = ['ms', 'moz', 'webkit', 'o'];
			for (let v of vendors) {
				window[`${v}RequestAnimationFrame`](callback);
			}
		} else {
			console.error("Your browser doesn't seem to support animation features.");
		}
	}
}