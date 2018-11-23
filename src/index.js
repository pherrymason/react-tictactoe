import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let cssClasses = ['square'];
    if (props.winnerCell) {
        cssClasses.push('winner');
    }

    return (
        <button
            className={cssClasses.join(' ')}
            onClick={() => props.onClick()}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, winnerCell) {
        return <Square
            key={'cell-' + i}
            winnerCell={winnerCell}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        const rowLength = 3;
        const cellLength = 3;
        let rows = [];
        for (let r = 0; r < rowLength; r++) {
            let cells = [];
            for (let c = 0; c < cellLength; c++) {
                const coordinate = (r + c) + (r * (cellLength - 1));
                const winnerCell = this.props.winnerCoordinates && this.props.winnerCoordinates.indexOf(coordinate) !== -1;

                cells.push(this.renderSquare(coordinate, winnerCell));
            }
            rows.push(<div key={'row-' + r} className="board-row">{cells}</div>);
        }

        return (
            <div>{rows}</div>
        );
    }
}

class TimeMachine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sort: 'asc'
        };
    }

    onClickSort(event) {
        console.log('click!');
        this.setState({
            sort: this.state.sort === 'asc' ? 'desc' : 'asc'
        });
    }

    renderSnapshot(move, step) {
        const coords = step.coordinates;
        const description = (
            move
                ? 'Go to move #' + move
                : 'Go to game start'
        ) + ', [' + coords[0] + '/' + coords[1] + ']';

        const styles = {
            fontWeight: this.props.stepNumber === move ? 'bold' : 'normal'
        };

        return <li key={move}>
            <button style={styles} onClick={() => this.props.onClick(move)}>{description}</button>
        </li>;
    }

    render() {
        const moves = this.props.history.map((step, move) => {
            return this.renderSnapshot(move, step);
        });

        const reversed = this.state.sort === 'desc';
        let olAttributes = {};
        if (reversed) {
            moves.reverse();
            olAttributes = {
                reversed: 'reversed'
            };
        }
        const sortDescription = this.state.sort === 'asc' ? 'desc' : 'asc';

        return (
            <div>
                <button onClick={() => this.onClickSort()}>{sortDescription}</button>
                <ol {...olAttributes}>{moves}</ol>
            </div>
        )
    }
}


class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coordinates: [null, null]
            }],
            winnerCoordinates: null,
            stepNumber: 0,
            xIsNext: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const y = Math.floor(i / 3);
        const x = (i % 3);
        this.setState({
            history: history.concat([{
                squares: squares,
                coordinates: [y, x],
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerData = calculateWinner(current.squares);

        let status;
        let winnerCoordinates = null;
        if (winnerData) {
            status = 'Winner: ' + winnerData.winner;
            winnerCoordinates = winnerData.coordinates;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        winnerCoordinates={winnerCoordinates}
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <TimeMachine history={history} stepNumber={this.state.stepNumber} onClick={(i) => this.jumpTo(i)}/>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                coordinates: lines[i]
            };
        }
    }
    return null;
}