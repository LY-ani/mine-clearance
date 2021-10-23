function Mine(tr, td, mineNum) {
    this.tr = tr;   //行数
    this.td = td;   //列数
    this.mineNum = mineNum; //雷的数量

    this.squares = [];  //存储所有方块的信息，二维数组，按行与列的顺序排放，存取都使用行列的形式。
    this.tds = [];  //存储所有单元格DOM（二维数组）
    this.surplusMine = mineNum; //剩余的雷数
    this.allRight = false;  //右击标的小红旗是否全是雷，用来判断用户是否游戏成功

    this.parent = document.querySelector('.gameBox');
}
Mine.prototype.randomNum = function () {     //随机n个不重复的数字
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function () { return 0.5 - Math.random() });
    //console.log(square);
    return square.slice(0, this.mineNum);
}
// 初始化
Mine.prototype.init = function () {
    //mine.randomNum();
    var rn = this.randomNum();
    var n = 0;  //用来找到格子对应的索引
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            n++;
            //取方块在数组的数据使用行与列的形式去取，
            //取方块周围的方块用坐标的形式去取，
            //行列与坐标的x,y相反
            if (rn.indexOf(n) != -1) {
                //条件成立，该索引对应的格子为雷
                this.squares[i][j] = { type: 'mine', x: j, y: i };
            } else {
                this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }
    }

    //console.log(this.squares);
    this.updateNum();
    mine.createDom();
    // 阻止右击事件
    this.parent.oncontextmenu = function () {
        return false;
    }
    // 剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
}
// 创建表格
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {    //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for (var j = 0; j < this.td; j++) {    //列
            var domTd = document.createElement('td');
            //domTd.innerHTML = 0;
            domTd.pos = [i, j];   //把格子对应的行与列存起来，
            domTd.onmousedown = function () {
                This.play(event, this);
            }

            this.tds[i][j] = domTd;   //把所有创建的td添加到数组中

            /* if (this.squares[i][j].type == 'mine') {
                domTd.className = 'mine';
            }
            if (this.squares[i][j].type == 'number') {
                domTd.innerHTML = this.squares[i][j].value;
            } */

            domTr.appendChild(domTd);   //把列添加到行中
        }
        table.appendChild(domTr);   //把创建的二维数组添加到表格中
    }
    this.parent.innerHTML = '';     //避免多次点击创建多个表
    this.parent.appendChild(table);   //把创建的表格添加到界面
}
// 找某格子周围的8个格子  传入雷的位置
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = [];
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (     //排除不需要的格子
                i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                (i == x && j == y) ||
                this.squares[j][i].type == 'mine'
            ) {
                continue;
            }
            result.push([j, i]);
        }
    }
    return result;
}
// 更新所有数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;

            }
        }
    }
}
Mine.prototype.play = function (e, obj) {
    var This = this;
    if (e.which == 1 && obj.className != 'flag') {
        // console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        if (curSquare.type == 'number') {
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if (curSquare.value == 0) {   //点到0
                // 用递归来显示一大片0

                obj.innerHTML = '';
                function getAllZero(square) {
                    var around = This.getAround(square);
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];
                        var y = around[i][1];
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) {
                            if (!This.tds[x][y].check) {
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            this.gameOver(obj);
        }
    }
    if (e.which == 3) {
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';
        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;
        } else {
            this.allRight = false;
        }
        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if (this.surplusMine == 0) {
            if (this.allRight) {
                // alert('恭喜你，游戏通过');
                window.setTimeout("alert('恭喜你，游戏通过')", 200);

            } else {
                this.gameOver();
            }
        }

    }

}
Mine.prototype.gameOver = function (clickTd) {

    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) {
        clickTd.style.backgroundColor = '#f00';
    }
    // alert('游戏失败');
    window.setTimeout("alert('游戏失败')", 200);
}

var btns = document.querySelectorAll('.level button');
var mine = null;
var ln = 0;
var level = 0;
var arr = [[9, 9, 10], [16, 16, 49], [28, 28, 99]];

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {
        level = i;
        btns[ln].className = '';
        this.className = 'active';
        // mine = new Mine(arr[i][0],arr[i][1],arr[i][2]);
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick();
btns[3].onclick = function () {
    mine = new Mine(arr[level][0], arr[level][1], arr[level][2]);
    // console.log(arr[level]);
    mine.init();
}


// var mine = new Mine(28, 28, 99);
/* var mine = new Mine(10, 10, 9);
mine.init(); */
//console.log(mine.getAround(mine.squares[5][1]));