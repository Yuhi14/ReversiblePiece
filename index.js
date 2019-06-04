//広域関数
var WeightData = [
    [30, -12, 0, -1, -1, 0, -12, 30],
    [-12, -15, -3, -3, -3, -3, -15, -12],
    [0, -3, 0, -1, -1, 0, -3, 0],
    [-1, -3, -1, -1, -1, -1, -3, -1],
    [-1, -3, -1, -1, -1, -1, -3, -1],
    [0, -3, 0, -1, -1, 0, -3, 0],
    [-12, -15, -3, -3, -3, -3, -15, -12],
    [30, -12, 0, -1, -1, 0, -12, 30]
];
var BLACK = 1;
var WHITE = 2;
var data = [];
var myTurn = false;

//初期化関数
function init() {
    var b = document.getElementById("board");
    for (var i = 0; i < 8; i++) {
        var tr = document.createElement("tr");
        data[i] = [0, 0, 0, 0, 0, 0, 0, 0];

        for (var j = 0; j < 8; j++) {
            var td = document.createElement("td");
            td.className = "cell";
            td.id = "cell" + i + j;
            td.onclick = clicked;
            tr.appendChild(td);
        };
        b.appendChild(tr);

    };

    put(3, 3, BLACK);
    put(4, 4, BLACK);
    put(3, 4, WHITE);
    put(4, 3, WHITE);
    update();
};

function update() {
    var numWhite = 0;     //盤上の白石のカウンター
    var numBlack = 0;     //盤上の黒石のカウンター

    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {

            //すべてのマスを確認して石が置かれていたらそれぞれのカウンターに足す
            if (data[x][y] == WHITE) {
                numWhite++;
            };
            if (data[x][y] == BLACK) {
                numBlack++;
            };
        };
    };

    //HTML上のカウンターに盤上の石の数を出力
    document.getElementById("numBlack").textContent = numBlack;
    document.getElementById("numWhite").textContent = numWhite;

    //自分の石で挟んだ相手の石があるかどうかをTrueかFalseで収得
    var blackFlip = canFlip(BLACK);
    var whiteFlip = canFlip(WHITE);

    //マス全部に石が置かれた場合またはお互いに相手の石を挟めない場合
    if (numWhite + numBlack == 64 || (!blackFlip && !whiteFlip)) {
        showMessage1("GAME OVER");

        //プレイヤーが相手の石を挟めない場合
    } else if (!blackFlip) {
        showMessage2("Player Skip");
        myTurn = false;

        //コンピューターが相手の石を挟めない場合
    } else if (!whiteFlip) {
        showMessage2("Computer Skip");
        myTurn = true;

        //上記に当てはまらなかった場合、コンピューターのターンに変更
    } else {
        myTurn = !myTurn;
    };

    //コンピューターのターンになった場合、指定の時間待ってからコンピュータのターンを実行
    if (!myTurn) {
        setTimeout(think, 1000);
    };
};

function showMessage1(str) {
    //各メッセージをHTML上に出力
    document.getElementById("message").textContent = str;
};

function showMessage2(str) {
    //各メッセージをHTML上に出力
    document.getElementById("message").textContent = str;

    //指定の時間待ってからHTML上に出力したメッセージを消去
    setTimeout(function () {
        document.getElementById("message").textContent = "";
    }, 2000);
};

function clicked(e) {
    if (!myTurn) {
        return;
    }
    //クリックしたマスのidを収得
    var id = e.target.id;

    //収得したマスのidの中の座標の部分だけを抽出、さらに文字列から数値に変換
    var i = parseInt(id.charAt(4));
    var j = parseInt(id.charAt(5));

    //プレイヤーの石で挟んだコンピューターの石の座標が入った配列を取得
    var flipped = getFlipCells(i, j, BLACK);

    if (flipped.length > 0) {
        for (var k = 0; k < flipped.length; k++) {
            //プレイヤーの石で挟んだコンピュータ－の石を自分の石に置き換える処理
            put(flipped[k][0], flipped[k][1], BLACK);
        };
        //プレイヤーが自分の石を置く処理
        put(i, j, BLACK);

        update();
    };
    console.log(e.target.id);
    console.log(i);
    console.log(j);
};

function put(i, j, color) {
    var c = document.getElementById("cell" + i + j);
    c.textContent = "●";
    // var a = document.write('<img class="type1" src="img/ダースベイダー.png" alt=""></img>');

    // c.appendChild(a);
    c.className = "cell " + (color == BLACK ? "black" : "white");
    data[i][j] = color;
};

//コンピューター思考
function think() {
    var highScore = -1000;
    var px = -1;
    var py = -1;
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {

            //盤上の全座標を取得
            var tmpData = copyData();


            //コンピューターの石が挟んでいるプレイヤーの石の座標が入った配列を取得
            var flipped = getFlipCells(x, y, WHITE);


            if (flipped.length > 0) {
                for (var i = 0; i < flipped.length; i++) {
                    var p = flipped[i][0];
                    var q = flipped[i][1];

                    // コンピューターが石を置いたマスの座標とそれによって挟めるプレイヤーの
                    // 石があるマスの座標にWHITEを代入
                    tmpData[p][q] = WHITE;
                    tmpData[x][y] = WHITE;
                };
                var score = calcWeightData(tmpData);
                if (score > highScore) {
                    highScore = score;
                    px = x;
                    py = y;
                };
            };
        };
    };
    console.log(tmpData);
    if (px >= 0 && py >= 0) {
        var flipped = getFlipCells(px, py, WHITE);
        if (flipped.length > 0) {
            for (var k = 0; k < flipped.length; k++) {
                put(flipped[k][0], flipped[k][1], WHITE);
            };
        };
        put(px, py, WHITE);
    };
    update();
};

function calcWeightData(tmpData) {
    var score = 0;
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {
            if (tmpData[x][y] == WHITE) {
                score += WeightData[x][y];
            };
        };
    };
    return score;
};


function copyData() {
    var tmpData = [];
    for (var x = 0; x < 8; x++) {
        tmpData[x] = [];
        for (var y = 0; y < 8; y++) {
            tmpData[x][y] = data[x][y];
        };
    };
    return tmpData;

};

function canFlip(color) {
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {

            //自分の石で挟んだ相手の石の座標が入った配列を収得
            var flipped = getFlipCells(x, y, color);
            //配列の中身が0じゃない場合、つまり自分の石で挟んだ相手の石がある場合
            if (flipped.length > 0) {
                return true;
            };
        };
    };
    return false;
};

function getFlipCells(i, j, color) {

    //石を置こうとしているマスに既に石が置いてある場合
    if (data[i][j] == BLACK || data[i][j] == WHITE) {
        return [];
    };

    //石を置こうとしているマスに石が置かれていない場合
    //石を置くマスの周りのマスの座標を配列に挿入
    var dirs = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    var result = [];

    for (var p = 0; p < dirs.length; p++) {
        var flipped = getFlipCellsOneDir(i, j, dirs[p][0], dirs[p][1], color);

        //getFlipCellsOneDir関数の返り値で戻ってきた配列をresultの配列に結合
        result = result.concat(flipped);
    };
    return result;
};

function getFlipCellsOneDir(i, j, dx, dy, color) {

    //石を置くマスの周りのマスの座標をx,yで定義
    var x = i + dx;
    var y = j + dy;

    var fliped = [];

    //石を置くマスの周りのマスが盤外・同じ色の石がある・石が置かれていない場合
    if (x < 0 || y < 0 || x > 7 || y > 7 || data[x][y] == color || data[x][y] == 0) {
        return [];
    };

    //石を置くマスの周りのマスに相手の石が置かれている場合、配列にそこの座標を追加
    fliped.push([x, y]);

    //石を置くマスの周りのマスに相手の石が置かれていた場合のその方向への繰り返し処理
    while (true) {
        x += dx;
        y += dy;

        //先のマスが盤外または石が置かれていなかった場合
        if (x < 0 || y < 0 || x > 7 || y > 7 || data[x][y] == 0) {
            return [];
        };

        //先のマスに自分の石が置かれていた場合（相手の石を挟むことに成功）
        if (data[x][y] == color) {
            return fliped;

            //先のマスにまた相手の石があった場合、配列に座標を追加してさらに繰り返し処理でその先のマスを調査
        } else {
            fliped.push([x, y]);
        };
    };
};