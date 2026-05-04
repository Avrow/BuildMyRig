import { proxy, config } from "./proxy";

export { config };

export function middleware(request) {
	return proxy(request);
}
