import "whatwg-fetch";
import { TextEncoder, TextDecoder } from "util";
require("@testing-library/jest-dom");

class IntersectionObserverMock {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

global.IntersectionObserver = IntersectionObserverMock;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;