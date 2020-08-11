import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Button } from 'antd';

//单个棋盘格子函数组件
function Square(props) {
    return (
        //监听点击事件传递给父组件，获取父组件传递过来的值，并显示
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

//整个棋盘的组件
class Board extends React.Component {
    //渲染单个棋盘格子函数
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                {
                    //两次循环渲染棋盘格子
                    Array(3).fill(null).map((item, i) => {
                        return (
                            <div className="board-row" key={i}>
                                {Array(3).fill(null).map((item01, j) => {
                                    return this.renderSquare(i * 3 + j)
                                })}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //历史记录数组
            history: [
                {
                    //棋盘的值
                    squares: Array(9).fill(null),
                    //坐标x,y
                    x: 0,
                    y: 0
                }
            ],
            //步数
            stepNumber: 0,
            //X是不是下一个
            xIsNext: true,
            //move是正序还是倒序
            moveOrder: true
        };
    }

    //点击棋盘触发的方法
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        //当胜利或者棋盘当前位置已有值则不实现点击效果
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    x: parseInt(i / 3) + 1,
                    y: i % 3 + 1
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    //点击跳转到相应历史记录步骤
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    reverseOrder() {
        this.setState({
            moveOrder: !this.state.moveOrder,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + " (" + step.x + "," + step.y + ") " :
                'Go to game start';
            const clickBold = this.state.stepNumber === move ? "clickBold" : "";
            return (
                <li key={move}>
                    <Button className={clickBold} onClick={() => this.jumpTo(move)}>{desc}</Button>
                </li>
            );
        });
        //判断是否执行历史记录列表倒序方法
        let moveReverse
        if (this.state.moveOrder) {
            moveReverse = moves
        } else {
            moveReverse = moves.reverse()
        }
        //判断是否有胜出者
        let status;
        if (winner) {
            //有胜出者
            status = "Winner: " + winner.winner;
            //获取胜出的坐标
            for (let i of winner.winnerCoordinate) {
                document.getElementsByClassName('square')[i].style = "color:red;";
            }
        } else {
            //没有胜出者
            if (this.state.history.length > 9) {
                //棋盘已满
                status = "It ends in a draw";
            } else {
                //棋盘未满，还可以进行下一步
                status = "Next player: " + (this.state.xIsNext ? "X" : "O");
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moveReverse}</ol>
                    <Button type="primary" onClick={() => this.reverseOrder()}>{this.state.moveOrder ? "倒序查看历史记录" : "正序查看历史记录"}</Button>
                </div>
            </div>
        );
    }
}
ReactDOM.render(<Game />, document.getElementById("root"));

//判断是否有胜出者函数
function calculateWinner(squares) {
    //胜出的所有可能坐标
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    //根据当前square坐标判断是否有胜出者
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                winnerCoordinate: [a, b, c]
            };
        }
    }
    return null;
}
