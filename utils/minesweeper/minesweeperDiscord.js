module.exports = {
    parseToMessage(board) {
        const message = [];
        for (const row of board) {
            let rowMessage = '';
            for (const entry of row) {
                if (entry.mine === true) {
                    rowMessage = rowMessage + '||💥||';
                }
                else {
                    // rowMessage = rowMessage + `||${entry.minecount}||`;
                    switch (entry.minecount) {
                        case 0:
                            rowMessage = rowMessage + '||0️⃣||';
                            break;
                        case 1:
                            rowMessage = rowMessage + '||1️⃣||';
                            break;
                        case 2:
                            rowMessage = rowMessage + '||2️⃣||';
                            break;
                        case 3:
                            rowMessage = rowMessage + '||3️⃣||';
                            break;
                        case 4:
                            rowMessage = rowMessage + '||4️⃣||';
                            break;
                        case 5:
                            rowMessage = rowMessage + '||5️⃣||';
                            break;
                        case 6:
                            rowMessage = rowMessage + '||6️⃣||';
                            break;
                        case 7:
                            rowMessage = rowMessage + '||7️⃣||';
                            break;
                        case 8:
                            rowMessage = rowMessage + '||8️⃣||';
                            break;
                    }
                }
            }
            message.push(rowMessage);
        }
        return message;
    },
    parseFromWebToMessage(board, state) {
        const message = [];
        for (const row of board) {
            let rowMessage = '';
            for (const entry of row) {
                if (entry.revealed === false && entry.flagged === false && entry.question === false) {
                    rowMessage = rowMessage + '🟦';
                }
                else if (entry.revealed === false && entry.flagged === true) {
                    rowMessage = rowMessage + '🚩';
                }
                else if (entry.revealed === false && entry.question === true) {
                    rowMessage = rowMessage + '❓';
                }
                else if (entry.mine === true && entry.revealed === true) {
                    if (state === 'complete') {
                        rowMessage = rowMessage + '🚩';
                    }
                    else {
                        rowMessage = rowMessage + '💥';
                    }

                }
                else if (entry.mine === false && entry.revealed === true) {

                    switch (entry.minecount) {
                        case 0:
                            rowMessage = rowMessage + '0️⃣';
                            break;
                        case 1:
                            rowMessage = rowMessage + '1️⃣';
                            break;
                        case 2:
                            rowMessage = rowMessage + '2️⃣';
                            break;
                        case 3:
                            rowMessage = rowMessage + '3️⃣';
                            break;
                        case 4:
                            rowMessage = rowMessage + '4️⃣';
                            break;
                        case 5:
                            rowMessage = rowMessage + '5️⃣';
                            break;
                        case 6:
                            rowMessage = rowMessage + '6️⃣';
                            break;
                        case 7:
                            rowMessage = rowMessage + '7️⃣';
                            break;
                        case 8:
                            rowMessage = rowMessage + '8️⃣';
                            break;
                    }
                }
            }
            message.push(rowMessage);
        }
        return message;
    },
};