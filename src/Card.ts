export abstract class Card {
    public abstract getDesc(): string;
}

export type Color = "Red" | "Orange" | "Green" | "Blue";
export type ColorCardType = 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "Plus" | "Stop" | "Reverse" | "Taki" | "TwoPlus" | "Color";
export type SpecialCardType = "ChangeColor" | "SuperTaki";

export class ColorCard extends Card {
    public color: Color;
    public cardType: ColorCardType;
    constructor(t: ColorCardType, c: Color) {
        super();
        this.color = c;
        this.cardType = t;
    }

    public getDesc() {
        return `${this.color} ${this.cardType}`;
    }
}

export class SpecialCard extends Card {
    public cardType: SpecialCardType;
    constructor(t: SpecialCardType) {
        super();
        this.cardType = t;
    }

    public getDesc() {
        return this.cardType;
    }
}
