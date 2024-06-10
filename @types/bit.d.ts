/** @noResolution */

declare namespace bit {
    export function bxor(x1: number, x2: number): number;
    export function bor(x1: number, x2: number): number;
    export function band(x1: number, x2: number): number;
    export function bnot(x: number): number;
    export function tohex(x: number, n?: number): number;
    export function lshift(x: number, n: number): number;
    export function rshift(x: number, n: number): number;
}

