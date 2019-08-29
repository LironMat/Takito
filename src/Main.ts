import "./style.css";

import { Game } from "./Game";

let num: number;
do {
    num = parseInt(prompt("Enter number of Players", "4") || "", 10);
} while (![2, 3, 4].includes(num));

const game = new Game(num);
