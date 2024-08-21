import { ValidationSummary } from './../models/game';
import {GameType, IGame} from "../models/game"

const endScoreSum = (scores: number[][], end: number) => {
    let sum = 0;
    const teamCount = scores.length;

    for (let currTeam = 0; currTeam < teamCount; ++currTeam) {
        const score = scores[currTeam][end];
        sum += score;
    }

    return sum;
};

const regularEndValidate = (scores: number[][], end: number) => {
    const teamCount = scores.length;
    let hasScore = false;

    for (let currTeam = 0; currTeam < teamCount && !hasScore; ++currTeam) {
        hasScore ||= scores[currTeam][end] !== 0;
    }
    return hasScore;
};

const cutthroatEndValidate = (scores: number[][], end: number) => {
    return 10 === endScoreSum(scores, end);
};

type EndValidationFunc = (scores: number[][], end: number) => boolean;

export const validateGameState = (game: IGame) => {
    const endCount = game.scores?.[0]?.length ?? 0;
    const validate: EndValidationFunc = game.type == GameType.Cutthroat ? cutthroatEndValidate : regularEndValidate;

    let currEndFound = false;
    const summary: ValidationSummary = { problems: [] };

    for (let i = 1; i < endCount; ++i) {
        const end = endCount - 1 - i;
        const isValid = validate(game.scores, end);

        // console.log(`end ${end}: valid=${isValid}, currEndFound=${currEndFound}`)

        if (isValid && !currEndFound) {
            currEndFound = true;
            const currEnd = Math.min(end + 1, endCount - 1);

            if(currEnd != endCount - 1) {
                summary.problems.push("There are still rounds to play")
            }
        } else if(!isValid && currEndFound) {
            summary.problems.push(`End ${end}: wrong scores`)
        }      
    }

    if(!currEndFound) summary.problems.push("There are still rounds to play");

    summary.problems.reverse();
    return summary;
};