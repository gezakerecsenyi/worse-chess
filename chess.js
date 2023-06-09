const container = document.getElementById('container');

function initializeTable() {
    const board = document.createElement('table');
    board.id = 'board';

    for (let rank = 0; rank < 8; rank++) {
        const thisRank = document.createElement('tr');

        for (let file = 0; file < 8; file++) {
            const thisSquare = document.createElement('td');
            thisSquare.id = `${rank}.${file}`;
            thisSquare.onclick = handleSquareClick;

            thisRank.appendChild(thisSquare);
        }

        board.appendChild(thisRank);
    }

    container.appendChild(board);
}

const Pieces = {
    Rook: 'rook', Knight: 'knight', Bishop: 'bishop', King: 'king', Queen: 'queen', Pawn: 'pawn',
};

const Colors = {
    Black: 'black', White: 'white',
};

function getId(rank, file) {
    return `${rank}.${file}`;
}

function getSquare(rank, file) {
    return document.getElementById(getId(rank, file));
}

function getPieceClass(piece, color, isBackRank) {
    if (isBackRank === undefined) {
        return `${piece} ${color}`;
    }

    return `${piece} ${color} ${isBackRank}`;
}

function setPiece(rank, file, piece, color) {
    getSquare(rank, file).className = getPieceClass(piece, color);
}

function getIsBackRank(square) {
    return square.className.split(' ').filter(e => ['true', 'false'].includes(e))[0] === 'true';
}

function getPiece(square) {
    return square.className.split(' ').filter(e => ![Colors.Black, Colors.White].includes(e) && !['true', 'false'].includes(e))[0];
}

function getColor(square) {
    return square.className.split(' ').filter(e => [Colors.Black, Colors.White].includes(e))[0];
}

function getRank(square) {
    return parseInt(square.id.split('.')[0]);
}

function getFile(square) {
    return parseInt(square.id.split('.')[1]);
}

let selectedSquare = null;
let possibleMoves = null;
let lastMoveFrom = null;
let lastMoveTo = null;

let turn = Colors.White;

let whiteKingHasMoved = false;
let whiteLRookHasMoved = false;
let whiteRRookHasMoved = false;

let blackKingHasMoved = false;
let blackLRookHasMoved = false;
let blackRRookHasMoved = false;

function markPossibleMoves(unmark) {
    possibleMoves?.forEach((move) => {
        const square = document.getElementById(move[0]);
        if (unmark) {
            square.classList.remove('candidate');
        } else {
            square.classList.add('candidate');
        }
    });
}

function handleSquareClick(e) {
    const lookupRes = possibleMoves?.find(q => q[0] === e.target.id);
    if (lookupRes) {
        if (selectedSquare) {
            if (lookupRes[1]) {
                document.getElementById(lastMoveTo).className = '';
            }

            lastMoveFrom = selectedSquare.id;
            lastMoveTo = e.target.id;

            selectedSquare.classList.remove('selected');

            if (getPiece(selectedSquare) === Pieces.King) {
                if (turn === Colors.White) {
                    whiteKingHasMoved = true;
                } else {
                    blackKingHasMoved = true;
                }
            }

            function checkTargetForRook(square) {
                if (getPiece(square) === Pieces.Rook) {
                    if (getColor(square) === Colors.White) {
                        if (getRank(square) === 7) {
                            if (getFile(square) === 0) {
                                whiteLRookHasMoved = true;
                            } else if (getFile(square) === 7) {
                                whiteRRookHasMoved = true;
                            }
                        }
                    } else {
                        if (getRank(square) === 0) {
                            if (getFile(square) === 0) {
                                blackLRookHasMoved = true;
                            } else if (getFile(square) === 7) {
                                blackRRookHasMoved = true;
                            }
                        }
                    }
                }
            }

            checkTargetForRook(e.target);
            checkTargetForRook(selectedSquare);

            if (lookupRes[2]) {
                selectedSquare.className = '';
                document.getElementById(e.target.id).className = '';

                const rank = getRank(selectedSquare);
                if (getFile(e.target) === 7) {
                    setPiece(rank, 6, Pieces.King, turn);
                    setPiece(rank, 5, Pieces.Rook, turn);
                } else {
                    setPiece(rank, 2, Pieces.King, turn);
                    setPiece(rank, 3, Pieces.Rook, turn);
                }
            } else {
                const targetSquare = document.getElementById(e.target.id);
                targetSquare.className = getPiece(selectedSquare) === Pieces.Pawn && [0, 7].includes(getRank(targetSquare)) ?
                    getPieceClass(Pieces.Knight, turn) :
                    selectedSquare.className;
                selectedSquare.className = '';
            }

            turn = turn === Colors.White ? Colors.Black : Colors.White;
        }

        selectedSquare.classList.remove('selected');
        markPossibleMoves(true);
        selectedSquare = null;
        possibleMoves = null;
    } else {
        const proposedSquare = document.getElementById(e.target.id);
        if (getPiece(proposedSquare) && getColor(proposedSquare) === turn) {
            selectedSquare?.classList.remove('selected');
            selectedSquare = proposedSquare;
            selectedSquare.classList.add('selected');
            markPossibleMoves(true);
            calculatePossibleMoves();
            markPossibleMoves(false);
        }
    }
}

function calculatePossibleMoves() {
    const piece = getPiece(selectedSquare);
    const color = getColor(selectedSquare);
    const rank = getRank(selectedSquare);
    const file = getFile(selectedSquare);

    possibleMoves = [];

    for (let compRank = 0; compRank < 8; compRank++) {
        for (let compFile = 0; compFile < 8; compFile++) {
            function doesPass() {
                function testAsRook() {
                    if (compRank === rank) {
                        const min = Math.min(compFile, file) + 1;
                        const max = Math.max(compFile, file) - 1;

                        if (min > max) {
                            return true;
                        }

                        for (let newFile = min; newFile <= max; newFile++) {
                            if (getSquare(rank, newFile).className !== '') {
                                return false;
                            }
                        }

                        return true;
                    } else if (compFile === file) {
                        const min = Math.min(compRank, rank) + 1;
                        const max = Math.max(compRank, rank) - 1;

                        if (min > max) {
                            return true;
                        }

                        for (let newRank = min; newRank <= max; newRank++) {
                            if (getSquare(newRank, file).className !== '') {
                                return false;
                            }
                        }

                        return true;
                    }

                    return false;
                }

                function testAsBishop() {
                    if (Math.abs(compRank - rank) === Math.abs(compFile - file)) {
                        const minFile = Math.min(compFile, file) + 1;
                        const maxFile = Math.max(compFile, file) - 1;

                        const compIsMin = minFile === compFile + 1;

                        if (minFile > maxFile) {
                            return true;
                        }

                        const rankDirection = (compIsMin ? (compRank > rank ? -1 : 1) : (rank > compRank ? -1 : 1));

                        let newRank = (compIsMin ? compRank : rank);
                        for (let newFile = minFile; newFile <= maxFile; newFile++) {
                            newRank += rankDirection;
                            if (getSquare(newRank, newFile).className !== '') {
                                return false;
                            }
                        }

                        return true;
                    }

                    return false;
                }

                switch (piece) {
                    case Pieces.King: {
                        const targetSquare = getSquare(compRank, compFile);
                        const targetPiece = getPiece(targetSquare);
                        const targetColor = getColor(targetSquare);

                        if (color === Colors.White && !whiteKingHasMoved && targetPiece === Pieces.Rook && targetColor === Colors.White) {
                            if (!whiteLRookHasMoved && compFile === 0) {
                                return getSquare(7, 1).className === '' && getSquare(7, 2).className === '' && getSquare(7, 3).className === '' ? 3 : false;
                            } else if (!whiteRRookHasMoved && compFile === 7) {
                                return getSquare(7, 5).className === '' && getSquare(7, 6).className === '' ? 3 : false;
                            }
                        } else if (color === Colors.Black && !blackKingHasMoved && targetPiece === Pieces.Rook && targetColor === Colors.Black) {
                            if (!blackLRookHasMoved && compFile === 0) {
                                return getSquare(0, 1).className === '' && getSquare(0, 2).className === '' && getSquare(0, 3).className === '' ? 3 : false;
                            } else if (!blackRRookHasMoved && compFile === 7) {
                                return getSquare(0, 5).className === '' && getSquare(0, 6).className === '' ? 3 : false;
                            }
                        }

                        return Math.abs(compRank - rank) <= 1 && Math.abs(compFile - file) <= 1;
                    }

                    case Pieces.Queen: {
                        return testAsBishop() || testAsRook();
                    }

                    case Pieces.Knight: {
                        if (Math.abs(compRank - rank) === 2 && Math.abs(compFile - file) === 1) {
                            return true;
                        }

                        return Math.abs(compRank - rank) === 1 && Math.abs(compFile - file) === 2;
                    }

                    case Pieces.Bishop: {
                        return testAsBishop();
                    }

                    case Pieces.Rook: {
                        return testAsRook();
                    }

                    case Pieces.Pawn: {
                        const targetHasContents = !!getColor(getSquare(compRank, compFile));
                        const isBackRank = getIsBackRank(selectedSquare);

                        if (!targetHasContents) {
                            if (Math.abs(compFile - file) === 1 && lastMoveFrom && lastMoveTo) {
                                const lastMoveToSquare = document.getElementById(lastMoveTo);
                                const lastMoveFromSquare = document.getElementById(lastMoveFrom);
                                const lastFromFile = getFile(lastMoveFromSquare);
                                const lastFromRank = getRank(lastMoveFromSquare);
                                const lastToFile = getFile(lastMoveToSquare);
                                const lastToRank = getRank(lastMoveToSquare);

                                const lastMovePiece = getPiece(lastMoveToSquare);
                                if (lastMovePiece === Pieces.Pawn && compFile === lastFromFile && lastFromFile === lastToFile) {
                                    if (color === Colors.White) {
                                        if (rank === 4 && [1, 2].includes(lastFromRank) && lastToRank === 4 && compRank === 3) {
                                            return 2;
                                        }

                                        if (rank === 3 && lastFromRank === 1 && lastToRank >= 3 && compRank === 2) {
                                            return 2;
                                        }
                                    } else {
                                        if (rank === 3 && [6, 5].includes(lastFromRank) && lastToRank === 3 && compRank === 4) {
                                            return 2;
                                        }

                                        if (rank === 4 && lastFromRank === 6 && lastToRank <= 4 && compRank === 5) {
                                            return 2;
                                        }
                                    }
                                }

                                return false;
                            }

                            if (color === Colors.White) {
                                if ((rank === 6 || (!isBackRank && rank === 5)) && [3, 4].includes(compRank) && testAsRook()) {
                                    return true;
                                }

                                return (compFile === file && compRank === rank - 1);
                            } else {
                                if ((rank === 1 || (!isBackRank && rank === 2)) && [3, 4].includes(compRank) && testAsRook()) {
                                    return true;
                                }

                                return (compFile === file && compRank === rank + 1);
                            }
                        } else if (Math.abs(compFile - file) === 1) {
                            if (color === Colors.White) {
                                return compRank === rank - 1;
                            } else {
                                return compRank === rank + 1;
                            }
                        }
                    }
                }
            }

            if (!(compRank === rank && compFile === file)) {
                const res = doesPass();
                if (res && (getColor(getSquare(compRank, compFile)) !== color || res === 3)) {
                    possibleMoves.push([getId(compRank, compFile), res === 2, res === 3]);
                }
            }
        }
    }
}

const initialBoardState = [
    [getPieceClass(Pieces.Rook, Colors.Black), getPieceClass(Pieces.Knight, Colors.Black), getPieceClass(Pieces.Bishop, Colors.Black), getPieceClass(Pieces.Queen, Colors.Black), getPieceClass(Pieces.King, Colors.Black), getPieceClass(Pieces.Bishop, Colors.Black), getPieceClass(Pieces.Knight, Colors.Black), getPieceClass(Pieces.Rook, Colors.Black)],
    [getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true), getPieceClass(Pieces.Pawn, Colors.Black, true)],
    [getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false), getPieceClass(Pieces.Pawn, Colors.Black, false)],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    [getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false), getPieceClass(Pieces.Pawn, Colors.White, false)],
    [getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true), getPieceClass(Pieces.Pawn, Colors.White, true)],
    [getPieceClass(Pieces.Rook, Colors.White), getPieceClass(Pieces.Knight, Colors.White), getPieceClass(Pieces.Bishop, Colors.White), getPieceClass(Pieces.Queen, Colors.White), getPieceClass(Pieces.King, Colors.White), getPieceClass(Pieces.Bishop, Colors.White), getPieceClass(Pieces.Knight, Colors.White), getPieceClass(Pieces.Rook, Colors.White)],
];

function initPieces() {
    for (let rank = 0; rank < initialBoardState.length; rank++) {
        const thisRank = initialBoardState[rank];

        for (let file = 0; file < thisRank.length; file++) {
            getSquare(rank, file).className = thisRank[file];
        }
    }
}

initializeTable();
initPieces();