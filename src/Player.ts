import { Card, Color, ColorCard, SpecialCard } from "./Card";
import { Game } from "./Game";

export class Player {

    private static async botSelectColor() {
        return new Promise<Color>((resolve) => {
            setTimeout(() => {
                const colors: Color[] = ["Red", "Blue", "Green", "Orange"];
                resolve(Game.shuffle(colors)[0]);
            }, 1000);
        });
    }

    private static async playerSelectColor(): Promise<Color> {
        return new Promise((resolve) => {
            do {
                const res = prompt("Select one of the four colors:\n0: Red\n1: Green\n2: Blue\n3: Orange") || "";
                switch (parseInt(res.trim(), 10)) {
                    case 0: {
                        resolve("Red");
                        return;
                    }
                    case 1: {
                        resolve("Green");
                        return;

                    }
                    case 2: {
                        resolve("Blue");
                        return;

                    }
                    case 3: {
                        resolve("Orange");
                        return;
                    }
                }
            } while (true);
        });
    }

    private Index: number;
    private Hand: Card[];
    private IsHuman: boolean;
    private HandElement: HTMLDivElement;
    private CurrentGame: Game;

    constructor(isHuman: boolean, element: HTMLDivElement, game: Game, index: number) {
        this.IsHuman = isHuman;
        this.Hand = [];
        this.HandElement = element;
        this.CurrentGame = game;
        this.Index = index;
    }

    public addCardsToHand(cards: Card[]) {
        this.CurrentGame.playHistory(`Player ${this.Index} drawn ${cards.length} cards`);
        this.Hand.push(...cards);
    }

    public get getHand() {
        return this.Hand;
    }

    public get getElement() {
        return this.HandElement;
    }

    public drawHand() {
        this.HandElement.innerHTML = "";
        for (const playerCard of this.Hand) {
            const cardElement = this.IsHuman ? Game.createCardElement(playerCard) : Game.createCompCardElement();
            if (this.IsHuman) {
                cardElement.onclick = async (ev: MouseEvent) => {
                    if (this.CurrentGame.isCurrentPlayerHuman()) {
                        await this.playCard(playerCard);
                    }
                };
            }
            this.HandElement.appendChild(cardElement);
        }
    }

    public async playCard(card: Card) {
        if (this.CurrentGame.canPlaceCard(card)) {
            this.CurrentGame.playHistory(`Player ${this.Index} played ${card.getDesc()}`);
            if (card instanceof SpecialCard) {
                this.CurrentGame.renderCardOnPack(card);
                this.CurrentGame.takiOff();
                const color = await (this.IsHuman ? Player.playerSelectColor() : Player.botSelectColor());
                this.CurrentGame.playHistory(`Player ${this.Index} selected color ${color}`);
                this.removeCardFromHand(card);
                switch (card.cardType) {
                    case "SuperTaki": {
                        card = new ColorCard("Taki", color);
                        break;
                    }
                    case "ChangeColor": {
                        card = new ColorCard("Color", color);
                        break;
                    }
                }
                this.CurrentGame.placeCardInCenter(card as ColorCard);
                this.drawHand();
                this.CurrentGame.calcCardPlacement();
            } else {
                if (card instanceof ColorCard) {
                    this.CurrentGame.placeCardInCenter(card);
                    this.removeCardFromHand(card);
                    this.drawHand();
                    this.CurrentGame.calcCardPlacement();
                }
            }
        }
    }

    private removeCardFromHand(card: Card) {
        const index = this.Hand.indexOf(card);
        if (index !== -1) {
            this.Hand.splice(index, 1);
        }
    }
}
