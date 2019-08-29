import { Card, Color, ColorCard, ColorCardType, SpecialCard } from "./Card";
import { Player } from "./Player";

export class Game {
    public static createCompCardElement() {
        const card = document.createElement("div");
        card.classList.add("card", "comp-card");
        return card;
    }

    public static shuffle<T>(a: T[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    public static createCardElement(card: Card) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        if (card instanceof ColorCard) {
            cardElement.style.color = card.color;
            if (typeof (card.cardType) === "number") {
                cardElement.innerHTML = card.cardType.toString();
            } else {
                if (typeof (card.cardType) === "string") {
                    switch (card.cardType) {
                        case "Plus": {
                            cardElement.innerHTML = "+";
                            break;
                        }
                        case "TwoPlus": {
                            cardElement.innerHTML = "2+";
                            break;
                        }
                        case "Reverse": {
                            cardElement.innerHTML = "⇅";
                            break;
                        }
                        case "Stop": {
                            cardElement.innerHTML = "✋";
                            break;
                        }
                        case "Taki": {
                            cardElement.innerHTML = "TA\nKI";
                            break;
                        }
                        case "Color": {
                            cardElement.innerHTML = "██\n██";
                            break;
                        }
                    }
                }
            }
        } else {
            if (card instanceof SpecialCard) {
                cardElement.classList.add("multicolor-card");
                switch (card.cardType) {
                    case "ChangeColor": {
                        const colors = document.getElementById("colorCard").cloneNode(true) as HTMLParagraphElement;
                        colors.style.display = "";
                        cardElement.appendChild(colors);
                        break;
                    }
                    case "SuperTaki": {
                        const colors = document.getElementById("superTakiCard").cloneNode(true) as HTMLParagraphElement;
                        colors.style.display = "";
                        cardElement.appendChild(colors);
                        break;
                    }
                }
            }
        }
        return cardElement;
    }

    private static createNumberCardArray(color: Color): ColorCard[] {
        return [new ColorCard(1, color)].concat(...[...Array(7).keys()].map((v) => {
            return new ColorCard((v + 3) as ColorCardType, color);
        }));
    }

    private static createColorSpecials(color: Color): ColorCard[] {
        return [
            new ColorCard("Plus", color),
            new ColorCard("TwoPlus", color),
            new ColorCard("Stop", color),
            new ColorCard("Reverse", color),
            new ColorCard("Taki", color),
        ];
    }

    private PlusTwoPool = 0;
    private CurrentPlayerIndex = 0;
    private Clockwise = true;
    private Taki = false;
    private MaybeWinIndex = -1;
    private Pack: Card[];
    private PlayerCount: number = 4;
    private CurCard: ColorCard;
    private LastPlayElement = document.getElementById("history");

    private Players: Player[];
    private CenterPack: HTMLDivElement = document.getElementById("center-pack") as HTMLDivElement;

    constructor(numberOfPlayers: number) {
        this.PlayerCount = numberOfPlayers;
        this.SetPack();

        for (let i = 0; i < 10; i++) {
            this.shufflePack();
        }

        this.setPlayers();

        this.giveCards();

        this.drawHands();

        while (!(this.Pack[0] instanceof ColorCard && typeof ((this.Pack[0] as ColorCard).cardType) === "number")) {
            this.shufflePack();
        }

        this.placeCardInCenter(this.Pack.splice(0, 1)[0] as ColorCard);

        document.getElementById("next-turn-button").onclick = (ev: MouseEvent) => {
            if (this.isCurrentPlayerHuman()) {
                this.skipPlaying();
            }
        };
        this.LastPlayElement.innerHTML = "";
        this.LastPlayElement.hidden = false;
        this.renderStats();
    }

    public playHistory(msg: string) {
        this.LastPlayElement.innerHTML = msg;
        console.log(msg);
    }

    public isCurrentPlayerHuman() {
        return this.CurrentPlayerIndex === 0;
    }

    public placeCardInCenter(card: ColorCard) {
        this.CurCard = card;
        this.renderCardOnPack(this.CurCard);
    }

    public takiOff() {
        this.Taki = false;
    }

    public canPlaceCard(card: Card) {
        if (this.PlusTwoPool > 0) {
            return card instanceof ColorCard && card.cardType === "TwoPlus";
        }
        if (card instanceof SpecialCard) {
            return true;
        }
        if (card instanceof ColorCard) {
            if (this.Taki) {
                return this.CurCard.color === card.color || (this.CurCard.cardType === "Taki" && card.cardType === "Taki");
            }
            return (this.CurCard.color === card.color) || this.CurCard.cardType === card.cardType;
        }

        return false;
    }

    public renderCardOnPack(card: Card) {
        this.CenterPack.innerHTML = "";
        this.CenterPack.appendChild(Game.createCardElement(card));
    }

    public calcCardPlacement() {
        let regular = true;
        let stop = false;
        if (!this.Taki) {
            switch (this.CurCard.cardType) {
                case "Reverse":
                    this.reverse();
                    break;
                case "Stop":
                    stop = true;
                    break;
                case "TwoPlus":
                    this.PlusTwoPool += 2;
                    break;
                case "Taki": {
                    this.Taki = true;
                    break;
                }
                case "Plus": {
                    regular = false;
                }
            }
        }

        if (this.getCurrentPlayer().getHand.length === 0) {
            switch (this.CurCard.cardType) {
                case "TwoPlus": {
                    this.MaybeWinIndex = this.CurrentPlayerIndex;
                    break;
                }
                case "Plus": {
                    break;
                }
                default: {
                    this.win(this.CurrentPlayerIndex);
                }
            }

        }

        if (!this.Taki && regular) {
            this.nextPlayer();
        }

        if (!this.Taki && stop) {
            this.nextPlayer();
        }

        this.renderStats();
        this.botPlayer();
    }

    private win(winnerIndex: number) {
        alert(`Player ${winnerIndex} Won!`);
        location.reload(true);
    }

    private drawHands() {
        for (const player of this.Players) {
            player.drawHand();
        }
    }

    private setPlayers() {
        this.Players = [];
        this.Players.push(new Player(true, document.getElementById("player-0") as HTMLDivElement, this, 0));
        for (let index = 1; index < this.PlayerCount; index++) {
            this.Players.push(new Player(false, document.getElementById(`player-${index}`) as HTMLDivElement, this, index));
        }
    }

    private reverse() {
        this.Clockwise = !this.Clockwise;
    }

    private giveCards() {
        for (const player of this.Players) {
            player.addCardsToHand(this.getTopXCards(8));
        }
    }

    private getTopXCards(x: number) {
        return this.Pack.splice(0, x);
    }

    private shufflePack() {
        this.Pack = Game.shuffle(this.Pack);
    }

    private SetPack() {
        this.Pack = [];
        this.pushNumbers();
        this.pushNumbers();

        this.pushColorSpecials();
        this.pushColorSpecials();

        this.pushNoColorSpecials();
        this.pushNoColorSpecials();
    }

    private pushNoColorSpecials() {
        this.Pack.push(new SpecialCard("ChangeColor"));
        this.Pack.push(new SpecialCard("ChangeColor"));
        this.Pack.push(new SpecialCard("SuperTaki"));
    }

    private nextPlayer() {
        this.CurrentPlayerIndex = (this.CurrentPlayerIndex + (this.Clockwise ? 1 : -1) + this.PlayerCount) % this.PlayerCount;
    }

    private getCurrentPlayer() {
        return this.Players[this.CurrentPlayerIndex];
    }

    private skipPlaying() {
        const curPlayer = this.getCurrentPlayer();
        if (this.PlusTwoPool > 0) {
            curPlayer.addCardsToHand(this.getTopXCards(this.PlusTwoPool));
            this.PlusTwoPool = 0;
        } else {
            if (!this.Taki) {
                curPlayer.addCardsToHand(this.getTopXCards(1));
            }
        }

        curPlayer.drawHand();

        if (this.Taki) {
            this.Taki = false;
            if (this.CurCard.cardType !== "Taki") {
                this.calcCardPlacement();
            } else {
                this.nextPlayer();
            }
        } else {
            this.nextPlayer();
        }

        if (this.MaybeWinIndex !== -1 && this.Players[this.MaybeWinIndex].getHand.length === 0 && this.PlusTwoPool === 0) {
            this.win(this.MaybeWinIndex);
        }

        this.renderStats();

        this.botPlayer();
    }

    private botPlayer() {
        if (!this.isCurrentPlayerHuman()) {
            setTimeout(async () => {
                if (!this.isCurrentPlayerHuman()) {
                    const currentPlayer = this.getCurrentPlayer();
                    for (const card of currentPlayer.getHand) {
                        if (this.canPlaceCard(card)) {
                            await currentPlayer.playCard(card);
                            return;
                        }
                    }

                    this.skipPlaying();
                }
            }, 1000);
        }
    }

    private renderStats() {
        document.getElementById("current-player").innerHTML = `Current Player: ${this.CurrentPlayerIndex}`;
        document.getElementById("plus-two-pool").innerHTML = `2+ Pool: ${this.PlusTwoPool}`;
        document.getElementById("pack-size").innerHTML = `Number of Cards Left: ${this.Pack.length}`;
        document.getElementById("direction").innerHTML = `Direction: ${this.Clockwise ? "Clockwise" : "Counter Clockwise"}`;
        document.getElementById("current-player").innerHTML = `Current Player: ${this.CurrentPlayerIndex}`;

        for (const element of document.getElementsByClassName("player")) {
            element.classList.remove("current");
        }

        this.getCurrentPlayer().getElement.classList.add("current");
    }

    private pushNumbers() {
        this.Pack.push(...Game.createNumberCardArray("Blue"));
        this.Pack.push(...Game.createNumberCardArray("Green"));
        this.Pack.push(...Game.createNumberCardArray("Red"));
        this.Pack.push(...Game.createNumberCardArray("Orange"));
    }

    private pushColorSpecials() {
        this.Pack.push(...Game.createColorSpecials("Blue"));
        this.Pack.push(...Game.createColorSpecials("Green"));
        this.Pack.push(...Game.createColorSpecials("Red"));
        this.Pack.push(...Game.createColorSpecials("Orange"));
    }
}
